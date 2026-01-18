import { motion } from "framer-motion";
import { 
  Wallet, 
  Receipt, 
  TrendingUp, 
  Users, 
  ArrowUpRight 
} from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  {
    id: 1,
    type: "capital",
    title: "Capital Contribution",
    description: "John Doe added $25,000",
    time: "2 hours ago",
    icon: Wallet,
    color: "text-primary bg-primary/10",
  },
  {
    id: 2,
    type: "expense",
    title: "Expense Logged",
    description: "Marketing - $3,500",
    time: "5 hours ago",
    icon: Receipt,
    color: "text-warning bg-warning/10",
  },
  {
    id: 3,
    type: "revenue",
    title: "Revenue Received",
    description: "Client payment - $15,000",
    time: "1 day ago",
    icon: TrendingUp,
    color: "text-success bg-success/10",
  },
  {
    id: 4,
    type: "equity",
    title: "Equity Updated",
    description: "Vesting milestone reached",
    time: "2 days ago",
    icon: Users,
    color: "text-accent bg-accent/10",
  },
];

export function RecentActivity() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-card rounded-2xl p-6 shadow-md"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">Latest financial updates</p>
        </div>
        <button className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors">
          View all
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
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
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
