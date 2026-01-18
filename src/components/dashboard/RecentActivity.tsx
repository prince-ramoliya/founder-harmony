import { useEffect, useState } from "react";
import { 
  Wallet, 
  Receipt, 
  TrendingUp, 
  Users, 
  ArrowUpRight 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  icon: any;
  color: string;
}

const getIconConfig = (action: string, entityType: string) => {
  if (entityType === "capital_contribution" || action === "capital") {
    return { icon: Wallet, color: "text-primary bg-primary/10" };
  }
  if (entityType === "expense" || action === "expense") {
    return { icon: Receipt, color: "text-warning bg-warning/10" };
  }
  if (entityType === "revenue" || action === "revenue") {
    return { icon: TrendingUp, color: "text-success bg-success/10" };
  }
  return { icon: Users, color: "text-accent bg-accent/10" };
};

const formatTimeAgo = (date: string) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return past.toLocaleDateString();
};

export function RecentActivity() {
  const { workspace } = useWorkspace();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (workspace?.id) {
      fetchActivity();

      const channel = supabase
        .channel('activity_logs')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs', filter: `workspace_id=eq.${workspace.id}` }, fetchActivity)
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [workspace?.id]);

  const fetchActivity = async () => {
    if (!workspace?.id) return;

    try {
      const { data: logs } = await supabase
        .from("audit_logs")
        .select("id, action, entity_type, new_data, created_at")
        .eq("workspace_id", workspace.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (logs) {
        const formattedActivities = logs.map(log => {
          const { icon, color } = getIconConfig(log.action, log.entity_type);
          const newData = log.new_data as any;
          
          let description = "";
          if (log.entity_type === "founder") {
            description = newData?.name ? `${newData.name} - ${newData.equity_percentage}%` : "Founder update";
          } else if (log.entity_type === "expense") {
            description = newData?.description || "Expense logged";
          } else if (log.entity_type === "revenue") {
            description = newData?.source || "Revenue received";
          } else {
            description = log.action.replace('_', ' ');
          }

          return {
            id: log.id,
            type: log.entity_type,
            title: `${log.entity_type.replace('_', ' ')} ${log.action}`.replace(/\b\w/g, l => l.toUpperCase()),
            description,
            time: formatTimeAgo(log.created_at),
            icon,
            color,
          };
        });

        setActivities(formattedActivities);
      }
    } catch (error) {
      console.error("Error fetching activity:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded border p-6 flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">Latest financial updates</p>
        </div>
        <a href="/audit-log" className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors">
          View all
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No recent activity</p>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-3 rounded hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className={cn(
                "w-10 h-10 rounded flex items-center justify-center flex-shrink-0",
                activity.color
              )}>
                <activity.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{activity.title}</p>
                <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {activity.time}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
