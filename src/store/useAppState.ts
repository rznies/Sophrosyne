import { create } from 'zustand';
import type { ScheduleRule, Session } from '../db/schema';

export interface AppState {
  // Global toggles
  workModeOn: boolean;
  accessibilityEnabled: boolean;
  overlayEnabled: boolean;

  // Data
  selectedTriggerApps: string[];
  scheduleRules: ScheduleRule[];
  sessions: Session[];

  // Actions
  setWorkMode: (on: boolean) => void;
  setSelectedTriggerApps: (apps: string[]) => void;
  addTriggerApp: (packageName: string) => void;
  removeTriggerApp: (packageName: string) => void;
  setScheduleRules: (rules: ScheduleRule[]) => void;
  updateScheduleRules: (rules: ScheduleRule[]) => void;
  updateSessions: (sessions: Session[]) => void;
  updatePermissions: (accessibility: boolean, overlay: boolean) => void;
}

export const useAppState = create<AppState>((set) => ({
  // Initial state
  workModeOn: false,
  accessibilityEnabled: false,
  overlayEnabled: false,
  selectedTriggerApps: [],
  scheduleRules: [],
  sessions: [],

  // Setters
  setWorkMode: (on: boolean) => {
    set({ workModeOn: on });
  },

  setSelectedTriggerApps: (apps: string[]) => {
    set({ selectedTriggerApps: apps });
  },

  addTriggerApp: (packageName: string) => {
    set((state) => ({
      selectedTriggerApps: [...state.selectedTriggerApps, packageName],
    }));
  },

  removeTriggerApp: (packageName: string) => {
    set((state) => ({
      selectedTriggerApps: state.selectedTriggerApps.filter(
        (pkg) => pkg !== packageName
      ),
    }));
  },

  setScheduleRules: (rules: ScheduleRule[]) => {
    set({ scheduleRules: rules });
  },

  updateScheduleRules: (rules: ScheduleRule[]) => {
    set({ scheduleRules: rules });
  },

  updateSessions: (sessions: Session[]) => {
    set({ sessions });
  },

  updatePermissions: (accessibility: boolean, overlay: boolean) => {
    set({ accessibilityEnabled: accessibility, overlayEnabled: overlay });
  },
}));
