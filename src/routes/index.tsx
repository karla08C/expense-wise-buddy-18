import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PiggyBank, Wallet, ArrowDownCircle, Scale } from "lucide-react";
import { useExpenses, useBudgets, useIncomes } from "@/lib/storage";
import { CATEGORIES, formatBRL, monthLabel } from "@/lib/finance";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — FinControl" },
      { name: "description", content: "Visão geral de despesas, orçamento e investimentos." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { expenses, hydrated } = useExpenses();
  const { incomes } = useIncomes();
  const { budgets } = useBudgets();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const years = useMemo(() => {
    const ys = new Set(expenses.map((e) => new Date(e.date).getFullYear()));
    ys.add(now.getFullYear());
    return Array.from(ys).sort((a, b) => b - a);
  }, [expenses, now]);

  const monthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
  const yearExpenses = expenses.filter((e) => new Date(e.date).getFullYear() === year);

  const totalMonth = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const monthIncomes = incomes.filter((i) => {
    const d = new Date(i.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
  const totalIncome = monthIncomes.reduce((s, i) => s + i.amount, 0);
  const balance = totalIncome - totalMonth;
  const totalBudget = Object.values(budgets).reduce((s, v) => s + (v ?? 0), 0);
  const invested = monthExpenses.filter((e) => e.category === "Investimentos").reduce((s, e) => s + e.amount, 0);
  const lastMonthIdx = month === 0 ? 11 : month - 1;
  const lastMonthYear = month === 0 ? year - 1 : year;
  const lastMonthTotal = expenses
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === lastMonthIdx && d.getFullYear() === lastMonthYear;
    })
    .reduce((s, e) => s + e.amount, 0);
  const delta = lastMonthTotal === 0 ? 0 : ((totalMonth - lastMonthTotal) / lastMonthTotal) * 100;

  const yearIncomes = incomes.filter((i) => new Date(i.date).getFullYear() === year);
  const monthlyTotals = Array.from({ length: 12 }, (_, m) => {
    const despesas = yearExpenses.filter((e) => new Date(e.date).getMonth() === m).reduce((s, e) => s + e.amount, 0);
    const receitas = yearIncomes.filter((i) => new Date(i.date).getMonth() === m).reduce((s, i) => s + i.amount, 0);
    return { month: monthLabel(m), despesas, receitas, saldo: receitas - despesas };
  });

  const byCategory = CATEGORIES.map((cat) => ({
    name: cat,
    value: monthExpenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter((c) => c.value > 0);

  const chartColors = ["chart-1","chart-2","chart-3","chart-4","chart-5","chart-6","chart-7","chart-8"];

  const stats = [
    { label: "Receitas do mês", value: formatBRL(totalIncome), icon: ArrowDownCircle, hint: `${monthLabel(month)} / ${year}` },
    { label: "Gasto no mês", value: formatBRL(totalMonth), icon: Wallet, hint: `${((totalMonth / Math.max(totalBudget,1)) * 100).toFixed(0)}% do orçamento` },
    { label: "Saldo do mês", value: formatBRL(balance), icon: Scale, hint: balance >= 0 ? "Sobrou" : "Negativo" },
    { label: "Investido no mês", value: formatBRL(invested), icon: PiggyBank, hint: `vs. mês anterior ${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%` },
  ];
  

  if (!hydrated) return <AppShell><div className="p-8" /></AppShell>;

  return (
    <AppShell>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Acompanhe suas finanças em um só lugar.</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="h-10 rounded-md border bg-card px-3 text-sm"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>{monthLabel(i)}</option>
              ))}
            </select>
            <select
              className="h-10 rounded-md border bg-card px-3 text-sm"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <Button asChild>
              <Link to="/despesas">Nova despesa</Link>
            </Button>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{s.label}</span>
                    <Icon className="size-4 text-primary" />
                  </div>
                  <div className="text-2xl font-semibold mt-2">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.hint}</div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Despesas mensais — {year}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer>
                  <BarChart data={monthlyTotals}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `R$${v}`} />
                    <Tooltip
                      contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}
                      formatter={(v: number) => formatBRL(v)}
                    />
                    <Bar dataKey="total" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Por categoria — {monthLabel(month)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                {byCategory.length === 0 ? (
                  <div className="h-full grid place-items-center text-sm text-muted-foreground">Sem despesas neste mês</div>
                ) : (
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                        {byCategory.map((_, i) => (
                          <Cell key={i} fill={`var(--${chartColors[i % chartColors.length]})`} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}
                        formatter={(v: number) => formatBRL(v)}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Últimos lançamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {expenses.slice(0, 6).map((e) => (
                <div key={e.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium">{e.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(e.date).toLocaleDateString("pt-BR")} · {e.category} · {e.payment}
                    </div>
                  </div>
                  <div className="font-semibold tabular-nums">{formatBRL(e.amount)}</div>
                </div>
              ))}
              {expenses.length === 0 && (
                <div className="py-10 text-center text-sm text-muted-foreground">Nenhuma despesa ainda.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
