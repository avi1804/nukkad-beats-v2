import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  authModalOpen: boolean;
  setAuthModalOpen: (isOpen: boolean) => void;
  setAuth: (user: User) => void;
  logout: () => void;
  getIsLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      authModalOpen: false,
      setAuthModalOpen: (isOpen) => set({ authModalOpen: isOpen }),
      setAuth: (user) => set({ user }),
      logout: () => set({ user: null }),
      getIsLoggedIn: () => !!get().user,
    }),
    {
      name: "nukkad-auth-storage", // name of the item in the storage (must be unique)
      partialize: (state) => ({ user: state.user }),
    }
  )
);
