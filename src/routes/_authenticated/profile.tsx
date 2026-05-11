import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, type FormEvent } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Profile — Flowboard" }] }),
});

function ProfilePage() {
  const { user, role } = useAuth();
  const qc = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      return data;
    },
  });

  const [name, setName] = useState("");
  useEffect(() => { if (profile?.name) setName(profile.name); }, [profile?.name]);

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("profiles").update({ name }).eq("id", user!.id);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    qc.invalidateQueries({ queryKey: ["profile", user?.id] });
  };

  return (
    <div className="container mx-auto max-w-2xl p-6 md:p-8">
      <h1 className="mb-6 text-3xl font-bold">Profile</h1>
      <Card style={{ boxShadow: "var(--shadow-card)" }}>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full text-2xl font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
              {(profile?.name || user?.email || "?")[0]?.toUpperCase()}
            </div>
            <div>
              <CardTitle>{profile?.name || "Unnamed"}</CardTitle>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              {role && <Badge variant="secondary" className="mt-1">{role}</Badge>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSave} className="space-y-4">
            <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><Label>Email</Label><Input value={user?.email ?? ""} disabled /></div>
            <Button type="submit">Save changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
