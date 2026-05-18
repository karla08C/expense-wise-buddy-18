import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Receipt, TrendingUp, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/despesas", label: "Despesas", icon: Receipt },
  { to: "/orcamento", label: "Orçamento", icon: Wallet },
  { to: "/investimentos", label: "Investimentos", icon: TrendingUp },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full bg-background">
      <aside className="md:w-64 md:min-h-screen border-b md:border-b-0 md:border-r bg-card md:sticky md:top-0 md:h-screen">
        <div className="px-5 py-5 flex items-center gap-2">
          <div className="size-9 rounded-lg bg-primary text-primary-foreground grid place-items-center font-bold">F</div>
          <div>
            <div className="font-semibold leading-tight">FinControl</div>
            <div className="text-xs text-muted-foreground">Despesas & Investimentos</div>
          </div>
        </div>
        <nav className="px-2 pb-4 flex md:flex-col gap-1 overflow-x-auto">
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
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
