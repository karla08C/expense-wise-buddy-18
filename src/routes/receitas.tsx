import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { useIncomes } from "@/lib/storage";
import { INCOME_CATEGORIES, formatBRL, type IncomeCategory } from "@/lib/finance";

export const Route = createFileRoute("/receitas")({
  head: () => ({
    meta: [
      { title: "Receitas — FinControl" },
      { name: "description", content: "Cadastre suas entradas: salário, freelance, rendimentos e mais." },
    ],
  }),
  component: ReceitasPage,
});

function ReceitasPage() {
  const { incomes, add, remove } = useIncomes();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<IncomeCategory>("Salário");
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [filter, setFilter] = useState<"" | IncomeCategory>("");

  const filtered = useMemo(
    () =>
      [...incomes]
        .filter((i) => (filter ? i.category === filter : true))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [incomes, filter],
  );
  const total = filtered.reduce((s, i) => s + i.amount, 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount.replace(",", "."));
    if (!description.trim() || !value || isNaN(value)) return;
    add({ date, description: description.trim(), category, source: source.trim() || "—", amount: value });
    setDescription("");
    setSource("");
    setAmount("");
  };

  return (
    <AppShell>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Receitas</h1>
          <p className="text-muted-foreground mt-1">Registre todas as suas entradas para acompanhar seu saldo real.</p>
        </header>

        <Card>
          <CardHeader><CardTitle>Nova receita</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <div className="md:col-span-1">
                <Label htmlFor="date">Data</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="desc">Descrição</Label>
                <Input id="desc" placeholder="Ex: Salário de maio" value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="cat">Categoria</Label>
                <select id="cat" className="h-10 w-full rounded-md border bg-card px-3 text-sm" value={category} onChange={(e) => setCategory(e.target.value as IncomeCategory)}>
                  {INCOME_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="src">Origem</Label>
                <Input id="src" placeholder="Ex: Empresa X" value={source} onChange={(e) => setSource(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input id="amount" inputMode="decimal" placeholder="0,00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>
              <div className="md:col-span-6">
                <Button type="submit" className="w-full md:w-auto">Adicionar receita</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
            <CardTitle>Lançamentos ({filtered.length})</CardTitle>
            <div className="flex items-center gap-3">
              <select className="h-9 rounded-md border bg-card px-3 text-sm" value={filter} onChange={(e) => setFilter(e.target.value as "" | IncomeCategory)}>
                <option value="">Todas categorias</option>
                {INCOME_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="text-sm text-muted-foreground">Total: <span className="font-semibold text-success">{formatBRL(total)}</span></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground border-b">
                  <tr>
                    <th className="py-2 px-2 font-medium">Data</th>
                    <th className="py-2 px-2 font-medium">Descrição</th>
                    <th className="py-2 px-2 font-medium">Categoria</th>
                    <th className="py-2 px-2 font-medium">Origem</th>
                    <th className="py-2 px-2 font-medium text-right">Valor</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((i) => (
                    <tr key={i.id} className="hover:bg-muted/50">
                      <td className="py-2.5 px-2 tabular-nums">{new Date(i.date).toLocaleDateString("pt-BR")}</td>
                      <td className="py-2.5 px-2">{i.description}</td>
                      <td className="py-2.5 px-2">
                        <span className="inline-flex items-center rounded-full bg-accent text-accent-foreground px-2 py-0.5 text-xs">{i.category}</span>
                      </td>
                      <td className="py-2.5 px-2 text-muted-foreground">{i.source}</td>
                      <td className="py-2.5 px-2 text-right font-semibold tabular-nums text-success">{formatBRL(i.amount)}</td>
                      <td className="py-2.5 px-2 text-right">
                        <button onClick={() => remove(i.id)} className="text-muted-foreground hover:text-destructive transition-colors" aria-label="Remover">
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">Nenhuma receita encontrada.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
