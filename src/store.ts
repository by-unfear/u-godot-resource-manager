import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppStore, ResourceRecord } from "./types";

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      projectPath: null,
      selectedType: null,
      selectedFile: null,
      resources: {},
      refreshKey: 0,
      editingSchema: false,
      schemas: [],

      triggerRefresh: () => set((s) => ({ refreshKey: s.refreshKey + 1 })),
      setEditingSchema: (v) => set({ editingSchema: v, selectedType: null, selectedFile: null }),
      setSchemas: (list) => set({ schemas: list }),
      setProjectPath: (path) => set({ projectPath: path, resources: {} }),
      setSelectedType: (type) => set({ selectedType: type, selectedFile: null }),
      setSelectedFile: (path) => set({ selectedFile: path }),

      setResources: (type, list) =>
        set((s) => ({ resources: { ...s.resources, [type]: list } })),

      upsertResource: (record) => {
        const { resources } = get();
        const list = resources[record._type] ?? [];
        const idx = list.findIndex((r) => r._path === record._path);
        const next = idx >= 0
          ? list.map((r, i) => (i === idx ? record : r))
          : [...list, record];
        set((s) => ({ resources: { ...s.resources, [record._type]: next } }));
      },

      removeResource: (type, path) => {
        const { resources } = get();
        const list = (resources[type] ?? []).filter((r) => r._path !== path);
        set((s) => ({ resources: { ...s.resources, [type]: list } }));
      },
    }),
    {
      name: "grm-storage",
      partialize: (s) => ({ projectPath: s.projectPath }),
    }
  )
);
