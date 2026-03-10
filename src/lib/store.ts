'use client';

import { create } from 'zustand';
import type { Profile, Practice, Patient } from './types';

interface AppState {
  profile: Profile | null;
  practice: Practice | null;
  currentPatient: Patient | null;
  sidebarOpen: boolean;
  setProfile: (profile: Profile | null) => void;
  setPractice: (practice: Practice | null) => void;
  setCurrentPatient: (patient: Patient | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  profile: null,
  practice: null,
  currentPatient: null,
  sidebarOpen: true,
  setProfile: (profile) => set({ profile }),
  setPractice: (practice) => set({ practice }),
  setCurrentPatient: (patient) => set({ currentPatient: patient }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
