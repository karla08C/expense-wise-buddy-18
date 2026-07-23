import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";
import type { Budgets, Expense, Income } from "./finance";
import { DEFAULT_BUDGETS, DEFAULT_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from "./finance";

export function useExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setExpenses([]);
      setHydrated(true);
      return;
    }
    const { data } = await supabase
      .from("expenses")
      .select("*")
      .order("date", { ascending: false });
    setExpenses(
      (data ?? []).map((r) => ({
        id: r.id,
        date: r.date,
        description: r.description,
        category: r.category,
        payment: r.payment,
        amount: Number(r.amount),
      })),
    );
    setHydrated(true);
  }, [user]);

  useEffect(() => {
    setHydrated(false);
    load();
  }, [load]);

  const add = async (e: Omit<Expense, "id">) => {
    if (!user) return;
    const { data } = await supabase
      .from("expenses")
      .insert({ ...e, user_id: user.id })
      .select()
      .single();
    if (data) {
      setExpenses((prev) => [
        { id: data.id, date: data.date, description: data.description, category: data.category, payment: data.payment, amount: Number(data.amount) },
        ...prev,
      ]);
    }
  };

  const remove = async (id: string) => {
    await supabase.from("expenses").delete().eq("id", id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const clear = async () => {
    if (!user) return;
    await supabase.from("expenses").delete().eq("user_id", user.id);
    setExpenses([]);
  };

  return { expenses, add, remove, clear, hydrated };
}

export function useIncomes() {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setIncomes([]);
      setHydrated(true);
      return;
    }
    const { data } = await supabase
      .from("incomes")
      .select("*")
      .order("date", { ascending: false });
    setIncomes(
      (data ?? []).map((r) => ({
        id: r.id,
        date: r.date,
        description: r.description,
        category: r.category,
        source: r.source ?? "",
        amount: Number(r.amount),
      })),
    );
    setHydrated(true);
  }, [user]);

  useEffect(() => {
    setHydrated(false);
    load();
  }, [load]);

  const add = async (i: Omit<Income, "id">) => {
    if (!user) return;
    const { data } = await supabase
      .from("incomes")
      .insert({ ...i, user_id: user.id })
      .select()
      .single();
    if (data) {
      setIncomes((prev) => [
        { id: data.id, date: data.date, description: data.description, category: data.category, source: data.source ?? "", amount: Number(data.amount) },
        ...prev,
      ]);
    }
  };

  const remove = async (id: string) => {
    await supabase.from("incomes").delete().eq("id", id);
    setIncomes((prev) => prev.filter((i) => i.id !== id));
  };

  return { incomes, add, remove, hydrated };
}

export function useBudgets() {
  const { user } = useAuth();
  const [budgets, setBudgetsState] = useState<Budgets>(DEFAULT_BUDGETS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(false);
    (async () => {
      if (!user) {
        setBudgetsState(DEFAULT_BUDGETS);
        setHydrated(true);
        return;
      }
      const { data } = await supabase.from("budgets").select("*");
      const map: Budgets = { ...DEFAULT_BUDGETS };
      (data ?? []).forEach((r) => {
        map[r.category] = Number(r.amount);
      });
      setBudgetsState(map);
      setHydrated(true);
    })();
  }, [user]);

  const setBudgets = (updater: Budgets | ((prev: Budgets) => Budgets)) => {
    setBudgetsState((prev) => {
      const next = typeof updater === "function" ? (updater as (p: Budgets) => Budgets)(prev) : updater;
      if (user) {
        // find changed keys
        const rows = Object.entries(next)
          .filter(([k, v]) => prev[k] !== v)
          .map(([category, amount]) => ({ user_id: user.id, category, amount }));
        if (rows.length > 0) {
          void supabase.from("budgets").upsert(rows, { onConflict: "user_id,category" });
        }
      }
      return next;
    });
  };

  return { budgets, setBudgets, hydrated };
}

function useCustomCategoriesOfKind(kind: "expense" | "income", defaults: string[]) {
  const { user } = useAuth();
  const [custom, setCustom] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(false);
    (async () => {
      if (!user) {
        setCustom([]);
        setHydrated(true);
        return;
      }
      const { data } = await supabase
        .from("custom_categories")
        .select("name")
        .eq("kind", kind);
      setCustom((data ?? []).map((r) => r.name));
      setHydrated(true);
    })();
  }, [user, kind]);

  const all = Array.from(new Set([...defaults, ...custom]));

  const add = async (name: string) => {
    const n = name.trim();
    if (!n || all.includes(n) || !user) return;
    const { error } = await supabase
      .from("custom_categories")
      .insert({ user_id: user.id, kind, name: n });
    if (!error) setCustom((p) => [...p, n]);
  };

  const remove = async (name: string) => {
    if (!user) return;
    await supabase
      .from("custom_categories")
      .delete()
      .eq("user_id", user.id)
      .eq("kind", kind)
      .eq("name", name);
    setCustom((p) => p.filter((c) => c !== name));
  };

  const isCustom = (name: string) => custom.includes(name);

  return { all, custom, add, remove, isCustom };
}

export function useCategories() {
  return useCustomCategoriesOfKind("expense", DEFAULT_CATEGORIES);
}

export function useIncomeCategories() {
  return useCustomCategoriesOfKind("income", DEFAULT_INCOME_CATEGORIES);
}
