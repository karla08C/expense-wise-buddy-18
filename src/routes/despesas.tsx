import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { useExpenses } from "@/lib/storage";
import { useCategories } from "@/lib/storage";
import { PAYMENT_METHODS, formatBRL, type Category } from "@/lib/finance";

export const Route = createFileRoute("/despesas")({
  head: () => ({
    meta: [
      { title: "Despesas — FinControl" },
      { name: "description", content: "Cadastre e gerencie todas as suas despesas." },
    ],
  }),
  component: DespesasPage,
});

function DespesasPage() {
  const { expenses, add, remove } = useExpenses();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("Alimentação");
  const [payment, setPayment] = useState(PAYMENT_METHODS[0]);
  const [amount, setAmount] = useState("");
  const [filter, setFilter] = useState<"" | Category>("");

  const filtered = useMemo(
    () =>
      [...expenses]
        .filter((e) => (filter ? e.category === filter : true))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [expenses, filter],
  );
  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount.replace(",", "."));
    if (!description.trim() || !value || isNaN(value)) return;
    add({ date, description: description.trim(), category, payment, amount: value });
    setDescription("");
    setAmount("");
  };

  return (
    <AppShell>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Despesas</h1>
          <p className="text-muted-foreground mt-1">Registre cada gasto para ver para onde seu dinheiro está indo.</p>
        </header>

        <Card>
          <CardHeader><CardTitle>Nova despesa</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <div className="md:col-span-1">
                <Label htmlFor="date">Data</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="desc">Descrição</Label>
                <Input id="desc" placeholder="Ex: Supermercado" value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="cat">Categoria</Label>
                <select id="cat" className="h-10 w-full rounded-md border bg-card px-3 text-sm" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="pay">Pagamento</Label>
                <select id="pay" className="h-10 w-full rounded-md border bg-card px-3 text-sm" value={payment} onChange={(e) => setPayment(e.target.value)}>
                  {PAYMENT_METHODS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input id="amount" inputMode="decimal" placeholder="0,00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>
              <div className="md:col-span-6">
                <Button type="submit" className="w-full md:w-auto">Adicionar despesa</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
            <CardTitle>Lançamentos ({filtered.length})</CardTitle>
            <div className="flex items-center gap-3">
              <select className="h-9 rounded-md border bg-card px-3 text-sm" value={filter} onChange={(e) => setFilter(e.target.value as "" | Category)}>
                <option value="">Todas categorias</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="text-sm text-muted-foreground">Total: <span className="font-semibold text-foreground">{formatBRL(total)}</span></div>
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
                    <th className="py-2 px-2 font-medium">Pagamento</th>
                    <th className="py-2 px-2 font-medium text-right">Valor</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((e) => (
                    <tr key={e.id} className="hover:bg-muted/50">
                      <td className="py-2.5 px-2 tabular-nums">{new Date(e.date).toLocaleDateString("pt-BR")}</td>
                      <td className="py-2.5 px-2">{e.description}</td>
                      <td className="py-2.5 px-2">
                        <span className="inline-flex items-center rounded-full bg-accent text-accent-foreground px-2 py-0.5 text-xs">{e.category}</span>
                      </td>
                      <td className="py-2.5 px-2 text-muted-foreground">{e.payment}</td>
                      <td className="py-2.5 px-2 text-right font-semibold tabular-nums">{formatBRL(e.amount)}</td>
                      <td className="py-2.5 px-2 text-right">
                        <button onClick={() => remove(e.id)} className="text-muted-foreground hover:text-destructive transition-colors" aria-label="Remover">
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">Nenhuma despesa encontrada.</td></tr>
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
