import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Trash2, UserPlus, Search, AlertCircle } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/projects/$projectId")({
  component: ProjectDetail,
});

type Task = {
  id: string; title: string; description: string | null;
  status: "todo" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date: string | null; assigned_to: string | null;
};

function ProjectDetail() {
  const { projectId } = useParams({ from: "/_authenticated/projects/$projectId" });
  const { user } = useAuth();
  const qc = useQueryClient();
  const [taskOpen, setTaskOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "todo" | "in_progress" | "completed">("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"due" | "priority">("due");

  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").eq("id", projectId).single();
      if (error) throw error;
      return data;
    },
  });

  const isOwner = project?.owner_id === user?.id;

  const { data: tasks } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").eq("project_id", projectId);
      if (error) throw error;
      return data as Task[];
    },
  });

  const { data: members } = useQuery({
    queryKey: ["members", projectId],
    queryFn: async () => {
      const { data: pm } = await supabase.from("project_members").select("user_id").eq("project_id", projectId);
      const ids = [...new Set([project?.owner_id, ...(pm?.map((m) => m.user_id) ?? [])].filter(Boolean) as string[])];
      if (!ids.length) return [];
      const { data: profiles } = await supabase.from("profiles").select("id, name, email").in("id", ids);
      return profiles ?? [];
    },
    enabled: !!project,
  });

  const today = new Date().toISOString().slice(0, 10);
  const priorityRank = { high: 0, medium: 1, low: 2 } as const;
  const filteredTasks = (tasks ?? [])
    .filter((t) => filter === "all" || t.status === filter)
    .filter((t) => !search || t.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === "due"
      ? (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999")
      : priorityRank[a.priority] - priorityRank[b.priority]);

  const onCreateTask = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.from("tasks").insert({
      project_id: projectId,
      title: String(fd.get("title")),
      description: String(fd.get("description") || ""),
      priority: fd.get("priority") as "low" | "medium" | "high",
      due_date: (fd.get("due_date") as string) || null,
      assigned_to: (fd.get("assigned_to") as string) || null,
      created_by: user!.id,
    });
    if (error) return toast.error(error.message);
    toast.success("Task created");
    setTaskOpen(false);
    qc.invalidateQueries({ queryKey: ["tasks", projectId] });
  };

  const updateStatus = async (id: string, status: Task["status"]) => {
    const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["tasks", projectId] });
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Task deleted");
    qc.invalidateQueries({ queryKey: ["tasks", projectId] });
  };

  const onAddMember = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email")).trim().toLowerCase();
    const { data: profile } = await supabase.from("profiles").select("id").eq("email", email).maybeSingle();
    if (!profile) return toast.error("No user found with that email. They must sign up first.");
    const { error } = await supabase.from("project_members").insert({ project_id: projectId, user_id: profile.id });
    if (error) return toast.error(error.message);
    toast.success("Member added");
    setMemberOpen(false);
    qc.invalidateQueries({ queryKey: ["members", projectId] });
  };

  const removeMember = async (uid: string) => {
    const { error } = await supabase.from("project_members").delete().eq("project_id", projectId).eq("user_id", uid);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["members", projectId] });
  };

  if (!project) return <div className="p-8">Loading…</div>;

  return (
    <div className="container mx-auto max-w-7xl p-6 md:p-8">
      <Link to="/projects" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All projects
      </Link>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{project.title}</h1>
          <p className="mt-1 text-muted-foreground">{project.description}</p>
          {project.deadline && <Badge className="mt-2" variant="outline">Deadline: {project.deadline}</Badge>}
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <Dialog open={memberOpen} onOpenChange={setMemberOpen}>
              <DialogTrigger asChild><Button variant="outline"><UserPlus className="mr-2 h-4 w-4" /> Add member</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add team member</DialogTitle></DialogHeader>
                <form onSubmit={onAddMember} className="space-y-4">
                  <div><Label>User email</Label><Input name="email" type="email" required /></div>
                  <DialogFooter><Button type="submit">Add</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
              <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> New task</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create task</DialogTitle></DialogHeader>
                <form onSubmit={onCreateTask} className="space-y-4">
                  <div><Label>Title</Label><Input name="title" required /></div>
                  <div><Label>Description</Label><Textarea name="description" rows={2} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Priority</Label>
                      <Select name="priority" defaultValue="medium">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>Due date</Label><Input name="due_date" type="date" /></div>
                  </div>
                  <div>
                    <Label>Assign to</Label>
                    <Select name="assigned_to">
                      <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                      <SelectContent>
                        {members?.map((m) => <SelectItem key={m.id} value={m.id}>{m.name || m.email}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter><Button type="submit">Create</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="todo">To do</TabsTrigger>
                <TabsTrigger value="in_progress">In progress</TabsTrigger>
                <TabsTrigger value="completed">Done</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search tasks…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as "due" | "priority")}>
              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="due">Sort: Due date</SelectItem>
                <SelectItem value="priority">Sort: Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {filteredTasks.length === 0 ? (
              <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No tasks match your filters.</CardContent></Card>
            ) : filteredTasks.map((t) => {
              const overdue = t.due_date && t.due_date < today && t.status !== "completed";
              const assignee = members?.find((m) => m.id === t.assigned_to);
              const canUpdate = isOwner || t.assigned_to === user?.id;
              return (
                <Card key={t.id} style={{ boxShadow: "var(--shadow-card)" }}>
                  <CardContent className="flex flex-wrap items-center gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{t.title}</h3>
                        <Badge variant={t.priority === "high" ? "destructive" : t.priority === "medium" ? "default" : "secondary"} className="text-xs">{t.priority}</Badge>
                        {overdue && <Badge variant="destructive" className="gap-1 text-xs"><AlertCircle className="h-3 w-3" />Overdue</Badge>}
                      </div>
                      {t.description && <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{t.description}</p>}
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {t.due_date && <span>Due {t.due_date}</span>}
                        {assignee && <span>· {assignee.name || assignee.email}</span>}
                      </div>
                    </div>
                    <Select value={t.status} onValueChange={(v) => updateStatus(t.id, v as Task["status"])} disabled={!canUpdate}>
                      <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To do</SelectItem>
                        <SelectItem value="in_progress">In progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    {isOwner && (
                      <Button variant="ghost" size="icon" onClick={() => deleteTask(t.id)}><Trash2 className="h-4 w-4" /></Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Team ({members?.length ?? 0})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {members?.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-2 rounded-md p-2 hover:bg-muted">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {(m.name || m.email)[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{m.name || m.email}</p>
                    {m.id === project.owner_id && <span className="text-xs text-muted-foreground">Owner</span>}
                  </div>
                </div>
                {isOwner && m.id !== project.owner_id && (
                  <Button variant="ghost" size="icon" onClick={() => removeMember(m.id)}><Trash2 className="h-4 w-4" /></Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
