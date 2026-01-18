import { useState } from "react";
import { motion } from "framer-motion";
import { 
  PieChart, 
  Plus, 
  History, 
  Users,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
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

const founders = [
  { 
    id: 1, 
    name: "John Doe", 
    role: "CEO & Co-founder", 
    equity: 40, 
    capital: 50000,
    color: "#4F46E5",
    avatar: "JD"
  },
  { 
    id: 2, 
    name: "Jane Smith", 
    role: "CTO & Co-founder", 
    equity: 35, 
    capital: 35000,
    color: "#10B981",
    avatar: "JS"
  },
  { 
    id: 3, 
    name: "Mike Johnson", 
    role: "COO & Co-founder", 
    equity: 25, 
    capital: 25000,
    color: "#F59E0B",
    avatar: "MJ"
  },
];

const equityHistory = [
  { id: 1, date: "2024-01-15", type: "Initial Setup", description: "Initial equity distribution", changes: [{ name: "All Founders", change: "Equal split" }] },
  { id: 2, date: "2024-03-01", type: "Capital Contribution", description: "John invested additional $25k", changes: [{ name: "John Doe", change: "+5%" }] },
  { id: 3, date: "2024-04-15", type: "Milestone", description: "Product launch bonus", changes: [{ name: "Jane Smith", change: "+2%" }] },
];

export default function Equity() {
  const [dialogOpen, setDialogOpen] = useState(false);

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
                  <select className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground">
                    {founders.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>New Equity Percentage</Label>
                  <Input type="number" placeholder="e.g., 42" />
                </div>
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Input placeholder="e.g., Additional capital contribution" />
                </div>
                <Button className="w-full gradient-primary">
                  Submit for Approval
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cap Table Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-1 bg-card rounded-2xl p-6 shadow-md"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Ownership Split</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={founders.map(f => ({ name: f.name, value: f.equity, color: f.color }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {founders.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
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
            className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-md"
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
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Capital</th>
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
                            style={{ backgroundColor: `${founder.color}20`, color: founder.color }}
                          >
                            {founder.avatar}
                          </div>
                          <span className="font-medium text-foreground">{founder.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">{founder.role}</td>
                      <td className="py-4 px-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: `${founder.color}15`, color: founder.color }}>
                          {founder.equity}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-medium text-foreground">
                        ${founder.capital.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
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
          className="bg-card rounded-2xl p-6 shadow-md"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <History className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Equity History</h3>
                <p className="text-sm text-muted-foreground">All changes are logged and immutable</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {equityHistory.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">{entry.type}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {entry.date}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{entry.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}
