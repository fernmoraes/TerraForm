import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  tutorialCompleted: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  completeTutorial: () => void;
  resetTutorial: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      tutorialCompleted: false,
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      completeTutorial: () => set({ tutorialCompleted: true }),
      resetTutorial: () => set({ tutorialCompleted: false }),
    }),
    {
      name: 'terraform-app-store',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
