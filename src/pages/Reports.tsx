import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Download,
  PieChart,
  TrendingUp,
  Receipt,
  Wallet,
  ArrowUpRight,
  Calendar
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { toast } from "sonner";

interface ReportStats {
  foundersCount: number;
  revenueTotal: number;
  expensesTotal: number;
  capitalTotal: number;
}

export default function Reports() {
  const { workspace } = useWorkspace();
  const [stats, setStats] = useState<ReportStats>({
    foundersCount: 0,
    revenueTotal: 0,
    expensesTotal: 0,
    capitalTotal: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (workspace) {
      fetchStats();
    }
  }, [workspace]);

  const fetchStats = async () => {
    if (!workspace) return;
    setLoading(true);
    try {
      const [foundersRes, revenueRes, expensesRes, capitalRes] = await Promise.all([
        supabase.from("founders").select("id").eq("workspace_id", workspace.id),
        supabase.from("revenue").select("amount").eq("workspace_id", workspace.id),
        supabase.from("expenses").select("amount").eq("workspace_id", workspace.id),
        supabase.from("capital_contributions").select("amount").eq("workspace_id", workspace.id)
      ]);

      setStats({
        foundersCount: foundersRes.data?.length || 0,
        revenueTotal: revenueRes.data?.reduce((sum, r) => sum + r.amount, 0) || 0,
        expensesTotal: expensesRes.data?.reduce((sum, e) => sum + e.amount, 0) || 0,
        capitalTotal: capitalRes.data?.reduce((sum, c) => sum + c.amount, 0) || 0
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (reportName: string, format: string) => {
    toast.info(`Generating ${reportName} in ${format} format...`);
    // In a real app, this would trigger an actual export
  };

  const reports = [
    {
      id: 1,
      name: "Equity Cap Table",
      description: "Current ownership breakdown with full history",
      icon: PieChart,
      color: "#4F46E5",
      hasData: stats.foundersCount > 0,
      formats: ["PDF", "CSV"]
    },
    {
      id: 2,
      name: "Profit & Loss Statement",
      description: "Monthly P&L with revenue and expense breakdown",
      icon: TrendingUp,
      color: "#10B981",
      hasData: stats.revenueTotal > 0 || stats.expensesTotal > 0,
      formats: ["PDF", "Excel"]
    },
    {
      id: 3,
      name: "Expense Report",
      description: "Detailed expense breakdown by category and owner",
      icon: Receipt,
      color: "#F59E0B",
      hasData: stats.expensesTotal > 0,
      formats: ["PDF", "CSV"]
    },
    {
      id: 4,
      name: "Capital Contributions",
      description: "All founder contributions with timestamps",
      icon: Wallet,
      color: "#8B5CF6",
      hasData: stats.capitalTotal > 0,
      formats: ["PDF", "CSV"]
    },
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
              <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              Reports & Exports
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mt-2"
            >
              Generate and download financial reports
            </motion.p>
          </div>
        </div>

        {/* Report Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded p-6 border border-border hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div 
                  className="w-14 h-14 rounded flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${report.color}15` }}
                >
                  <report.icon className="w-7 h-7" style={{ color: report.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-foreground mb-1">{report.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                  {!report.hasData && !loading ? (
                    <p className="text-sm text-muted-foreground italic">No data available yet</p>
                  ) : (
                    <div className="flex items-center gap-2">
                      {report.formats.map((format) => (
                        <Button
                          key={format}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          disabled={!report.hasData || loading}
                          onClick={() => handleExport(report.name, format)}
                        >
                          <Download className="w-3 h-3 mr-1.5" />
                          {format}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Investor-Ready Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded p-6 border border-border gradient-primary"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-primary-foreground mb-2">
                Investor-Ready Summary
              </h3>
              <p className="text-primary-foreground/80">
                Generate a comprehensive report perfect for investor meetings and due diligence.
              </p>
            </div>
            <Button 
              className="bg-white/20 hover:bg-white/30 text-primary-foreground border-0"
              disabled={stats.foundersCount === 0 && stats.revenueTotal === 0}
              onClick={() => handleExport("Investor Summary", "PDF")}
            >
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded p-6 border border-border"
        >
          <h3 className="text-lg font-semibold text-foreground mb-6">Data Summary</h3>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse h-20 bg-muted rounded" />
              ))}
            </div>
          ) : stats.foundersCount === 0 && stats.revenueTotal === 0 && stats.expensesTotal === 0 && stats.capitalTotal === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No data available yet. Start by adding founders, revenue, or expenses.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded border border-border">
                <p className="text-sm text-muted-foreground">Founders</p>
                <p className="text-2xl font-bold text-foreground">{stats.foundersCount}</p>
              </div>
              <div className="p-4 rounded border border-border">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-success">${stats.revenueTotal.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded border border-border">
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-destructive">${stats.expensesTotal.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded border border-border">
                <p className="text-sm text-muted-foreground">Total Capital</p>
                <p className="text-2xl font-bold text-primary">${stats.capitalTotal.toLocaleString()}</p>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}
