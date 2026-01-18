import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart,
  ArrowUpRight,
  Plus 
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { EquityPieChart } from "@/components/dashboard/EquityPieChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

interface DashboardData {
  totalRevenue: number;
  totalExpenses: number;
  totalCapital: number;
  userEquity: number;
  userName: string;
}

export default function Dashboard() {
  const { workspace } = useWorkspace();
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({
    totalRevenue: 0,
    totalExpenses: 0,
    totalCapital: 0,
    userEquity: 0,
    userName: "there",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (workspace?.id && user?.id) {
      fetchDashboardData();
      
      // Set up realtime subscriptions
      const channels = [
        supabase
          .channel('revenue_changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'revenue', filter: `workspace_id=eq.${workspace.id}` }, fetchDashboardData)
          .subscribe(),
        supabase
          .channel('expenses_changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: `workspace_id=eq.${workspace.id}` }, fetchDashboardData)
          .subscribe(),
        supabase
          .channel('capital_changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'capital_contributions', filter: `workspace_id=eq.${workspace.id}` }, fetchDashboardData)
          .subscribe(),
      ];

      return () => {
        channels.forEach(channel => supabase.removeChannel(channel));
      };
    }
  }, [workspace?.id, user?.id]);

  const fetchDashboardData = async () => {
    if (!workspace?.id || !user?.id) return;

    try {
      const [revenueRes, expensesRes, capitalRes, founderRes, profileRes] = await Promise.all([
        supabase
          .from("revenue")
          .select("amount")
          .eq("workspace_id", workspace.id),
        supabase
          .from("expenses")
          .select("amount")
          .eq("workspace_id", workspace.id),
        supabase
          .from("capital_contributions")
          .select("amount")
          .eq("workspace_id", workspace.id),
        supabase
          .from("founders")
          .select("equity_percentage")
          .eq("workspace_id", workspace.id)
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      const totalRevenue = revenueRes.data?.reduce((sum, r) => sum + r.amount, 0) || 0;
      const totalExpenses = expensesRes.data?.reduce((sum, e) => sum + e.amount, 0) || 0;
      const totalCapital = capitalRes.data?.reduce((sum, c) => sum + c.amount, 0) || 0;
      const userEquity = founderRes.data?.equity_percentage || 0;
      const firstName = profileRes.data?.full_name?.split(' ')[0] || "there";

      setData({
        totalRevenue,
        totalExpenses,
        totalCapital,
        userEquity,
        userName: firstName,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const balance = data.totalRevenue + data.totalCapital - data.totalExpenses;

  return (
    <MainLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-foreground"
            >
              Welcome back, {data.userName}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mt-1"
            >
              Here's what's happening with your company today.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button className="gradient-primary shadow-glow">
              <Plus className="w-4 h-4 mr-2" />
              Quick Action
            </Button>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Company Balance"
            value={`$${balance.toLocaleString()}`}
            change={balance > 0 ? "Positive" : "Negative"}
            changeType={balance > 0 ? "positive" : "negative"}
            icon={DollarSign}
            variant="primary"
          />
          <StatCard
            title="Total Revenue"
            value={`$${data.totalRevenue.toLocaleString()}`}
            icon={TrendingUp}
            variant="success"
          />
          <StatCard
            title="Total Expenses"
            value={`$${data.totalExpenses.toLocaleString()}`}
            icon={TrendingDown}
          />
          <StatCard
            title="Your Equity"
            value={`${data.userEquity}%`}
            change="No change"
            changeType="neutral"
            icon={PieChart}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EquityPieChart />
          <RecentActivity />
        </div>

        {/* Cash Flow Chart */}
        <CashFlowChart />

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-[6px] p-6 shadow-md"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Add Expense", color: "bg-warning/10 text-warning hover:bg-warning/20", href: "/expenses" },
              { label: "Log Revenue", color: "bg-success/10 text-success hover:bg-success/20", href: "/revenue" },
              { label: "Contribute Capital", color: "bg-primary/10 text-primary hover:bg-primary/20", href: "/capital" },
              { label: "Update Equity", color: "bg-accent/10 text-accent hover:bg-accent/20", href: "/equity" },
            ].map((action, index) => (
              <motion.a
                key={action.label}
                href={action.href}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center justify-between p-4 rounded-[6px] font-medium transition-colors ${action.color}`}
              >
                {action.label}
                <ArrowUpRight className="w-4 h-4" />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}
