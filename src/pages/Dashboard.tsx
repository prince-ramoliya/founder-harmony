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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Dashboard() {
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
              Welcome back, John
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
            value="$127,450"
            change="+12.5%"
            changeType="positive"
            icon={DollarSign}
            variant="primary"
          />
          <StatCard
            title="Total Revenue"
            value="$284,000"
            change="+8.2%"
            changeType="positive"
            icon={TrendingUp}
            variant="success"
          />
          <StatCard
            title="Total Expenses"
            value="$156,550"
            change="+3.1%"
            changeType="negative"
            icon={TrendingDown}
          />
          <StatCard
            title="Your Equity"
            value="40%"
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
          className="bg-card rounded-2xl p-6 shadow-md"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Add Expense", color: "bg-warning/10 text-warning hover:bg-warning/20" },
              { label: "Log Revenue", color: "bg-success/10 text-success hover:bg-success/20" },
              { label: "Contribute Capital", color: "bg-primary/10 text-primary hover:bg-primary/20" },
              { label: "Update Equity", color: "bg-accent/10 text-accent hover:bg-accent/20" },
            ].map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center justify-between p-4 rounded-xl font-medium transition-colors ${action.color}`}
              >
                {action.label}
                <ArrowUpRight className="w-4 h-4" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}
