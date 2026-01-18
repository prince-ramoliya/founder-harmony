import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  History, 
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  TrendingUp,
  Wallet,
  Receipt,
  Users,
  ChevronRight
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";

interface AuditLogEntry {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_data: any;
  new_data: any;
  reason: string | null;
  created_at: string;
  user_id: string | null;
  profiles?: {
    full_name: string | null;
    email: string;
  };
}

const actionIcons: Record<string, typeof History> = {
  create: TrendingUp,
  update: FileText,
  delete: Receipt,
  equity_change: Users,
  approval: FileText,
  invite: Users,
};

const actionColors: Record<string, string> = {
  create: "text-success bg-success/10",
  update: "text-primary bg-primary/10",
  delete: "text-destructive bg-destructive/10",
  equity_change: "text-warning bg-warning/10",
  approval: "text-accent bg-accent/10",
  invite: "text-primary bg-primary/10",
};

export default function AuditLog() {
  const { workspace } = useWorkspace();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  useEffect(() => {
    if (workspace) {
      fetchLogs();
      
      // Subscribe to realtime updates
      const channel = supabase
        .channel("audit_logs_changes")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "audit_logs",
            filter: `workspace_id=eq.${workspace.id}`,
          },
          (payload) => {
            setLogs((prev) => [payload.new as AuditLogEntry, ...prev]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [workspace]);

  const fetchLogs = async () => {
    if (!workspace) return;

    try {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("workspace_id", workspace.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs((data || []) as AuditLogEntry[]);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(searchLower) ||
      log.entity_type.toLowerCase().includes(searchLower) ||
      log.reason?.toLowerCase().includes(searchLower) ||
      log.profiles?.full_name?.toLowerCase().includes(searchLower) ||
      log.profiles?.email?.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-foreground flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <History className="w-5 h-5 text-primary" />
              </div>
              Audit Log
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mt-2"
            >
              Immutable record of all actions and changes
            </motion.p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Immutable Records</p>
            <p className="text-sm text-muted-foreground">
              All actions are permanently logged with timestamps, user information, and complete change details. 
              These records cannot be edited or deleted, ensuring full transparency and accountability.
            </p>
          </div>
        </motion.div>

        {/* Logs List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl shadow-md overflow-hidden"
        >
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="w-10 h-10 bg-muted rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center">
              <History className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No logs match your search" : "No audit logs yet"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredLogs.map((log, index) => {
                const Icon = actionIcons[log.action] || History;
                const colorClass = actionColors[log.action] || "text-muted-foreground bg-muted";

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                    className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground">
                            {formatAction(log.action)}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {log.entity_type.replace(/_/g, " ")}
                          </span>
                        </div>
                        
                        {log.reason && (
                          <p className="text-sm text-muted-foreground mb-2">{log.reason}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {log.profiles?.full_name || log.profiles?.email || "System"}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(log.created_at)}
                          </div>
                        </div>
                      </div>
                      
                      <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${
                        selectedLog?.id === log.id ? "rotate-90" : ""
                      }`} />
                    </div>
                    
                    {/* Expanded Details */}
                    {selectedLog?.id === log.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 ml-14 space-y-3"
                      >
                        {log.old_data && (
                          <div className="p-3 bg-destructive/5 rounded-lg">
                            <p className="text-xs font-medium text-destructive mb-1">Previous Data</p>
                            <pre className="text-xs text-muted-foreground overflow-auto">
                              {JSON.stringify(log.old_data, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.new_data && (
                          <div className="p-3 bg-success/5 rounded-lg">
                            <p className="text-xs font-medium text-success mb-1">New Data</p>
                            <pre className="text-xs text-muted-foreground overflow-auto">
                              {JSON.stringify(log.new_data, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.entity_id && (
                          <p className="text-xs text-muted-foreground">
                            Entity ID: <code className="bg-muted px-1 rounded">{log.entity_id}</code>
                          </p>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}
