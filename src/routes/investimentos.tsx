import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts";
import { TrendingUp, ShieldCheck, Target, Sparkles, AlertCircle } from "lucide-react";
import { formatBRL } from "@/lib/finance";

export const Route = createFileRoute("/investimentos")({
  head: () => ({
    meta: [
      { title: "Investimentos — FinControl" },
      { name: "description", content: "Guia educativo sobre investimentos financeiros e simulador de juros compostos." },
    ],
  }),
  component: InvestimentosPage,
});

const pillars = [
  { icon: AlertCircle, title: "Quite dívidas caras primeiro", text: "Cartão de crédito e cheque especial cobram juros muito acima de qualquer investimento. Quitá-los é o melhor 'rendimento' garantido." },
  { icon: ShieldCheck, title: "Monte a reserva de emergência", text: "6 a 12 meses dos seus gastos essenciais em liquidez imediata (Tesouro Selic, CDB com liquidez diária). É o que evita você quebrar investimentos na pior hora." },
  { icon: Target, title: "Defina objetivos e prazos", text: "Curto (até 2 anos), médio (2-5) e longo (5+). O prazo determina o nível de risco que você pode correr." },
];

const classes = [
  { name: "Tesouro Selic", what: "Título público pós-fixado, acompanha a taxa Selic.", risk: "Muito baixo", liq: "D+1", who: "Reserva de emergência" },
  { name: "Tesouro IPCA+", what: "Título público que paga inflação + juro real.", risk: "Baixo (até o vencimento)", liq: "Diária", who: "Aposentadoria, longo prazo" },
  { name: "Tesouro Prefixado", what: "Taxa fixa definida na compra.", risk: "Baixo a médio", liq: "Diária", who: "Aposta em queda de juros" },
  { name: "CDB / LCI / LCA", what: "Empréstimo a bancos. LCI e LCA são isentas de IR.", risk: "Baixo (FGC até R$ 250 mil)", liq: "Varia", who: "Curto e médio prazo" },
  { name: "Fundos DI / RF", what: "Carteira de renda fixa gerida profissionalmente.", risk: "Baixo", liq: "Geralmente diária", who: "Quem prefere gestão" },
  { name: "Ações", what: "Pedaços de empresas listadas em bolsa.", risk: "Alto", liq: "Diária", who: "Longo prazo, perfil arrojado" },
  { name: "Fundos Imobiliários (FIIs)", what: "Cotas de fundos que investem em imóveis ou recebíveis.", risk: "Médio a alto", liq: "Diária", who: "Renda passiva mensal" },
  { name: "ETFs", what: "Fundos que replicam índices (BOVA11, IVVB11).", risk: "Médio a alto", liq: "Diária", who: "Diversificação barata" },
  { name: "Renda fixa internacional", what: "Treasuries, bonds em dólar.", risk: "Baixo a médio", liq: "Varia", who: "Exposição em moeda forte" },
  { name: "Criptoativos", what: "Bitcoin, Ethereum e outros.", risk: "Muito alto", liq: "Alta", who: "Parcela pequena, perfil arrojado" },
];

const allocation = [
  { name: "Renda fixa (Selic + IPCA+)", pct: 40, color: "var(--chart-1)" },
  { name: "Ações nacionais", pct: 25, color: "var(--chart-2)" },
  { name: "FIIs", pct: 15, color: "var(--chart-3)" },
  { name: "ETF internacional", pct: 15, color: "var(--chart-4)" },
  { name: "Caixa / liquidez", pct: 5, color: "var(--chart-5)" },
];

function InvestimentosPage() {
  const [aporte, setAporte] = useState(500);
  const [taxa, setTaxa] = useState(0.9); // % ao mês
  const [meses, setMeses] = useState(240);

  const sim = useMemo(() => {
    const i = taxa / 100;
    const data: { mes: number; investido: number; total: number }[] = [];
    let saldo = 0;
    for (let m = 1; m <= meses; m++) {
      saldo = saldo * (1 + i) + aporte;
      if (m % Math.max(1, Math.floor(meses / 40)) === 0 || m === meses) {
        data.push({ mes: m, investido: aporte * m, total: saldo });
      }
    }
    const total = saldo;
    const investido = aporte * meses;
    return { data, total, investido, juros: total - investido };
  }, [aporte, taxa, meses]);

  return (
    <AppShell>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        <header className="flex items-start gap-4">
          <div className="size-12 rounded-xl bg-primary/10 text-primary grid place-items-center">
            <TrendingUp className="size-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Investimentos financeiros</h1>
            <p className="text-muted-foreground mt-1 max-w-2xl">
              Investir é fazer seu dinheiro trabalhar por você. A inflação corrói o poder de compra ao longo do tempo — quem
              só guarda na conta corrente perde valor real todo mês.
            </p>
          </div>
        </header>

        <section>
          <h2 className="text-xl font-semibold mb-3">Os 3 pilares antes de investir</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pillars.map((p) => {
              const Icon = p.icon;
              return (
                <Card key={p.title}>
                  <CardContent className="pt-6">
                    <Icon className="size-5 text-primary mb-3" />
                    <div className="font-semibold">{p.title}</div>
                    <p className="text-sm text-muted-foreground mt-2">{p.text}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Classes de investimento</h2>
          <Card>
            <CardContent className="pt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground border-b">
                  <tr>
                    <th className="py-2 px-2 font-medium">Classe</th>
                    <th className="py-2 px-2 font-medium">O que é</th>
                    <th className="py-2 px-2 font-medium">Risco</th>
                    <th className="py-2 px-2 font-medium">Liquidez</th>
                    <th className="py-2 px-2 font-medium">Indicado para</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {classes.map((c) => (
                    <tr key={c.name} className="hover:bg-muted/50">
                      <td className="py-3 px-2 font-medium">{c.name}</td>
                      <td className="py-3 px-2 text-muted-foreground">{c.what}</td>
                      <td className="py-3 px-2">{c.risk}</td>
                      <td className="py-3 px-2">{c.liq}</td>
                      <td className="py-3 px-2 text-muted-foreground">{c.who}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles className="size-4 text-primary" /> Simulador de juros compostos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Aporte mensal (R$)</Label>
                  <Input type="number" min={0} value={aporte} onChange={(e) => setAporte(Number(e.target.value) || 0)} />
                </div>
                <div>
                  <Label>Taxa de juros (% ao mês)</Label>
                  <Input type="number" min={0} step={0.1} value={taxa} onChange={(e) => setTaxa(Number(e.target.value) || 0)} />
                </div>
                <div>
                  <Label>Prazo (meses)</Label>
                  <Input type="number" min={1} value={meses} onChange={(e) => setMeses(Math.max(1, Number(e.target.value) || 1))} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
                <Metric label="Total investido" value={formatBRL(sim.investido)} />
                <Metric label="Juros acumulados" value={formatBRL(sim.juros)} accent />
                <Metric label="Valor final" value={formatBRL(sim.total)} accent />
              </div>

              <div className="h-64 mt-5">
                <ResponsiveContainer>
                  <AreaChart data={sim.data}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `${v}m`} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}
                      formatter={(v: number, name) => [formatBRL(v), name === "total" ? "Valor com juros" : "Investido"]}
                      labelFormatter={(l) => `Mês ${l}`}
                    />
                    <Area type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={2} fill="url(#g1)" />
                    <Line type="monotone" dataKey="investido" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Carteira moderada (exemplo)</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allocation.map((a) => (
                  <div key={a.name}>
                    <div className="flex justify-between text-sm">
                      <span>{a.name}</span>
                      <span className="font-semibold tabular-nums">{a.pct}%</span>
                    </div>
                    <div className="h-2 mt-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${a.pct}%`, background: a.color }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Apenas um ponto de partida. Ajuste conforme idade, objetivos e tolerância a risco.
              </p>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Dicas finais</h2>
          <Card>
            <CardContent className="pt-6">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <li>• Comece cedo — tempo é o principal aliado dos juros compostos.</li>
                <li>• Aporte com regularidade, mesmo valores pequenos.</li>
                <li>• Estude antes de investir em algo que não entende.</li>
                <li>• Desconfie de promessas de rentabilidade garantida acima da Selic.</li>
                <li>• Custos importam: taxa de administração e IR comem o retorno.</li>
                <li>• Reavalie sua carteira ao menos uma vez por ano.</li>
              </ul>
              <p className="text-xs text-muted-foreground italic mt-5">
                Aviso: este material é educativo e não constitui recomendação de investimento. Consulte um profissional certificado.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${accent ? "bg-primary/5 border-primary/20" : "bg-card"}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold mt-1 tabular-nums">{value}</div>
    </div>
  );
}
