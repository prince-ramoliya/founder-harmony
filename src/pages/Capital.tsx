import { useState } from "react";
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

const contributions = [
  {
    id: 1,
    founder: "John Doe",
    avatar: "JD",
    amount: 50000,
    type: "Cash",
    date: "2024-01-15",
    status: "Confirmed",
    equityImpact: true,
    color: "#4F46E5"
  },
  {
    id: 2,
    founder: "Jane Smith",
    avatar: "JS",
    amount: 35000,
    type: "Cash",
    date: "2024-01-15",
    status: "Confirmed",
    equityImpact: true,
    color: "#10B981"
  },
  {
    id: 3,
    founder: "Mike Johnson",
    avatar: "MJ",
    amount: 25000,
    type: "Cash",
    date: "2024-01-15",
    status: "Confirmed",
    equityImpact: true,
    color: "#F59E0B"
  },
  {
    id: 4,
    founder: "John Doe",
    avatar: "JD",
    amount: 25000,
    type: "Cash",
    date: "2024-03-01",
    status: "Confirmed",
    equityImpact: true,
    color: "#4F46E5"
  },
];

const founderTotals = [
  { name: "John Doe", total: 75000, color: "#4F46E5", avatar: "JD" },
  { name: "Jane Smith", total: 35000, color: "#10B981", avatar: "JS" },
  { name: "Mike Johnson", total: 25000, color: "#F59E0B", avatar: "MJ" },
];

export default function Capital() {
  const [dialogOpen, setDialogOpen] = useState(false);
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
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
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
              <Button className="gradient-primary shadow-glow">
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
                  <select className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground">
                    <option value="1">John Doe</option>
                    <option value="2">Jane Smith</option>
                    <option value="3">Mike Johnson</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Amount ($)</Label>
                  <Input type="number" placeholder="e.g., 10000" />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground">
                    <option>Cash</option>
                    <option>Equipment</option>
                    <option>IP/Assets</option>
                    <option>Services</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="equityImpact" className="rounded" defaultChecked />
                  <Label htmlFor="equityImpact" className="cursor-pointer">Impacts equity distribution</Label>
                </div>
                <Button className="w-full gradient-primary">
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
            className="bg-card rounded-2xl p-6 shadow-md gradient-primary"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
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
            className="bg-card rounded-2xl p-6 shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-success/10 flex items-center justify-center">
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
            className="bg-card rounded-2xl p-6 shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-warning/10 flex items-center justify-center">
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
          className="bg-card rounded-2xl p-6 shadow-md"
        >
          <h3 className="text-lg font-semibold text-foreground mb-6">Contribution by Founder</h3>
          <div className="space-y-4">
            {founderTotals.map((founder, index) => {
              const percentage = (founder.total / totalCapital) * 100;
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
        </motion.div>

        {/* Contribution History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl p-6 shadow-md"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Contribution History</h3>
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
                          style={{ backgroundColor: `${contribution.color}20`, color: contribution.color }}
                        >
                          {contribution.avatar}
                        </div>
                        <span className="font-medium text-foreground">{contribution.founder}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-foreground">
                      ${contribution.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">{contribution.type}</td>
                    <td className="py-4 px-4 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {contribution.date}
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
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}
