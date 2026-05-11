import { create } from 'zustand'

interface WorkspaceState {
  activeWorkspaceId: string | null
  workspaces: any[]
  setActiveWorkspace: (id: string) => void
  setWorkspaces: (workspaces: any[]) => void
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeWorkspaceId: null,
  workspaces: [],
  setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),
  setWorkspaces: (workspaces) => set({ workspaces }),
}))
