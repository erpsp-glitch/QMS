import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  username: string;
  role: string;
  fullName?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  getToken: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist<AuthState>(
    (set, get) => ({
      token: null,
      user: null,
      login: (token: string, user: User) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      getToken: () => get().token,
    }),
    {
      name: "auth-storage", // persists in localStorage
    }
  )
);
