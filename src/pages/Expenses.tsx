import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Receipt, 
  Plus, 
  Filter,
  Search,
  Calendar,
  TrendingDown,
  Building2,
  User,
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

const expenses = [
  {
    id: 1,
    description: "AWS Cloud Services",
    category: "Technology",
    amount: 2500,
    date: "2024-06-15",
    owner: "John Doe",
    type: "Company",
    status: "Approved"
  },
  {
    id: 2,
    description: "Marketing Campaign - Google Ads",
    category: "Marketing",
    amount: 3500,
    date: "2024-06-14",
    owner: "Jane Smith",
    type: "Company",
    status: "Approved"
  },
  {
    id: 3,
    description: "Office Supplies",
    category: "Operations",
    amount: 450,
    date: "2024-06-12",
    owner: "Mike Johnson",
    type: "Company",
    status: "Approved"
  },
  {
    id: 4,
    description: "Business Lunch - Client Meeting",
    category: "Travel & Meals",
    amount: 180,
    date: "2024-06-10",
    owner: "John Doe",
    type: "Personal",
    status: "Pending"
  },
  {
    id: 5,
    description: "Software Subscriptions",
    category: "Technology",
    amount: 890,
    date: "2024-06-08",
    owner: "Jane Smith",
    type: "Company",
    status: "Approved"
  },
];

const categories = [
  { name: "Technology", amount: 3390, color: "#4F46E5" },
  { name: "Marketing", amount: 3500, color: "#10B981" },
  { name: "Operations", amount: 450, color: "#F59E0B" },
  { name: "Travel & Meals", amount: 180, color: "#EF4444" },
];

export default function Expenses() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const companyExpenses = expenses.filter(e => e.type === "Company").reduce((sum, e) => sum + e.amount, 0);
  const personalExpenses = expenses.filter(e => e.type === "Personal").reduce((sum, e) => sum + e.amount, 0);

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
              <div className="w-10 h-10 rounded bg-warning/10 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-warning" />
              </div>
              Expense Management
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mt-2"
            >
              Track and categorize all business expenses
            </motion.p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary shadow-glow">
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
                <DialogDescription>
                  Log a new expense with all required details.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input placeholder="e.g., AWS Services" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount ($)</Label>
                    <Input type="number" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select className="w-full px-3 py-2 rounded border border-input bg-background text-foreground">
                    <option>Technology</option>
                    <option>Marketing</option>
                    <option>Operations</option>
                    <option>Travel & Meals</option>
                    <option>Legal</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="expenseType" value="Company" defaultChecked className="text-primary" />
                      <span className="flex items-center gap-1.5 text-sm">
                        <Building2 className="w-4 h-4" /> Company
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="expenseType" value="Personal" className="text-primary" />
                      <span className="flex items-center gap-1.5 text-sm">
                        <User className="w-4 h-4" /> Personal
                      </span>
                    </label>
                  </div>
                </div>
                <Button className="w-full gradient-primary">
                  Add Expense
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className="bg-card rounded border p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="w-7 h-7 text-destructive" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Expenses</p>
                <p className="text-3xl font-bold text-foreground">
                  ${totalExpenses.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded border p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded bg-primary/10 flex items-center justify-center">
                <Building2 className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Company Expenses</p>
                <p className="text-3xl font-bold text-foreground">
                  ${companyExpenses.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded border p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded bg-warning/10 flex items-center justify-center">
                <User className="w-7 h-7 text-warning" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Personal Expenses</p>
                <p className="text-3xl font-bold text-foreground">
                  ${personalExpenses.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className="bg-card rounded border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Expenses by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div
                key={category.name}
                className="p-4 rounded border border-border hover:bg-muted/50 transition-colors"
              >
                <div 
                  className="w-10 h-10 rounded mb-3 flex items-center justify-center"
                  style={{ backgroundColor: `${category.color}15` }}
                >
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">{category.name}</p>
                <p className="text-xl font-bold text-foreground">
                  ${category.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Expense List */}
        <div className="bg-card rounded border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-semibold text-foreground">All Expenses</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <span className="font-medium text-foreground">{expense.description}</span>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">{expense.category}</td>
                    <td className="py-4 px-4 font-semibold text-foreground">
                      ${expense.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {expense.date}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium ${
                        expense.type === "Company" 
                          ? "bg-primary/10 text-primary" 
                          : "bg-warning/10 text-warning"
                      }`}>
                        {expense.type === "Company" ? <Building2 className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {expense.type}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${
                        expense.status === "Approved" 
                          ? "bg-success/10 text-success" 
                          : "bg-warning/10 text-warning"
                      }`}>
                        {expense.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="p-2 hover:bg-muted rounded transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
}
