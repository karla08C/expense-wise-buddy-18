import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Mail, UserRound } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Meu perfil — FinControl" },
      { name: "description", content: "Consulte os dados da sua conta no FinControl." },
      { property: "og:title", content: "Meu perfil — FinControl" },
      { property: "og:description", content: "Consulte os dados da sua conta no FinControl." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (!user) return <AppShell><div className="p-8" /></AppShell>;

  const displayName = (user.user_metadata?.full_name as string | undefined) || "Usuário FinControl";
  const initial = (displayName[0] || "U").toUpperCase();

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6 p-6 md:p-8">
        <header>
          <p className="text-sm font-medium text-primary">Sua conta</p>
          <h1 className="mt-1 text-2xl font-bold md:text-3xl">Meu perfil</h1>
          <p className="mt-1 text-sm text-muted-foreground">Confira suas informações de acesso.</p>
        </header>

        <Card className="max-w-2xl">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 border-b">
            <div className="grid size-14 shrink-0 place-items-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
              {initial}
            </div>
            <div className="min-w-0">
              <CardTitle className="truncate text-xl">{displayName}</CardTitle>
              <p className="mt-1 truncate text-sm text-muted-foreground">{user.email}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <UserRound className="mt-0.5 size-5 text-primary" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Nome</p>
                  <p className="mt-1 break-words font-medium">{displayName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 size-5 text-primary" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Email</p>
                  <p className="mt-1 break-all font-medium">{user.email}</p>
                </div>
              </div>
            </div>
            <div className="border-t pt-5">
              <Button variant="destructive" onClick={signOut}>
                <LogOut className="size-4" aria-hidden="true" />
                Sair da conta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}