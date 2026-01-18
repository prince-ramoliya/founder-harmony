import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Calculator, 
  DollarSign, 
  TrendingUp,
  Download,
  Sparkles
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Founder {
  id: string;
  name: string;
  equity_percentage: number;
  color: string;
}

export default function ExitSimulator() {
  const { workspace } = useWorkspace();
  const [exitAmount, setExitAmount] = useState(10000000);
  const [founders, setFounders] = useState<Founder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (workspace) {
      fetchFounders();
    }
  }, [workspace]);

  const fetchFounders = async () => {
    if (!workspace) return;
    
    try {
      const { data, error } = await supabase
        .from("founders")
        .select("id, name, equity_percentage, color")
        .eq("workspace_id", workspace.id)
        .order("equity_percentage", { ascending: false });

      if (error) throw error;
      setFounders(data || []);
    } catch (error) {
      console.error("Error fetching founders:", error);
    } finally {
      setLoading(false);
    }
  };

  const payouts = useMemo(() => {
    return founders.map(founder => ({
      ...founder,
      payout: (exitAmount * founder.equity_percentage) / 100,
    }));
  }, [founders, exitAmount]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const presetAmounts = [
    { label: "$1M", value: 1000000 },
    { label: "$5M", value: 5000000 },
    { label: "$10M", value: 10000000 },
    { label: "$25M", value: 25000000 },
    { label: "$50M", value: 50000000 },
    { label: "$100M", value: 100000000 },
  ];

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
              <div className="w-10 h-10 rounded gradient-primary flex items-center justify-center">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              Exit Simulator
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mt-2"
            >
              Calculate founder payouts for different exit scenarios
            </motion.p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Exit Amount Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded p-8 border border-border gradient-primary relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-white" />
              <h2 className="text-xl font-semibold text-white">Exit Amount</h2>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 text-white/60" />
                <Input
                  type="number"
                  value={exitAmount}
                  onChange={(e) => setExitAmount(Number(e.target.value))}
                  className="text-4xl font-bold h-20 pl-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-white/80">Quick Amounts</Label>
                <div className="flex flex-wrap gap-2">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setExitAmount(preset.value)}
                      className={`px-4 py-2 rounded font-medium transition-all ${
                        exitAmount === preset.value
                          ? "bg-white text-primary"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Slider
                  value={[exitAmount]}
                  onValueChange={(value) => setExitAmount(value[0])}
                  max={200000000}
                  min={100000}
                  step={100000}
                  className="[&_[role=slider]]:bg-white"
                />
                <div className="flex justify-between text-sm text-white/60">
                  <span>$100K</span>
                  <span>$200M</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Payout Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded p-6 border border-border"
          >
            <h3 className="text-lg font-semibold text-foreground mb-6">Payout Distribution</h3>
            {founders.length === 0 ? (
              <div className="h-72 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Add founders to see payout distribution.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={payouts}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="payout"
                        nameKey="name"
                      >
                        {payouts.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-popover border border-border rounded px-4 py-3 shadow-lg">
                                <p className="font-medium text-foreground">{data.name}</p>
                                <p className="text-lg font-bold text-foreground">
                                  {formatCurrency(data.payout)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {data.equity_percentage}% equity
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center mt-4">
                  <p className="text-sm text-muted-foreground">Total Exit Value</p>
                  <p className="text-3xl font-bold text-foreground">{formatCurrency(exitAmount)}</p>
                </div>
              </>
            )}
          </motion.div>

          {/* Founder Payouts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded p-6 border border-border"
          >
            <h3 className="text-lg font-semibold text-foreground mb-6">Founder Payouts</h3>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-muted rounded" />
                  </div>
                ))}
              </div>
            ) : payouts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No founders found. Add founders to see payout calculations.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payouts.map((founder, index) => (
                  <motion.div
                    key={founder.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ backgroundColor: `${founder.color}20`, color: founder.color }}
                      >
                        {founder.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{founder.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {founder.equity_percentage}% equity
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-foreground">
                        {formatCurrency(founder.payout)}
                      </p>
                      <div className="flex items-center gap-1 text-success text-sm">
                        <TrendingUp className="w-3 h-3" />
                        Payout
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Scenario Comparison */}
        {founders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded p-6 border border-border"
          >
            <h3 className="text-lg font-semibold text-foreground mb-6">Scenario Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Founder</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Equity</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">$1M Exit</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">$10M Exit</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">$50M Exit</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">$100M Exit</th>
                  </tr>
                </thead>
                <tbody>
                  {founders.map((founder) => (
                    <tr key={founder.id} className="border-b border-border/50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ backgroundColor: `${founder.color}20`, color: founder.color }}
                          >
                            {founder.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <span className="font-medium text-foreground">{founder.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right text-muted-foreground">
                        {founder.equity_percentage}%
                      </td>
                      <td className="py-4 px-4 text-right font-medium text-foreground">
                        {formatCurrency((1000000 * founder.equity_percentage) / 100)}
                      </td>
                      <td className="py-4 px-4 text-right font-medium text-foreground">
                        {formatCurrency((10000000 * founder.equity_percentage) / 100)}
                      </td>
                      <td className="py-4 px-4 text-right font-medium text-foreground">
                        {formatCurrency((50000000 * founder.equity_percentage) / 100)}
                      </td>
                      <td className="py-4 px-4 text-right font-medium text-success">
                        {formatCurrency((100000000 * founder.equity_percentage) / 100)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </motion.div>
    </MainLayout>
  );
}
