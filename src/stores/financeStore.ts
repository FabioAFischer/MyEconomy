import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Expense, MonthlyLimit, MonthlySummary } from "../types/Finance";

type FinanceState = {
  expenses: Expense[];
  monthlyLimits: MonthlyLimit[];
  getMonthlySummary: (userId: string, monthRef: string) => MonthlySummary;
};

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
