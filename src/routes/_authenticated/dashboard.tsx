import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FolderKanban, ListTodo, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — Flowboard" }] }),
});

function Dashboard() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [projectsRes, tasksRes] = await Promise.all([
        supabase.from("projects").select("id"),
        supabase.from("tasks").select("id, status, due_date"),
      ]);
      const tasks = tasksRes.data ?? [];
      const today = new Date().toISOString().slice(0, 10);
      return {
        projects: projectsRes.data?.length ?? 0,
        total: tasks.length,
        completed: tasks.filter((t) => t.status === "completed").length,
        inProgress: tasks.filter((t) => t.status === "in_progress").length,
        todo: tasks.filter((t) => t.status === "todo").length,
        overdue: tasks.filter((t) => t.due_date && t.due_date < today && t.status !== "completed").length,
      };
    },
  });

  const s = stats ?? { projects: 0, total: 0, completed: 0, inProgress: 0, todo: 0, overdue: 0 };
  const completion = s.total ? Math.round((s.completed / s.total) * 100) : 0;
  const chartData = [
    { name: "Completed", value: s.completed, color: "oklch(0.65 0.16 155)" },
    { name: "In Progress", value: s.inProgress, color: "oklch(0.55 0.22 265)" },
    { name: "To Do", value: s.todo, color: "oklch(0.7 0.03 260)" },
  ];

  const cards = [
    { label: "Projects", value: s.projects, icon: FolderKanban, color: "text-primary" },
    { label: "Total Tasks", value: s.total, icon: ListTodo, color: "text-primary" },
    { label: "Completed", value: s.completed, icon: CheckCircle2, color: "text-success" },
    { label: "Overdue", value: s.overdue, icon: AlertTriangle, color: "text-destructive" },
  ];

  return (
    <div className="container mx-auto max-w-7xl p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">An overview of your projects and tasks</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="transition-all hover:scale-[1.02]" style={{ boxShadow: "var(--shadow-card)" }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Task status breakdown</CardTitle></CardHeader>
          <CardContent>
            {s.total === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">No tasks yet. Create a project to get started.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                    {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Overall completion</CardTitle></CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{completion}%</div>
            <Progress value={completion} className="mt-3" />
            <div className="mt-6 space-y-3">
              <Stat icon={Clock} label="In progress" value={s.inProgress} />
              <Stat icon={ListTodo} label="To do" value={s.todo} />
              <Stat icon={CheckCircle2} label="Completed" value={s.completed} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-muted-foreground"><Icon className="h-4 w-4" /> {label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
