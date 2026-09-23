import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Download, LogOut, Mail, UserRound } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useBudgets, useExpenses, useIncomes } from "@/lib/storage";
import { csvDateStamp, downloadCsv } from "@/lib/csv";

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
  const { expenses, hydrated: expensesReady } = useExpenses();
  const { incomes, hydrated: incomesReady } = useIncomes();
  const { budgets, hydrated: budgetsReady } = useBudgets();

  if (!user) return <AppShell><div className="p-8" /></AppShell>;

  const displayName = (user.user_metadata?.full_name as string | undefined) || "Usuário FinControl";
  const initial = (displayName[0] || "U").toUpperCase();
  const investmentExpenses = expenses.filter((expense) => expense.category === "Investimentos");
  const exportsReady = expensesReady && incomesReady && budgetsReady;

  const exports = [
    {
      label: "Despesas",
      detail: `${expenses.length} ${expenses.length === 1 ? "lançamento" : "lançamentos"}`,
      download: () => downloadCsv(
        `fincontrol-despesas-${csvDateStamp()}.csv`,
        ["Data", "Descrição", "Categoria", "Forma de pagamento", "Valor (R$)"],
        expenses.map((expense) => [expense.date, expense.description, expense.category, expense.payment, expense.amount.toFixed(2).replace(".", ",")]),
      ),
    },
    {
      label: "Receitas",
      detail: `${incomes.length} ${incomes.length === 1 ? "lançamento" : "lançamentos"}`,
      download: () => downloadCsv(
        `fincontrol-receitas-${csvDateStamp()}.csv`,
        ["Data", "Descrição", "Categoria", "Fonte", "Valor (R$)"],
        incomes.map((income) => [income.date, income.description, income.category, income.source, income.amount.toFixed(2).replace(".", ",")]),
      ),
    },
    {
      label: "Orçamentos",
      detail: `${Object.keys(budgets).length} categorias`,
      download: () => downloadCsv(
        `fincontrol-orcamentos-${csvDateStamp()}.csv`,
        ["Categoria", "Limite mensal (R$)"],
        Object.entries(budgets).map(([category, amount]) => [category, amount.toFixed(2).replace(".", ",")]),
      ),
    },
    {
      label: "Investimentos",
      detail: `${investmentExpenses.length} ${investmentExpenses.length === 1 ? "lançamento" : "lançamentos"}`,
      download: () => downloadCsv(
        `fincontrol-investimentos-${csvDateStamp()}.csv`,
        ["Data", "Descrição", "Categoria", "Forma de pagamento", "Valor investido (R$)"],
        investmentExpenses.map((expense) => [expense.date, expense.description, expense.category, expense.payment, expense.amount.toFixed(2).replace(".", ",")]),
      ),
    },
  ];

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

        <Card className="max-w-2xl">
          <CardHeader className="border-b">
            <CardTitle className="text-lg">Exportar dados</CardTitle>
            <p className="text-sm text-muted-foreground">Baixe seus registros em CSV para abrir no Excel ou em outros aplicativos.</p>
          </CardHeader>
          <CardContent className="divide-y pt-2">
            {exports.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{exportsReady ? item.detail : "Carregando dados..."}</p>
                </div>
                <Button variant="outline" size="sm" onClick={item.download} disabled={!exportsReady} aria-label={`Exportar ${item.label} em CSV`}>
                  <Download className="size-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Baixar CSV</span>
                  <span className="sm:hidden">CSV</span>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}