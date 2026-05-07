'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LivingWillData, createEmptyLivingWillData } from '@/types/living-will';

interface LivingWillStore {
  data: LivingWillData;
  updateData: (updates: Partial<LivingWillData>) => void;
  resetData: () => void;

  // Wish 1
  setWish1: (values: string[]) => void;
  setWish1Supplement: (value: string) => void;

  // Wish 2
  setWish2Abandon: (values: string[]) => void;
  setScenarioTerminal: (value: LivingWillData['scenarioTerminal']) => void;
  setScenarioComa: (value: LivingWillData['scenarioComa']) => void;
  setScenarioVegetative: (value: LivingWillData['scenarioVegetative']) => void;
  setWish2Supplement: (value: string) => void;

  // Wish 3
  setWish3: (values: string[]) => void;
  setWish3Supplement: (value: string) => void;

  // Wish 4
  setWish4: (values: string[]) => void;
  setWish4Supplement: (value: string) => void;

  // Witnesses
  setWitness1: (info: Partial<LivingWillData['witness1']>) => void;
  setWitness2: (info: Partial<LivingWillData['witness2']>) => void;

  // Declaration
  setDeclarationAgreed: (value: boolean) => void;
  setSignName: (value: string) => void;
  setSignDate: (value: string) => void;
}

export const useLivingWillStore = create<LivingWillStore>()(
  persist(
    (set) => ({
      data: createEmptyLivingWillData(),

      updateData: (updates) =>
        set((state) => ({ data: { ...state.data, ...updates } })),

      resetData: () => set({ data: createEmptyLivingWillData() }),

      setWish1: (values) =>
        set((state) => ({ data: { ...state.data, wish1: values } })),
      setWish1Supplement: (value) =>
        set((state) => ({ data: { ...state.data, wish1Supplement: value } })),

      setWish2Abandon: (values) =>
        set((state) => ({ data: { ...state.data, wish2Abandon: values } })),
      setScenarioTerminal: (value) =>
        set((state) => ({ data: { ...state.data, scenarioTerminal: value } })),
      setScenarioComa: (value) =>
        set((state) => ({ data: { ...state.data, scenarioComa: value } })),
      setScenarioVegetative: (value) =>
        set((state) => ({ data: { ...state.data, scenarioVegetative: value } })),
      setWish2Supplement: (value) =>
        set((state) => ({ data: { ...state.data, wish2Supplement: value } })),

      setWish3: (values) =>
        set((state) => ({ data: { ...state.data, wish3: values } })),
      setWish3Supplement: (value) =>
        set((state) => ({ data: { ...state.data, wish3Supplement: value } })),

      setWish4: (values) =>
        set((state) => ({ data: { ...state.data, wish4: values } })),
      setWish4Supplement: (value) =>
        set((state) => ({ data: { ...state.data, wish4Supplement: value } })),

      setWitness1: (info) =>
        set((state) => ({
          data: { ...state.data, witness1: { ...state.data.witness1, ...info } },
        })),
      setWitness2: (info) =>
        set((state) => ({
          data: { ...state.data, witness2: { ...state.data.witness2, ...info } },
        })),

      setDeclarationAgreed: (value) =>
        set((state) => ({ data: { ...state.data, declarationAgreed: value } })),
      setSignName: (value) =>
        set((state) => ({ data: { ...state.data, signName: value } })),
      setSignDate: (value) =>
        set((state) => ({ data: { ...state.data, signDate: value } })),
    }),
    {
      name: 'living-will-storage',
      version: 1,
    }
  )
);
