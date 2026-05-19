// Categorias são strings livres: defaults + customizadas pelo usuário
export type Category = string;

export const DEFAULT_CATEGORIES: Category[] = [
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

/** @deprecated Use useCategories() para incluir categorias customizadas */
export const CATEGORIES = DEFAULT_CATEGORIES;

export type Expense = {
  id: string;
  date: string;
  description: string;
  category: Category;
  payment: string;
  amount: number;
};

export type Budgets = Record<string, number>;

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

export type IncomeCategory = string;

export const DEFAULT_INCOME_CATEGORIES: IncomeCategory[] = [
  "Salário",
  "Freelance",
  "Vendas",
  "Aluguel recebido",
  "Rendimentos",
  "Reembolso",
  "Presente",
  "Outros",
];

/** @deprecated Use useIncomeCategories() */
export const INCOME_CATEGORIES = DEFAULT_INCOME_CATEGORIES;

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
