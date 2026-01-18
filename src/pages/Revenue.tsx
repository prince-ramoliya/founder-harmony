import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Plus, 
  Calendar,
  DollarSign,
  Repeat,
  ArrowUpRight,
  MoreHorizontal
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { toast } from "sonner";

interface RevenueEntry {
  id: string;
  source: string;
  amount: number;
  created_at: string;
  revenue_type: string;
  status: string;
}

export default function Revenue() {
  const { workspace } = useWorkspace();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [revenueEntries, setRevenueEntries] = useState<RevenueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRevenue, setNewRevenue] = useState({
    source: "",
    amount: "",
    date: "",
    type: "One-time"
  });

  useEffect(() => {
    if (workspace) {
      fetchRevenue();
    }
  }, [workspace]);

  const fetchRevenue = async () => {
    if (!workspace) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("revenue")
        .select("*")
        .eq("workspace_id", workspace.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRevenueEntries(data || []);
    } catch (error) {
      console.error("Error fetching revenue:", error);
      toast.error("Failed to load revenue data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRevenue = async () => {
    if (!workspace || !newRevenue.source || !newRevenue.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { error } = await supabase
        .from("revenue")
        .insert({
          workspace_id: workspace.id,
          source: newRevenue.source,
          amount: parseFloat(newRevenue.amount),
          revenue_type: newRevenue.type,
          status: "Received"
        });

      if (error) throw error;

      toast.success("Revenue entry added successfully");
      setDialogOpen(false);
      setNewRevenue({ source: "", amount: "", date: "", type: "One-time" });
      fetchRevenue();
    } catch (error) {
      console.error("Error adding revenue:", error);
      toast.error("Failed to add revenue entry");
    }
  };

  const totalRevenue = useMemo(() => 
    revenueEntries.reduce((sum, e) => sum + e.amount, 0), 
    [revenueEntries]
  );
  
  const recurringRevenue = useMemo(() => 
    revenueEntries.filter(e => e.revenue_type === "Recurring").reduce((sum, e) => sum + e.amount, 0), 
    [revenueEntries]
  );
  
  const oneTimeRevenue = useMemo(() => 
    revenueEntries.filter(e => e.revenue_type === "One-time").reduce((sum, e) => sum + e.amount, 0), 
    [revenueEntries]
  );

  // Group revenue by month for chart
  const revenueData = useMemo(() => {
    const monthlyData: Record<string, number> = {};
    revenueEntries.forEach(entry => {
      const date = new Date(entry.created_at);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + entry.amount;
    });
    return Object.entries(monthlyData).map(([month, revenue]) => ({ month, revenue }));
  }, [revenueEntries]);

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
              <div className="w-10 h-10 rounded bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              Revenue Tracking
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mt-2"
            >
              Track all revenue sources and growth
            </motion.p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-success">
                <Plus className="w-4 h-4 mr-2" />
                Add Revenue
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Revenue Entry</DialogTitle>
                <DialogDescription>
                  Record a new revenue entry.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Source / Description</Label>
                  <Input 
                    placeholder="e.g., Client payment - Acme Corp"
                    value={newRevenue.source}
                    onChange={(e) => setNewRevenue({ ...newRevenue, source: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount ($)</Label>
                    <Input 
                      type="number" 
                      placeholder="0.00"
                      value={newRevenue.amount}
                      onChange={(e) => setNewRevenue({ ...newRevenue, amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input 
                      type="date"
                      value={newRevenue.date}
                      onChange={(e) => setNewRevenue({ ...newRevenue, date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select 
                    className="w-full px-3 py-2 rounded border border-input bg-background text-foreground"
                    value={newRevenue.type}
                    onChange={(e) => setNewRevenue({ ...newRevenue, type: e.target.value })}
                  >
                    <option>One-time</option>
                    <option>Recurring</option>
                  </select>
                </div>
                <Button className="w-full gradient-success" onClick={handleAddRevenue}>
                  Add Revenue
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded p-6 border border-border gradient-success"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded bg-white/20 flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-success-foreground" />
              </div>
              <div>
                <p className="text-success-foreground/80 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-success-foreground">
                  ${totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded p-6 border border-border"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded bg-primary/10 flex items-center justify-center">
                <Repeat className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Recurring Revenue</p>
                <p className="text-3xl font-bold text-foreground">
                  ${recurringRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded p-6 border border-border"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded bg-warning/10 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-warning" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">One-time Revenue</p>
                <p className="text-3xl font-bold text-foreground">
                  ${oneTimeRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded p-6 border border-border"
        >
          <h3 className="text-lg font-semibold text-foreground mb-6">Revenue Over Time</h3>
          {revenueData.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No revenue data yet. Add your first revenue entry.</p>
              </div>
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(220 9% 46%)", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(220 9% 46%)", fontSize: 12 }}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-popover border border-border rounded px-4 py-3 shadow-lg">
                            <p className="font-medium text-foreground mb-1">{label}</p>
                            <p className="text-sm text-success">
                              Revenue: ${(payload[0].value as number).toLocaleString()}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="#10B981" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Revenue Entries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Recent Revenue</h3>
            <button className="flex items-center gap-1 text-sm text-primary hover:text-primary/80">
              Export
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse h-16 bg-muted rounded" />
              ))}
            </div>
          ) : revenueEntries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No revenue entries yet. Add your first revenue.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Source</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {revenueEntries.map((entry, index) => (
                    <motion.tr
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <span className="font-medium text-foreground">{entry.source}</span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-success">
                        +${entry.amount.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {new Date(entry.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          entry.revenue_type === "Recurring" 
                            ? "bg-primary/10 text-primary" 
                            : "bg-warning/10 text-warning"
                        }`}>
                          {entry.revenue_type === "Recurring" && <Repeat className="w-3 h-3" />}
                          {entry.revenue_type}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                          {entry.status}
                        </span>
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
          )}
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}
