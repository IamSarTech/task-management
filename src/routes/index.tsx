import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Users, BarChart3, Shield, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Flowboard — Modern Project Management" },
      { name: "description", content: "Plan projects, assign tasks, and ship together. Role-based access, dashboards, and team collaboration." },
    ],
  }),
});

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-subtle)" }}>
      <header className="container mx-auto flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg" style={{ background: "var(--gradient-primary)" }} />
          <span className="text-xl font-bold">Flowboard</span>
        </div>
        <div className="flex gap-2">
          <Link to="/login"><Button variant="ghost">Sign in</Button></Link>
          <Link to="/signup"><Button>Get started</Button></Link>
        </div>
      </header>

      <main className="container mx-auto px-6 pt-16 pb-24 text-center">
        <h1 className="mx-auto max-w-3xl text-5xl font-bold tracking-tight md:text-6xl">
          Project management that <span style={{ background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>actually flows</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Plan projects, assign tasks with priorities and deadlines, and track team progress in real time — with secure role-based access.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/signup"><Button size="lg" className="gap-2">Start for free <ArrowRight className="h-4 w-4" /></Button></Link>
          <Link to="/login"><Button size="lg" variant="outline">Sign in</Button></Link>
        </div>

        <div className="mx-auto mt-20 grid max-w-5xl gap-6 md:grid-cols-4">
          {[
            { icon: Shield, title: "RBAC", desc: "Admin & member roles enforced at the database." },
            { icon: Users, title: "Teams", desc: "Add members and collaborate on projects." },
            { icon: CheckCircle2, title: "Tasks", desc: "Priorities, statuses, due dates, and filters." },
            { icon: BarChart3, title: "Dashboards", desc: "Track progress and overdue work at a glance." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-6 text-left" style={{ boxShadow: "var(--shadow-card)" }}>
              <f.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
