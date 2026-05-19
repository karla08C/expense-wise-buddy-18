export type Category =
  | "Alimentação"
  | "Transporte"
  | "Moradia"
  | "Lazer"
  | "Saúde"
  | "Educação"
  | "Vestuário"
  | "Contas"
  | "Investimentos"
  | "Outros";

export const CATEGORIES: Category[] = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Lazer",
  "Saúde",
  "Educação",
  "Vestuário",
  "Contas",
  "Investimentos",
  "Outros",
];

export const CATEGORY_COLORS: Record<Category, string> = {
  "Alimentação": "var(--chart-1)",
  "Transporte": "var(--chart-2)",
  "Moradia": "var(--chart-3)",
  "Lazer": "var(--chart-4)",
  "Saúde": "var(--chart-5)",
  "Educação": "var(--chart-6)",
  "Vestuário": "var(--chart-7)",
  "Contas": "var(--chart-8)",
  "Investimentos": "var(--chart-1)",
  "Outros": "var(--chart-2)",
};

export type Expense = {
  id: string;
  date: string; // ISO yyyy-mm-dd
  description: string;
  category: Category;
  payment: string;
  amount: number;
};

export type Budgets = Partial<Record<Category, number>>;

export const DEFAULT_BUDGETS: Budgets = {
  "Alimentação": 800,
  "Transporte": 400,
  "Moradia": 1500,
  "Lazer": 300,
  "Saúde": 250,
  "Educação": 200,
  "Vestuário": 150,
  "Contas": 450,
  "Investimentos": 600,
  "Outros": 200,
};

export const PAYMENT_METHODS = [
  "Dinheiro",
  "Pix",
  "Cartão de Débito",
  "Cartão de Crédito",
  "Transferência",
  "Débito Automático",
  "Boleto",
];

export type IncomeCategory =
  | "Salário"
  | "Freelance"
  | "Vendas"
  | "Aluguel recebido"
  | "Rendimentos"
  | "Reembolso"
  | "Presente"
  | "Outros";

export const INCOME_CATEGORIES: IncomeCategory[] = [
  "Salário",
  "Freelance",
  "Vendas",
  "Aluguel recebido",
  "Rendimentos",
  "Reembolso",
  "Presente",
  "Outros",
];

export type Income = {
  id: string;
  date: string;
  description: string;
  category: IncomeCategory;
  source: string;
  amount: number;
};

export const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const monthLabel = (m: number) =>
  ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][m];
