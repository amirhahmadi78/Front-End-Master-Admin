
import { create } from "zustand";

interface LoadingState {
  loading: boolean;
  show: () => void;
  hide: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  loading: false,
  show: () => set({ loading: true }),
  hide: () => set({ loading: false }),
}));
