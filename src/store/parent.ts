import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type ParentState = {
  selectedChildId: string | null;
  selectChild: (id: string) => void;
};

export const useParentStore = create<ParentState>()(
  persist(
    (set) => ({
      selectedChildId: null,
      selectChild: (selectedChildId) => set({ selectedChildId }),
    }),
    {
      name: 'khanovmath.parent',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
