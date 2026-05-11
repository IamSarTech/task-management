import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Calendar, ArrowRight } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/projects/")({
  component: ProjectsPage,
  head: () => ({ meta: [{ title: "Projects — Flowboard" }] }),
});

function ProjectsPage() {
  const { role, user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*, tasks(id, status)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const onCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.from("projects").insert({
      title: String(fd.get("title")),
      description: String(fd.get("description") || ""),
      deadline: (fd.get("deadline") as string) || null,
      owner_id: user!.id,
    });
    if (error) return toast.error(error.message);
    toast.success("Project created");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["projects"] });
  };

  return (
    <div className="container mx-auto max-w-7xl p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Plan and track your team's work</p>
        </div>
        {role === "admin" && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> New project</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create project</DialogTitle></DialogHeader>
              <form onSubmit={onCreate} className="space-y-4">
                <div><Label>Title</Label><Input name="title" required /></div>
                <div><Label>Description</Label><Textarea name="description" rows={3} /></div>
                <div><Label>Deadline</Label><Input name="deadline" type="date" /></div>
                <DialogFooter><Button type="submit">Create</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : !projects?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No projects yet.</p>
            {role !== "admin" && <p className="mt-2 text-sm text-muted-foreground">Ask an admin to add you to a project.</p>}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const tasks = (p.tasks as { status: string }[] | null) ?? [];
            const done = tasks.filter((t) => t.status === "completed").length;
            const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
            return (
              <Card key={p.id} className="group transition-all hover:scale-[1.01]" style={{ boxShadow: "var(--shadow-card)" }}>
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-2">
                    <span className="truncate">{p.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="line-clamp-2 text-sm text-muted-foreground min-h-[2.5rem]">{p.description || "No description"}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{tasks.length} tasks · {pct}% done</span>
                    {p.deadline && (
                      <Badge variant="outline" className="gap-1"><Calendar className="h-3 w-3" />{p.deadline}</Badge>
                    )}
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full" style={{ width: `${pct}%`, background: "var(--gradient-primary)" }} />
                  </div>
                  <Link to="/projects/$projectId" params={{ projectId: p.id }}>
                    <Button variant="ghost" size="sm" className="w-full justify-between">Open <ArrowRight className="h-4 w-4" /></Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
