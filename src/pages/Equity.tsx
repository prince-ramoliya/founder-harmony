import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  PieChart, 
  Plus, 
  History, 
  ChevronRight,
  ArrowUpRight,
  MoreHorizontal
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";

interface Founder {
  id: string;
  name: string;
  role_title: string | null;
  equity_percentage: number;
  color: string | null;
  avatar: string | null;
}

interface EquityHistory {
  id: string;
  action: string;
  created_at: string;
  reason: string | null;
  old_data: any;
  new_data: any;
}

export default function Equity() {
  const { workspace } = useWorkspace();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [founders, setFounders] = useState<Founder[]>([]);
  const [history, setHistory] = useState<EquityHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFounder, setSelectedFounder] = useState("");
  const [newEquity, setNewEquity] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (workspace?.id) {
      fetchData();

      // Realtime subscription for founders
      const channel = supabase
        .channel('founders_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'founders', filter: `workspace_id=eq.${workspace.id}` }, fetchData)
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [workspace?.id]);

  const fetchData = async () => {
    if (!workspace?.id) return;

    try {
      const [foundersRes, historyRes] = await Promise.all([
        supabase
          .from("founders")
          .select("id, name, role_title, equity_percentage, color, avatar")
          .eq("workspace_id", workspace.id)
          .order("equity_percentage", { ascending: false }),
        supabase
          .from("audit_logs")
          .select("id, action, created_at, reason, old_data, new_data")
          .eq("workspace_id", workspace.id)
          .eq("entity_type", "founder")
          .in("action", ["equity_change", "create"])
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      if (foundersRes.data) setFounders(foundersRes.data);
      if (historyRes.data) setHistory(historyRes.data);
    } catch (error) {
      console.error("Error fetching equity data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEquityChange = async () => {
    if (!workspace?.id || !selectedFounder || !newEquity) return;

    setSubmitting(true);
    try {
      const founder = founders.find(f => f.id === selectedFounder);
      const oldEquity = founder?.equity_percentage || 0;
      const newEquityNum = parseFloat(newEquity);

      // Update founder equity
      const { error: updateError } = await supabase
        .from("founders")
        .update({ equity_percentage: newEquityNum })
        .eq("id", selectedFounder);

      if (updateError) throw updateError;

      // Log the change
      const { error: logError } = await supabase
        .from("audit_logs")
        .insert({
          workspace_id: workspace.id,
          entity_type: "founder",
          entity_id: selectedFounder,
          action: "equity_change",
          old_data: { equity_percentage: oldEquity },
          new_data: { equity_percentage: newEquityNum },
          reason: reason || null,
        });

      if (logError) throw logError;

      toast({
        title: "Equity updated",
        description: `${founder?.name}'s equity has been updated to ${newEquityNum}%`,
      });

      setDialogOpen(false);
      setSelectedFounder("");
      setNewEquity("");
      setReason("");
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const chartData = founders.map(f => ({
    name: f.name,
    value: f.equity_percentage,
    color: f.color || "#3B82F6",
  }));

  const totalCapital = founders.length > 0 ? 
    founders.reduce((sum, f) => sum + (f.equity_percentage * 1000), 0) : 0;

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
              <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                <PieChart className="w-5 h-5 text-primary" />
              </div>
              Equity Management
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mt-2"
            >
              Track and manage founder equity distribution
            </motion.p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary shadow-glow">
                <Plus className="w-4 h-4 mr-2" />
                Adjust Equity
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adjust Equity</DialogTitle>
                <DialogDescription>
                  Propose an equity adjustment. All founders must approve.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Founder</Label>
                  <select 
                    className="w-full px-3 py-2 rounded-[6px] border border-input bg-background text-foreground"
                    value={selectedFounder}
                    onChange={(e) => setSelectedFounder(e.target.value)}
                  >
                    <option value="">Select a founder</option>
                    {founders.map((f) => (
                      <option key={f.id} value={f.id}>{f.name} ({f.equity_percentage}%)</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>New Equity Percentage</Label>
                  <Input 
                    type="number" 
                    placeholder="e.g., 42"
                    value={newEquity}
                    onChange={(e) => setNewEquity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Input 
                    placeholder="e.g., Additional capital contribution"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full gradient-primary"
                  onClick={handleEquityChange}
                  disabled={submitting || !selectedFounder || !newEquity}
                >
                  {submitting ? "Updating..." : "Submit for Approval"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Cap Table Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pie Chart */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="lg:col-span-1 bg-card rounded border p-6"
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">Ownership Split</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-popover border border-border rounded px-3 py-2">
                                <p className="font-medium text-foreground">{payload[0].name}</p>
                                <p className="text-sm text-muted-foreground">{payload[0].value}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Equity</p>
                  <p className="text-2xl font-bold text-foreground">100%</p>
                </div>
              </motion.div>

              {/* Founders List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-2 bg-card rounded border p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Cap Table</h3>
                  <button className="flex items-center gap-1 text-sm text-primary hover:text-primary/80">
                    Export
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Founder</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Equity</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Value Est.</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {founders.map((founder, index) => (
                        <motion.tr
                          key={founder.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
                                style={{ backgroundColor: `${founder.color || '#3B82F6'}20`, color: founder.color || '#3B82F6' }}
                              >
                                {founder.avatar || getInitials(founder.name)}
                              </div>
                              <span className="font-medium text-foreground">{founder.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-muted-foreground">{founder.role_title || "Co-founder"}</td>
                          <td className="py-4 px-4 text-right">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: `${founder.color || '#3B82F6'}15`, color: founder.color || '#3B82F6' }}>
                              {founder.equity_percentage}%
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right font-medium text-foreground">
                            ${(founder.equity_percentage * 1000).toLocaleString()}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button className="p-2 hover:bg-muted rounded transition-colors">
                              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>

            {/* Equity History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded border p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                    <History className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Equity History</h3>
                    <p className="text-sm text-muted-foreground">All changes are logged and immutable</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {history.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No equity changes recorded yet</p>
                ) : (
                  history.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded border border-border hover:bg-muted/30 transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground capitalize">
                            {entry.action.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            {new Date(entry.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {entry.reason || 
                            (entry.old_data && entry.new_data ? 
                              `Equity changed from ${entry.old_data.equity_percentage}% to ${entry.new_data.equity_percentage}%` :
                              "Equity adjustment"
                            )
                          }
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </MainLayout>
  );
}
