import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/team")({
  component: TeamPage,
  head: () => ({ meta: [{ title: "Team — Flowboard" }] }),
});

function TeamPage() {
  const { data: people } = useQuery({
    queryKey: ["team"],
    queryFn: async () => {
      // Members of any project the user can see
      const { data: pm } = await supabase.from("project_members").select("user_id, project_id");
      const { data: projects } = await supabase.from("projects").select("id, title, owner_id");
      const userIds = new Set<string>();
      pm?.forEach((m) => userIds.add(m.user_id));
      projects?.forEach((p) => userIds.add(p.owner_id));
      if (!userIds.size) return [];
      const { data: profiles } = await supabase.from("profiles").select("id, name, email").in("id", [...userIds]);
      const { data: roles } = await supabase.from("user_roles").select("user_id, role").in("user_id", [...userIds]);
      return (profiles ?? []).map((p) => ({
        ...p,
        role: roles?.find((r) => r.user_id === p.id)?.role ?? "member",
        projects: projects?.filter((pr) => pr.owner_id === p.id || pm?.some((m) => m.user_id === p.id && m.project_id === pr.id)).length ?? 0,
      }));
    },
  });

  return (
    <div className="container mx-auto max-w-7xl p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Team</h1>
        <p className="text-muted-foreground">Everyone collaborating on your projects</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {people?.length === 0 && <p className="text-muted-foreground">No teammates yet.</p>}
        {people?.map((p) => (
          <Card key={p.id} style={{ boxShadow: "var(--shadow-card)" }}>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                {(p.name || p.email)[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="truncate text-base">{p.name || "Unnamed"}</CardTitle>
                <p className="truncate text-xs text-muted-foreground">{p.email}</p>
              </div>
              <Badge variant="secondary">{p.role}</Badge>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Member of {p.projects} project{p.projects === 1 ? "" : "s"}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
