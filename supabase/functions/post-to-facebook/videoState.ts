export function isVideoPublished(data: any): boolean {
  return data?.published === true && data?.status?.video_status === "ready" &&
    data?.status?.publishing_phase?.status === "complete";
}

export function amsterdamDay(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}