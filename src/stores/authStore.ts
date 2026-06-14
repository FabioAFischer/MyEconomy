import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { AuthResult, User } from "../types/User";
import { isRequired, isValidEmail, normalizeEmail } from "../utils/validators";

type SignupData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
};

type SigninData = {
  email: string;
  password: string;
};

type AuthState = {
  users: User[];
  currentUser: User | null;
  hasHydrated: boolean;
  signup: (data: SignupData) => AuthResult;
  signin: (data: SigninData) => AuthResult;
  signout: () => void;
  getCurrentUser: () => User | null;
  setHasHydrated: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,
      hasHydrated: false,

      signup: ({ name, email, password, confirmPassword, birthDate }) => {
        const normalizedEmail = normalizeEmail(email);

        if (
          !isRequired(name) ||
          !isRequired(email) ||
          !isRequired(password) ||
          !isRequired(confirmPassword) ||
          !isRequired(birthDate)
        ) {
          return { success: false, error: "Preencha todos os campos." };
        }

        if (!isValidEmail(normalizedEmail)) {
          return { success: false, error: "Informe um e-mail válido." };
        }

        if (password !== confirmPassword) {
          return { success: false, error: "As senhas não coincidem." };
        }

        const emailAlreadyExists = get().users.some(
          (user) => user.email === normalizedEmail
        );

        if (emailAlreadyExists) {
          return { success: false, error: "Este e-mail já está cadastrado." };
        }

        const newUser: User = {
          id: Date.now().toString(),
          name: name.trim(),
          email: normalizedEmail,
          password,
          birthDate: birthDate.trim(),
        };

        set((state) => ({
          users: [...state.users, newUser],
        }));

        return { success: true };
      },

      signin: ({ email, password }) => {
        const normalizedEmail = normalizeEmail(email);

        if (!isRequired(email) || !isRequired(password)) {
          return { success: false, error: "Informe e-mail e senha." };
        }

        const user = get().users.find(
          (storedUser) =>
            storedUser.email === normalizedEmail && storedUser.password === password
        );

        if (!user) {
          return { success: false, error: "E-mail ou senha inválidos." };
        }

        set({ currentUser: user });
        return { success: true };
      },

      signout: () => {
        set({ currentUser: null });
      },

      getCurrentUser: () => {
        const currentUser = get().currentUser;

        if (!currentUser) {
          return null;
        }

        return get().users.find((user) => user.id === currentUser.id) ?? currentUser;
      },

      setHasHydrated: (value) => {
        set({ hasHydrated: value });
      },
    }),
    {
      name: "@myeconomy:auth",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        users: state.users,
        currentUser: state.currentUser,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
