import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useState as useStateLocal } from "react";
import { useExpenses, useBudgets, useCategories, useIncomeCategories } from "@/lib/storage";
import { formatBRL, monthLabel, type Category } from "@/lib/finance";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/orcamento")({
  head: () => ({
    meta: [
      { title: "Orçamento — FinControl" },
      { name: "description", content: "Defina e acompanhe seu orçamento mensal por categoria." },
    ],
  }),
  component: OrcamentoPage,
});

function OrcamentoPage() {
  const { expenses } = useExpenses();
  const { budgets, setBudgets } = useBudgets();
  const expCats = useCategories();
  const incCats = useIncomeCategories();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [newExpCat, setNewExpCat] = useStateLocal("");
  const [newIncCat, setNewIncCat] = useStateLocal("");

  type Row = { cat: string; spent: number; budget: number; pct: number };
  const rows: Row[] = expCats.all.map((cat) => {
    const spent = expenses
      .filter((e) => {
        const d = new Date(e.date);
        return e.category === cat && d.getFullYear() === year && d.getMonth() === month;
      })
      .reduce((s, e) => s + e.amount, 0);
    const budget = budgets[cat] ?? 0;
    const pct = budget > 0 ? spent / budget : 0;
    return { cat, spent, budget, pct };
  });

  const totalSpent = rows.reduce((s: number, r: Row) => s + r.spent, 0);
  const totalBudget = rows.reduce((s: number, r: Row) => s + r.budget, 0);
  const totalPct = totalBudget > 0 ? totalSpent / totalBudget : 0;

  const updateBudget = (cat: Category, value: string) => {
    const v = parseFloat(value.replace(",", "."));
    setBudgets({ ...budgets, [cat]: isNaN(v) ? 0 : v });
  };

  return (
    <AppShell>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orçamento</h1>
            <p className="text-muted-foreground mt-1">Defina limites mensais e veja onde você está estourando.</p>
          </div>
          <div className="flex items-center gap-2">
            <select className="h-10 rounded-md border bg-card px-3 text-sm" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => <option key={i} value={i}>{monthLabel(i)}</option>)}
            </select>
            <select className="h-10 rounded-md border bg-card px-3 text-sm" value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {[year - 1, year, year + 1].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </header>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
              <div>
                <div className="text-sm text-muted-foreground">Total — {monthLabel(month)}/{year}</div>
                <div className="text-2xl font-semibold mt-1">
                  {formatBRL(totalSpent)} <span className="text-muted-foreground text-base">/ {formatBRL(totalBudget)}</span>
                </div>
              </div>
              <div className={cn("text-sm font-semibold", totalPct >= 1 ? "text-destructive" : totalPct >= 0.8 ? "text-warning" : "text-success")}>
                {(totalPct * 100).toFixed(0)}% usado
              </div>
            </div>
            <ProgressBar pct={totalPct} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Por categoria</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-5">
              {rows.map((r: Row) => (
                <div key={r.cat} className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-12 md:col-span-3 font-medium flex items-center gap-2">
                    {r.cat}
                    {expCats.isCustom(r.cat) && (
                      <button
                        onClick={() => expCats.remove(r.cat)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Remover categoria"
                        title="Remover categoria customizada"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="col-span-7 md:col-span-6">
                    <ProgressBar pct={r.pct} />
                    <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                      <span>{formatBRL(r.spent)} usado</span>
                      <span>{r.budget > 0 ? `${(r.pct * 100).toFixed(0)}%` : "—"}</span>
                    </div>
                  </div>
                  <div className="col-span-5 md:col-span-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">R$</span>
                      <Input
                        inputMode="decimal"
                        value={r.budget}
                        onChange={(e) => updateBudget(r.cat, e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Gerenciar categorias</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="text-sm font-medium mb-2">Categorias de despesas</div>
              <div className="flex flex-wrap gap-2 mb-3">
                {expCats.all.map((c) => (
                  <span key={c} className="inline-flex items-center gap-1.5 rounded-full bg-accent text-accent-foreground px-3 py-1 text-xs">
                    {c}
                    {expCats.isCustom(c) && (
                      <button onClick={() => expCats.remove(c)} aria-label={`Remover ${c}`}>
                        <Trash2 className="size-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); expCats.add(newExpCat); setNewExpCat(""); }}
                className="flex gap-2"
              >
                <Input placeholder="Nova categoria de despesa" value={newExpCat} onChange={(e) => setNewExpCat(e.target.value)} />
                <Button type="submit" size="sm"><Plus className="size-4" />Adicionar</Button>
              </form>
            </div>

            <div>
              <div className="text-sm font-medium mb-2">Categorias de receitas</div>
              <div className="flex flex-wrap gap-2 mb-3">
                {incCats.all.map((c) => (
                  <span key={c} className="inline-flex items-center gap-1.5 rounded-full bg-accent text-accent-foreground px-3 py-1 text-xs">
                    {c}
                    {incCats.isCustom(c) && (
                      <button onClick={() => incCats.remove(c)} aria-label={`Remover ${c}`}>
                        <Trash2 className="size-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); incCats.add(newIncCat); setNewIncCat(""); }}
                className="flex gap-2"
              >
                <Input placeholder="Nova categoria de receita" value={newIncCat} onChange={(e) => setNewIncCat(e.target.value)} />
                <Button type="submit" size="sm"><Plus className="size-4" />Adicionar</Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  const capped = Math.min(pct, 1);
  const over = pct > 1;
  const color = pct >= 1 ? "bg-destructive" : pct >= 0.8 ? "bg-warning" : "bg-success";
  return (
    <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
      <div className={cn("h-full transition-all", color)} style={{ width: `${capped * 100}%` }} />
      {over && <div className="absolute inset-y-0 right-0 w-1 bg-destructive-foreground/40" />}
    </div>
  );
}
