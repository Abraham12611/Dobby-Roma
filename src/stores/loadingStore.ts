import { create } from 'zustand'

interface LoadingStore {
  minLoadingComplete: boolean
  setMinLoadingComplete: (complete: boolean) => void
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  minLoadingComplete: false,
  setMinLoadingComplete: (complete: boolean) => set({ minLoadingComplete: complete }),
}))
