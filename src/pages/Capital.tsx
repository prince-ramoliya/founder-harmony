import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Wallet, 
  Plus, 
  TrendingUp,
  Calendar,
  User,
  DollarSign,
  ArrowUpRight
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";

interface Contribution {
  id: string;
  amount: number;
  contribution_type: string;
  created_at: string;
  status: string;
  equity_impact: boolean | null;
  founder_id: string;
  founder?: {
    name: string;
    color: string;
  };
}

interface Founder {
  id: string;
  name: string;
  color: string;
}

interface FounderTotal {
  name: string;
  total: number;
  color: string;
  avatar: string;
}

export default function Capital() {
  const { workspace } = useWorkspace();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [founders, setFounders] = useState<Founder[]>([]);
  const [founderTotals, setFounderTotals] = useState<FounderTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContribution, setNewContribution] = useState({
    founder_id: "",
    amount: "",
    type: "Cash",
    equity_impact: true
  });

  useEffect(() => {
    if (workspace) {
      fetchData();
    }
  }, [workspace]);

  const fetchData = async () => {
    if (!workspace) return;
    setLoading(true);
    try {
      // Fetch founders
      const { data: foundersData, error: foundersError } = await supabase
        .from("founders")
        .select("id, name, color")
        .eq("workspace_id", workspace.id);

      if (foundersError) throw foundersError;
      setFounders(foundersData || []);

      // Fetch contributions with founder info
      const { data: contributionsData, error: contributionsError } = await supabase
        .from("capital_contributions")
        .select(`
          id,
          amount,
          contribution_type,
          created_at,
          status,
          equity_impact,
          founder_id,
          founders (name, color)
        `)
        .eq("workspace_id", workspace.id)
        .order("created_at", { ascending: false });

      if (contributionsError) throw contributionsError;

      const formattedContributions = (contributionsData || []).map((c: any) => ({
        ...c,
        founder: c.founders
      }));
      setContributions(formattedContributions);

      // Calculate founder totals
      const totals: Record<string, { name: string; total: number; color: string }> = {};
      formattedContributions.forEach((c: any) => {
        if (c.founder) {
          if (!totals[c.founder_id]) {
            totals[c.founder_id] = {
              name: c.founder.name,
              total: 0,
              color: c.founder.color || "#4F46E5"
            };
          }
          totals[c.founder_id].total += c.amount;
        }
      });

      const totalsArray = Object.values(totals).map(t => ({
        ...t,
        avatar: t.name.split(" ").map(n => n[0]).join("").slice(0, 2)
      }));
      setFounderTotals(totalsArray);

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load capital data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddContribution = async () => {
    if (!workspace || !newContribution.founder_id || !newContribution.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { error } = await supabase
        .from("capital_contributions")
        .insert({
          workspace_id: workspace.id,
          founder_id: newContribution.founder_id,
          amount: parseFloat(newContribution.amount),
          contribution_type: newContribution.type,
          equity_impact: newContribution.equity_impact,
          status: "Confirmed"
        });

      if (error) throw error;

      toast.success("Contribution added successfully");
      setDialogOpen(false);
      setNewContribution({ founder_id: "", amount: "", type: "Cash", equity_impact: true });
      fetchData();
    } catch (error) {
      console.error("Error adding contribution:", error);
      toast.error("Failed to add contribution");
    }
  };

  const totalCapital = founderTotals.reduce((sum, f) => sum + f.total, 0);

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
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              Capital Contributions
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mt-2"
            >
              Track founder investments and capital contributions
            </motion.p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Contribution
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Capital Contribution</DialogTitle>
                <DialogDescription>
                  Record a new capital contribution from a founder.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Founder</Label>
                  <select 
                    className="w-full px-3 py-2 rounded border border-input bg-background text-foreground"
                    value={newContribution.founder_id}
                    onChange={(e) => setNewContribution({ ...newContribution, founder_id: e.target.value })}
                  >
                    <option value="">Select founder...</option>
                    {founders.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Amount ($)</Label>
                  <Input 
                    type="number" 
                    placeholder="e.g., 10000"
                    value={newContribution.amount}
                    onChange={(e) => setNewContribution({ ...newContribution, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select 
                    className="w-full px-3 py-2 rounded border border-input bg-background text-foreground"
                    value={newContribution.type}
                    onChange={(e) => setNewContribution({ ...newContribution, type: e.target.value })}
                  >
                    <option>Cash</option>
                    <option>Equipment</option>
                    <option>IP/Assets</option>
                    <option>Services</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="equityImpact" 
                    className="rounded" 
                    checked={newContribution.equity_impact}
                    onChange={(e) => setNewContribution({ ...newContribution, equity_impact: e.target.checked })}
                  />
                  <Label htmlFor="equityImpact" className="cursor-pointer">Impacts equity distribution</Label>
                </div>
                <Button className="w-full gradient-primary" onClick={handleAddContribution}>
                  Add Contribution
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
            className="bg-card rounded p-6 border border-border gradient-primary"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded bg-white/20 flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <p className="text-primary-foreground/80 text-sm">Total Capital</p>
                <p className="text-3xl font-bold text-primary-foreground">
                  ${totalCapital.toLocaleString()}
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
              <div className="w-14 h-14 rounded bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-success" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Contributions</p>
                <p className="text-3xl font-bold text-foreground">{contributions.length}</p>
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
                <User className="w-7 h-7 text-warning" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Contributing Founders</p>
                <p className="text-3xl font-bold text-foreground">{founderTotals.length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Founder Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded p-6 border border-border"
        >
          <h3 className="text-lg font-semibold text-foreground mb-6">Contribution by Founder</h3>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse h-12 bg-muted rounded" />
              ))}
            </div>
          ) : founderTotals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No contributions yet. Add your first capital contribution.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {founderTotals.map((founder, index) => {
                const percentage = totalCapital > 0 ? (founder.total / totalCapital) * 100 : 0;
                return (
                  <motion.div
                    key={founder.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
                      style={{ backgroundColor: `${founder.color}20`, color: founder.color }}
                    >
                      {founder.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-foreground">{founder.name}</span>
                        <span className="font-semibold text-foreground">
                          ${founder.total.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: founder.color }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground w-16 text-right">
                      {percentage.toFixed(1)}%
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Contribution History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Contribution History</h3>
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
          ) : contributions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No contribution history yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Founder</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {contributions.map((contribution, index) => (
                    <motion.tr
                      key={contribution.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                            style={{ 
                              backgroundColor: `${contribution.founder?.color || '#4F46E5'}20`, 
                              color: contribution.founder?.color || '#4F46E5' 
                            }}
                          >
                            {contribution.founder?.name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "??"}
                          </div>
                          <span className="font-medium text-foreground">{contribution.founder?.name || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-foreground">
                        ${contribution.amount.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">{contribution.contribution_type}</td>
                      <td className="py-4 px-4 text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {new Date(contribution.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                          {contribution.status}
                        </span>
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
