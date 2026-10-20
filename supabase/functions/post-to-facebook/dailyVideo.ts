import { amsterdamDay, isVideoPublished } from "./videoState.ts";

const GRAPH = "https://graph.facebook.com/v21.0";
const RENDER = "https://api.shotstack.io/edit/v1";
const fields = "id,status,published,permalink_url,from";

async function request(url: string, init: RequestInit) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(45000) });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(`Provider [${res.status}]: ${JSON.stringify(data)}`);
  return data;
}

export async function dailyVideo(sb: any, token: string, caption: (p: any) => string, options: Record<string, unknown>) {
  const day = amsterdamDay();
  const { data: existing, error } = await sb.from("facebook_video_jobs").select("*").eq("day", day).maybeSingle();
  if (error) throw error;
  let job = existing;
  const save = async (values: Record<string, unknown>) => {
    const { error } = await sb.from("facebook_video_jobs").update({ ...values, updated_at: new Date().toISOString() }).eq("day", day);
    if (error) throw error;
    job = { ...job, ...values };
  };

  // Reconcile existing remote IDs before any new write, including after a timeout.
  if (job?.video_id) {
    const data = await request(`${GRAPH}/${job.video_id}?fields=${fields}`, { headers: { Authorization: `Bearer ${token}` } });
    if (data.from?.id !== "1254508837756387") throw new Error("Video belongs to another page");
    if (isVideoPublished(data)) {
      await save({ status: "published", permalink_url: data.permalink_url, details: data.status });
      const { error } = await sb.from("properties").update({ facebook_posted_at: new Date().toISOString() }).eq("id", job.property_id);
      if (error) throw error;
      return { success: true, status: "published", video_id: job.video_id, permalink_url: data.permalink_url };
    }
    await save({ status: "processing", details: data.status });
    return { success: false, status: "processing", video_id: job.video_id, details: data.status };
  }
  if (!job && options.video_check === true) return { success: false, status: "no_job" };
  if (!job) {
    const { data: candidates, error } = await sb.from("properties")
      .select("*").eq("status", "actief").eq("listing_type", "huur")
      .is("facebook_posted_at", null).order("created_at", { ascending: false }).limit(50);
    if (error) throw error;
    const prop = candidates?.find((p: any) => new Set((p.images || []).filter((u: string) => /^https:\/\//.test(u))).size >= 4);
    if (!prop) throw new Error("Geen huurwoning met minimaal vier foto's beschikbaar");
    const { error: insertError } = await sb.from("facebook_video_jobs").insert({ day, property_id: prop.id, status: "claimed" });
    if (insertError?.code === "23505") return { success: false, status: "already_claimed" };
    if (insertError) throw insertError;
    job = { day, property_id: prop.id, status: "claimed" };
  }

  const { data: prop, error: propError } = await sb.from("properties").select("*").eq("id", job.property_id).single();
  if (propError) throw propError;
  const key = Deno.env.get("SHOTSTACK_API_KEY");
  if (!key && !job.video_url) throw new Error("SHOTSTACK_API_KEY ontbreekt");
  if (!job.render_id && !job.video_url) {
    if (job.status !== "claimed") return { success: false, status: job.status, error: "Onzekere upload: controle vereist voordat opnieuw wordt geprobeerd" };
    // Claim the remote write atomically. Unknown outcomes never trigger blind retries.
    const { data: claim, error } = await sb.from("facebook_video_jobs").update({ status: "render_submitting" }).eq("day", day).eq("status", "claimed").select("day");
    if (error) throw error;
    if (!claim?.length) return { success: false, status: "busy" };
    const photos = [...new Set<string>((prop.images || []).filter((u: string) => /^https:\/\//.test(u)))].slice(0, 10);
    const label = `${prop.city} | € ${Number(prop.price).toLocaleString("nl-NL")} per maand`;
    let render;
    try { render = await request(`${RENDER}/render`, {
      method: "POST", headers: { "x-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({ timeline: { tracks: [
        { clips: [{ asset: { type: "title", text: `${label}\nWoonaanbod NL`, style: "minimal" }, start: 0, length: photos.length * 3, position: "bottom" }] },
        { clips: photos.map((src, i) => ({ asset: { type: "image", src }, start: i * 3, length: 3, fit: "cover", effect: "zoomIn", transition: { in: "fade", out: "fade" } })) },
      ] }, output: { format: "mp4", resolution: "1080", aspectRatio: "9:16", fps: 30 } }),
    }); } catch (error) {
      await save({ status: "render_blocked", details: { error: String(error) } });
      throw error;
    }
    if (!render.success || !render.response?.id) throw new Error("Render returned no ID");
    await save({ render_id: render.response.id, status: "rendering" });
  }
  if (!job.video_url) {
    // Bounded waits fit within the function lifetime; later daily checks resume the same render.
    for (const wait of [0, 10000, 20000, 40000]) {
      if (wait) await new Promise(r => setTimeout(r, wait));
      const data = await request(`${RENDER}/render/${job.render_id}`, { headers: { "x-api-key": key } });
      if (data.response?.status === "failed") { await save({ status: "failed", details: data.response }); return { success: false, status: "failed" }; }
      if (data.response?.status === "done" && data.response.url) { await save({ video_url: data.response.url, status: "rendered" }); break; }
    }
    if (!job.video_url) return { success: false, status: "rendering", render_id: job.render_id };
  }
  const { data: claim, error: claimError } = await sb.from("facebook_video_jobs").update({ status: "upload_submitting" }).eq("day", day).eq("status", "rendered").select("day");
  if (claimError) throw claimError;
  if (!claim?.length) return { success: false, status: job.status };
  const data = await request(`${GRAPH}/1254508837756387/videos`, {
    method: "POST", headers: { Authorization: `Bearer ${token}` },
    body: new URLSearchParams({ file_url: job.video_url, title: `Huurwoning in ${prop.city}`, description: caption(prop), published: "true" }),
  });
  if (!data.id) throw new Error("Facebook returned no video ID");
  await save({ video_id: data.id, status: "processing" });
  return { success: false, status: "processing", video_id: data.id };
}