import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface Workspace {
  id: string;
  name: string;
  created_at: string;
}

interface WorkspaceContextType {
  workspace: Workspace | null;
  workspaces: Workspace[];
  loading: boolean;
  setCurrentWorkspace: (workspace: Workspace) => void;
  refetchWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkspaces = async () => {
    if (!user) {
      setWorkspaces([]);
      setWorkspace(null);
      setLoading(false);
      return;
    }

    try {
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("workspace_id")
        .eq("user_id", user.id);

      if (rolesError) throw rolesError;

      if (userRoles && userRoles.length > 0) {
        const workspaceIds = userRoles.map(r => r.workspace_id);
        const { data: workspacesData, error: workspacesError } = await supabase
          .from("workspaces")
          .select("*")
          .in("id", workspaceIds);

        if (workspacesError) throw workspacesError;

        setWorkspaces(workspacesData || []);
        
        // Set first workspace as current if none selected
        if (!workspace && workspacesData && workspacesData.length > 0) {
          setWorkspace(workspacesData[0]);
        }
      } else {
        setWorkspaces([]);
        setWorkspace(null);
      }
    } catch (error) {
      console.error("Error fetching workspaces:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [user]);

  const setCurrentWorkspace = (ws: Workspace) => {
    setWorkspace(ws);
  };

  return (
    <WorkspaceContext.Provider value={{ 
      workspace, 
      workspaces, 
      loading, 
      setCurrentWorkspace,
      refetchWorkspaces: fetchWorkspaces 
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
