import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";

interface Founder {
  name: string;
  value: number;
  color: string;
}

export function EquityPieChart() {
  const { workspace } = useWorkspace();
  const [data, setData] = useState<Founder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (workspace?.id) {
      fetchFounders();

      const channel = supabase
        .channel('equity_pie_founders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'founders', filter: `workspace_id=eq.${workspace.id}` }, fetchFounders)
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [workspace?.id]);

  const fetchFounders = async () => {
    if (!workspace?.id) return;

    try {
      const { data: founders } = await supabase
        .from("founders")
        .select("name, equity_percentage, color")
        .eq("workspace_id", workspace.id)
        .order("equity_percentage", { ascending: false });

      if (founders) {
        setData(founders.map(f => ({
          name: f.name,
          value: f.equity_percentage,
          color: f.color || "#3B82F6",
        })));
      }
    } catch (error) {
      console.error("Error fetching founders:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-[6px] p-6 shadow-md flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-card rounded-[6px] p-6 shadow-md"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Equity Distribution</h3>
          <p className="text-sm text-muted-foreground">Current ownership breakdown</p>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-popover border border-border rounded-[6px] px-3 py-2 shadow-lg">
                        <p className="font-medium text-foreground">{payload[0].name}</p>
                        <p className="text-sm text-muted-foreground">{payload[0].value}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-3">
          {data.map((founder, index) => (
            <motion.div
              key={founder.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-[6px] bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: founder.color }}
                />
                <span className="font-medium text-foreground">{founder.name}</span>
              </div>
              <span className="text-lg font-semibold text-foreground">{founder.value}%</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
