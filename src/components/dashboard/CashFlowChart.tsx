import { useEffect, useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, subMonths } from "date-fns";
import { TrendingUp } from "lucide-react";

interface MonthlyData {
  month: string;
  inflow: number;
  outflow: number;
}

export function CashFlowChart() {
  const { workspace } = useWorkspace();
  const { currency } = useCurrency();
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [expenseData, setExpenseData] = useState<any[]>([]);
  const [capitalData, setCapitalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (workspace?.id) {
      fetchData();
    }
  }, [workspace?.id]);

  const fetchData = async () => {
    if (!workspace?.id) return;

    try {
      const [revRes, expRes, capRes] = await Promise.all([
        supabase
          .from("revenue")
          .select("amount, created_at")
          .eq("workspace_id", workspace.id),
        supabase
          .from("expenses")
          .select("amount, created_at")
          .eq("workspace_id", workspace.id),
        supabase
          .from("capital_contributions")
          .select("amount, created_at")
          .eq("workspace_id", workspace.id),
      ]);

      setRevenueData(revRes.data || []);
      setExpenseData(expRes.data || []);
      setCapitalData(capRes.data || []);
    } catch (error) {
      console.error("Error fetching cash flow data:", error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    // Generate last 6 months
    const months: MonthlyData[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = startOfMonth(subMonths(new Date(), i));
      months.push({
        month: format(monthDate, "MMM"),
        inflow: 0,
        outflow: 0,
      });
    }

    // Aggregate revenue and capital as inflow
    [...revenueData, ...capitalData].forEach((item) => {
      const itemDate = new Date(item.created_at);
      const monthKey = format(itemDate, "MMM");
      const monthData = months.find((m) => m.month === monthKey);
      if (monthData) {
        monthData.inflow += item.amount;
      }
    });

    // Aggregate expenses as outflow
    expenseData.forEach((item) => {
      const itemDate = new Date(item.created_at);
      const monthKey = format(itemDate, "MMM");
      const monthData = months.find((m) => m.month === monthKey);
      if (monthData) {
        monthData.outflow += item.amount;
      }
    });

    return months;
  }, [revenueData, expenseData, capitalData]);

  const hasData = chartData.some((d) => d.inflow > 0 || d.outflow > 0);

  if (loading) {
    return (
      <div className="bg-card rounded border p-6">
        <div className="h-64 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="bg-card rounded border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Cash Flow</h3>
            <p className="text-sm text-muted-foreground">Inflow vs Outflow over time</p>
          </div>
        </div>
        <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
          <TrendingUp className="w-12 h-12 mb-3 opacity-50" />
          <p className="font-medium">No cash flow data yet</p>
          <p className="text-sm">Add revenue, expenses, or capital to see the chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Cash Flow</h3>
          <p className="text-sm text-muted-foreground">Inflow vs Outflow over time</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Inflow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-sm text-muted-foreground">Outflow</span>
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(220 9% 46%)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(220 9% 46%)", fontSize: 12 }}
              tickFormatter={(value) => `${currency.symbol}${value / 1000}k`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-popover border border-border rounded px-4 py-3">
                      <p className="font-medium text-foreground mb-2">{label}</p>
                      {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                          {entry.name}: {currency.symbol}{(entry.value as number).toLocaleString()}
                        </p>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="inflow"
              name="Inflow"
              stroke="#4F46E5"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorInflow)"
            />
            <Area
              type="monotone"
              dataKey="outflow"
              name="Outflow"
              stroke="#EF4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorOutflow)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
