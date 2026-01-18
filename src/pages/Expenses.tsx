import { useState, useEffect, useMemo } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";

interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  created_at: string;
  expense_type: string;
  status: string;
}

export default function Expenses() {
  const { workspace } = useWorkspace();
  const { formatAmount } = useCurrency();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "Technology",
    type: "Company"
  });

  useEffect(() => {
    if (workspace) {
      fetchExpenses();
    }
  }, [workspace]);

  const fetchExpenses = async () => {
    if (!workspace) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("workspace_id", workspace.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!workspace || !newExpense.description || !newExpense.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { error } = await supabase
        .from("expenses")
        .insert({
          workspace_id: workspace.id,
          description: newExpense.description,
          amount: parseFloat(newExpense.amount),
          category: newExpense.category,
          expense_type: newExpense.type,
          status: "Approved"
        });

      if (error) throw error;

      toast.success("Expense added successfully");
      setDialogOpen(false);
      setNewExpense({ description: "", amount: "", category: "Technology", type: "Company" });
      fetchExpenses();
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Failed to add expense");
    }
  };

  const totalExpenses = useMemo(() => 
    expenses.reduce((sum, e) => sum + e.amount, 0), 
    [expenses]
  );

  const companyExpenses = useMemo(() => 
    expenses.filter(e => e.expense_type === "Company").reduce((sum, e) => sum + e.amount, 0), 
    [expenses]
  );

  const personalExpenses = useMemo(() => 
    expenses.filter(e => e.expense_type === "Personal").reduce((sum, e) => sum + e.amount, 0), 
    [expenses]
  );

  const categories = useMemo(() => {
    const categoryMap: Record<string, { name: string; amount: number; color: string }> = {};
    const colors: Record<string, string> = {
      "Technology": "#4F46E5",
      "Marketing": "#10B981",
      "Operations": "#F59E0B",
      "Travel & Meals": "#EF4444",
      "Legal": "#8B5CF6",
      "Other": "#6B7280"
    };

    expenses.forEach(expense => {
      if (!categoryMap[expense.category]) {
        categoryMap[expense.category] = {
          name: expense.category,
          amount: 0,
          color: colors[expense.category] || "#6B7280"
        };
      }
      categoryMap[expense.category].amount += expense.amount;
    });

    return Object.values(categoryMap);
  }, [expenses]);

  const filteredExpenses = useMemo(() => 
    expenses.filter(e => 
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase())
    ), 
    [expenses, searchQuery]
  );

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
              <Button className="gradient-primary">
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
                  <Input 
                    placeholder="e.g., AWS Services"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    className="rounded"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input 
                      type="number" 
                      placeholder="0.00"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      className="rounded"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select 
                      className="w-full px-3 py-2 rounded border border-input bg-background text-foreground"
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    >
                      <option>Technology</option>
                      <option>Marketing</option>
                      <option>Operations</option>
                      <option>Travel & Meals</option>
                      <option>Legal</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="expenseType" 
                        value="Company" 
                        checked={newExpense.type === "Company"}
                        onChange={(e) => setNewExpense({ ...newExpense, type: e.target.value })}
                        className="text-primary" 
                      />
                      <span className="flex items-center gap-1.5 text-sm">
                        <Building2 className="w-4 h-4" /> Company
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="expenseType" 
                        value="Personal"
                        checked={newExpense.type === "Personal"}
                        onChange={(e) => setNewExpense({ ...newExpense, type: e.target.value })}
                        className="text-primary" 
                      />
                      <span className="flex items-center gap-1.5 text-sm">
                        <User className="w-4 h-4" /> Personal
                      </span>
                    </label>
                  </div>
                </div>
                <Button className="w-full gradient-primary rounded" onClick={handleAddExpense}>
                  Add Expense
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded border p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="w-7 h-7 text-destructive" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Expenses</p>
                <p className="text-3xl font-bold text-foreground">
                  {formatAmount(totalExpenses)}
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
                  {formatAmount(companyExpenses)}
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
                  {formatAmount(personalExpenses)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className="bg-card rounded border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Expenses by Category</h3>
          {categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No expense categories yet. Add your first expense.</p>
            </div>
          ) : (
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
                    {formatAmount(category.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
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
                  className="pl-9 w-64 rounded"
                />
              </div>
              <Button variant="outline" size="icon" className="rounded">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse h-16 bg-muted rounded" />
              ))}
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No expenses found. Add your first expense.</p>
            </div>
          ) : (
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
                  {filteredExpenses.map((expense, index) => (
                    <motion.tr
                      key={expense.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <span className="font-medium text-foreground">{expense.description}</span>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">{expense.category}</td>
                      <td className="py-4 px-4 font-semibold text-foreground">
                        {formatAmount(expense.amount)}
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {new Date(expense.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium ${
                          expense.expense_type === "Company" 
                            ? "bg-primary/10 text-primary" 
                            : "bg-warning/10 text-warning"
                        }`}>
                          {expense.expense_type === "Company" ? <Building2 className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          {expense.expense_type}
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
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </MainLayout>
  );
}
