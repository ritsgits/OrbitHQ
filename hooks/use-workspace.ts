import { useWorkspaceStore } from "@/store/use-workspace-store"

export const useWorkspace = () => {
  const { activeWorkspaceId, setActiveWorkspace } = useWorkspaceStore()
  
  return {
    activeWorkspaceId,
    setActiveWorkspace
  }
}
