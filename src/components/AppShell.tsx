import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { ArrowDownCircle, LayoutDashboard, LogOut, Receipt, TrendingUp, UserRound, Wallet } from "lucide-react";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/receitas", label: "Receitas", icon: ArrowDownCircle },
  { to: "/despesas", label: "Despesas", icon: Receipt },
  { to: "/orcamento", label: "Orçamento", icon: Wallet },
  { to: "/investimentos", label: "Investimentos", icon: TrendingUp },
  { to: "/perfil", label: "Perfil", icon: UserRound },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground">
        Carregando...
      </div>
    );
  }

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const displayName = (user.user_metadata?.full_name as string | undefined) || user.email || "";
  const initial = (displayName[0] || "?").toUpperCase();

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full bg-background">
      <aside className="md:w-64 md:min-h-screen border-b md:border-b-0 md:border-r bg-card md:sticky md:top-0 md:h-screen flex flex-col">
        <div className="px-5 py-5 flex items-center gap-2">
          <div className="size-9 rounded-lg bg-primary text-primary-foreground grid place-items-center font-bold">F</div>
          <div>
            <div className="font-semibold leading-tight">FinControl</div>
            <div className="text-xs text-muted-foreground">Despesas & Investimentos</div>
          </div>
        </div>
        <nav className="px-2 pb-4 flex md:flex-col gap-1 overflow-x-auto flex-1">
          {nav.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden md:block border-t p-3">
          <Link to="/perfil" className="mb-2 flex items-center gap-2 rounded-md p-1 transition-colors hover:bg-accent">
            <div className="size-8 rounded-full bg-primary text-primary-foreground grid place-items-center text-sm font-semibold">{initial}</div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{displayName}</div>
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            </div>
          </Link>
          <Button variant="outline" size="sm" className="w-full" onClick={signOut}>
            <LogOut className="size-4 mr-2" /> Sair
          </Button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
