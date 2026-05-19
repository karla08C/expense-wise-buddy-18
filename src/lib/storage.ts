import { useEffect, useState } from "react";
import type { Budgets, Expense, Income } from "./finance";
import { DEFAULT_BUDGETS, DEFAULT_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from "./finance";

const EXPENSES_KEY = "fc.expenses.v1";
const BUDGETS_KEY = "fc.budgets.v1";
const INCOMES_KEY = "fc.incomes.v1";
const CUSTOM_CAT_KEY = "fc.customCategories.v1";
const CUSTOM_INC_CAT_KEY = "fc.customIncomeCategories.v1";

const seedIncomes: Income[] = [
  { id: "i1", date: "2025-05-05", description: "Salário mensal", category: "Salário", source: "Empresa", amount: 5200 },
  { id: "i2", date: "2025-05-18", description: "Projeto freelance", category: "Freelance", source: "Cliente A", amount: 1500 },
  { id: "i3", date: "2025-04-05", description: "Salário mensal", category: "Salário", source: "Empresa", amount: 5200 },
];

const seed: Expense[] = [
  { id: "s1", date: "2025-05-02", description: "Supermercado Pão de Açúcar", category: "Alimentação", payment: "Cartão de Crédito", amount: 245.8 },
  { id: "s2", date: "2025-05-03", description: "Uber para o trabalho", category: "Transporte", payment: "Pix", amount: 28.5 },
  { id: "s3", date: "2025-05-05", description: "Aluguel", category: "Moradia", payment: "Transferência", amount: 1500 },
  { id: "s4", date: "2025-05-07", description: "Cinema", category: "Lazer", payment: "Cartão de Débito", amount: 60 },
  { id: "s5", date: "2025-05-10", description: "Farmácia", category: "Saúde", payment: "Dinheiro", amount: 75.3 },
  { id: "s6", date: "2025-05-12", description: "Curso de inglês online", category: "Educação", payment: "Cartão de Crédito", amount: 199 },
  { id: "s7", date: "2025-05-15", description: "Conta de luz", category: "Contas", payment: "Débito Automático", amount: 180.4 },
  { id: "s8", date: "2025-05-18", description: "Aporte Tesouro Selic", category: "Investimentos", payment: "Transferência", amount: 500 },
  { id: "s9", date: "2025-05-20", description: "Restaurante", category: "Alimentação", payment: "Cartão de Crédito", amount: 92.1 },
  { id: "s10", date: "2025-05-25", description: "Combustível", category: "Transporte", payment: "Cartão de Débito", amount: 220 },
  { id: "s11", date: "2025-04-04", description: "Mercado", category: "Alimentação", payment: "Pix", amount: 312 },
  { id: "s12", date: "2025-04-05", description: "Aluguel", category: "Moradia", payment: "Transferência", amount: 1500 },
  { id: "s13", date: "2025-04-15", description: "Internet", category: "Contas", payment: "Débito Automático", amount: 120 },
  { id: "s14", date: "2025-04-22", description: "Aporte FIIs", category: "Investimentos", payment: "Transferência", amount: 400 },
];

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(EXPENSES_KEY);
    if (stored) setExpenses(JSON.parse(stored));
    else {
      setExpenses(seed);
      window.localStorage.setItem(EXPENSES_KEY, JSON.stringify(seed));
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  }, [expenses, hydrated]);

  const add = (e: Omit<Expense, "id">) =>
    setExpenses((prev) => [{ ...e, id: crypto.randomUUID() }, ...prev]);
  const remove = (id: string) => setExpenses((prev) => prev.filter((e) => e.id !== id));
  const clear = () => setExpenses([]);

  return { expenses, add, remove, clear, hydrated };
}

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budgets>(DEFAULT_BUDGETS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setBudgets(read(BUDGETS_KEY, DEFAULT_BUDGETS));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
  }, [budgets, hydrated]);

  return { budgets, setBudgets };
}

export function useIncomes() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(INCOMES_KEY);
    if (stored) setIncomes(JSON.parse(stored));
    else {
      setIncomes(seedIncomes);
      window.localStorage.setItem(INCOMES_KEY, JSON.stringify(seedIncomes));
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(INCOMES_KEY, JSON.stringify(incomes));
  }, [incomes, hydrated]);

  const add = (i: Omit<Income, "id">) =>
    setIncomes((prev) => [{ ...i, id: crypto.randomUUID() }, ...prev]);
  const remove = (id: string) => setIncomes((prev) => prev.filter((i) => i.id !== id));

  return { incomes, add, remove, hydrated };
}
