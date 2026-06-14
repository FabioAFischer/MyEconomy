import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Expense, MonthlyLimit, MonthlySummary } from "../types/Finance";

type FinanceState = {
  expenses: Expense[];
  monthlyLimits: MonthlyLimit[];
  getMonthlySummary: (userId: string, monthRef: string) => MonthlySummary;
  addExpense: (data: Omit<Expense, "id" | "createdAt">) => void;
  updateExpense: (
    id: string,
    data: Partial<Pick<Expense, "description" | "value">>
  ) => void;
  deleteExpense: (id: string) => void;
  addMonthlyLimit: (data: Omit<MonthlyLimit, "id" | "createdAt">) => void;
  updateMonthlyLimit: (id: string, value: number) => void;
  deleteMonthlyLimit: (id: string) => void;
};

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      expenses: [],
      monthlyLimits: [],

      getMonthlySummary: (userId, monthRef) => {
        const expenses = get().expenses.filter(
          (expense) => expense.userId === userId && expense.monthRef === monthRef
        );
        const monthlyLimit = get().monthlyLimits.find(
          (limit) => limit.userId === userId && limit.monthRef === monthRef
        );

        const totalExpenses = expenses.reduce(
          (total, expense) => total + expense.value,
          0
        );
        const limit = monthlyLimit?.value ?? null;
        const balance = limit === null ? null : limit - totalExpenses;
        const progress =
          limit && limit > 0 ? Math.min(totalExpenses / limit, 1) : 0;

        return {
          monthRef,
          totalExpenses,
          limit,
          balance,
          progress,
          status:
            limit === null
              ? "without-limit"
              : totalExpenses > limit
              ? "over-limit"
              : "saved",
          expensesCount: expenses.length,
        };
      },

      addExpense: (data) => {
        const expense: Expense = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ expenses: [...state.expenses, expense] }));
      },

      updateExpense: (id, data) => {
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...data } : e
          ),
        }));
      },

      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        }));
      },

      addMonthlyLimit: (data) => {
        const limit: MonthlyLimit = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          monthlyLimits: [...state.monthlyLimits, limit],
        }));
      },

      updateMonthlyLimit: (id, value) => {
        set((state) => ({
          monthlyLimits: state.monthlyLimits.map((l) =>
            l.id === id ? { ...l, value } : l
          ),
        }));
      },

      deleteMonthlyLimit: (id) => {
        set((state) => ({
          monthlyLimits: state.monthlyLimits.filter((l) => l.id !== id),
        }));
      },
    }),
    {
      name: "@myeconomy:finance",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        expenses: state.expenses,
        monthlyLimits: state.monthlyLimits,
      }),
    }
  )
);
