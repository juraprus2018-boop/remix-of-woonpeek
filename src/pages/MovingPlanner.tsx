import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "@/lib/router-compat";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_MOVING_TASKS, taskDueDate } from "@/lib/movingPlanner";

const fmt = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString("nl-NL", { day: "numeric", month: "long" });

const MovingPlanner = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [newTask, setNewTask] = useState("");
  const [newDays, setNewDays] = useState("7");
  const key = ["moving-planner", user?.id];
  const onError = () => toast.error("Opslaan lukte niet, probeer het opnieuw.");

  const { data, isLoading } = useQuery({
    queryKey: key,
    enabled: !!user,
    queryFn: async () => {
      const [plan, tasks] = await Promise.all([
        supabase.from("moving_plans").select("*").maybeSingle(),
        supabase.from("moving_tasks").select("*").order("days_before", { ascending: false }).order("created_at"),
      ]);
      if (plan.error) throw plan.error;
      if (tasks.error) throw tasks.error;
      return { movingDate: plan.data?.moving_date ?? null, tasks: tasks.data };
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: key });

  const setDate = useMutation({
    mutationFn: async (moving_date: string | null) => {
      const { error } = await supabase.from("moving_plans").upsert({ user_id: user!.id, moving_date, updated_at: new Date().toISOString() });
      if (error) throw error;
      if (moving_date && data && data.tasks.length === 0) {
        const { error: e2 } = await supabase.from("moving_tasks").insert(DEFAULT_MOVING_TASKS.map((t) => ({ ...t, user_id: user!.id })));
        if (e2) throw e2;
      }
    },
    onSuccess: refresh, onError,
  });
  const addTask = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("moving_tasks").insert({ user_id: user!.id, title: newTask.trim(), days_before: Math.max(0, parseInt(newDays, 10) || 0) });
      if (error) throw error;
    },
    onSuccess: () => { setNewTask(""); refresh(); }, onError,
  });
  const toggle = useMutation({
    mutationFn: async (v: { id: string; done: boolean }) => {
      const { error } = await supabase.from("moving_tasks").update({ done: v.done }).eq("id", v.id);
      if (error) throw error;
    },
    onSuccess: refresh, onError,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("moving_tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh, onError,
  });

  const done = data?.tasks.filter((t) => t.done).length ?? 0;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container flex-1 py-8">
        <h1 className="font-display text-3xl font-bold">Mijn verhuisplanner</h1>
        <p className="mt-2 text-muted-foreground">Kies je verhuisdatum. Elke taak krijgt automatisch een deadline die terugrekent vanaf die dag.</p>

        {!user ? (
          <p className="mt-6"><Link to="/login" className="font-semibold text-primary underline">Log in</Link> om je verhuizing te plannen.</p>
        ) : isLoading ? <div className="mt-6 h-24 animate-pulse rounded-xl border bg-card" /> : (
          <>
            <div className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
              <label className="text-sm font-medium">
                Verhuisdatum
                <Input type="date" className="mt-1" defaultValue={data?.movingDate ?? ""} onChange={(e) => setDate.mutate(e.target.value || null)} aria-label="Verhuisdatum" />
              </label>
              {data && data.tasks.length > 0 && <p className="text-sm text-muted-foreground">{done} van {data.tasks.length} taken klaar</p>}
            </div>

            {data?.movingDate ? (
              <>
                <ul className="mt-6 space-y-2">
                  {data.tasks.map((t) => {
                    const due = taskDueDate(data.movingDate!, t.days_before);
                    const late = !t.done && due < today;
                    return (
                      <li key={t.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
                        <input type="checkbox" className="h-5 w-5 accent-primary" checked={t.done} aria-label={t.title} onChange={(e) => toggle.mutate({ id: t.id, done: e.target.checked })} />
                        <span className={t.done ? "flex-1 text-muted-foreground line-through" : "flex-1"}>{t.title}</span>
                        <span className={late ? "text-sm font-semibold text-destructive" : "text-sm text-muted-foreground"}>{late ? "Te laat: " : ""}{fmt(due)}</span>
                        <Button variant="ghost" size="icon" aria-label="Taak verwijderen" onClick={() => remove.mutate(t.id)}><Trash2 className="h-4 w-4" /></Button>
                      </li>
                    );
                  })}
                </ul>
                <form className="mt-4 grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[3fr_1fr_auto]" onSubmit={(e) => { e.preventDefault(); if (newTask.trim()) addTask.mutate(); }}>
                  <Input placeholder="Eigen taak, bijv. buren gedag zeggen" value={newTask} onChange={(e) => setNewTask(e.target.value)} aria-label="Nieuwe taak" />
                  <Input type="number" min={0} value={newDays} onChange={(e) => setNewDays(e.target.value)} aria-label="Dagen voor verhuizing" />
                  <Button type="submit">Taak toevoegen</Button>
                </form>
              </>
            ) : <p className="mt-6 text-muted-foreground">Kies eerst een datum, dan zetten we een startlijst met taken voor je klaar.</p>}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MovingPlanner;
