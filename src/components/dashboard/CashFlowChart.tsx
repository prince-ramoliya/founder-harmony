import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", inflow: 45000, outflow: 32000 },
  { month: "Feb", inflow: 52000, outflow: 38000 },
  { month: "Mar", inflow: 48000, outflow: 41000 },
  { month: "Apr", inflow: 61000, outflow: 35000 },
  { month: "May", inflow: 55000, outflow: 42000 },
  { month: "Jun", inflow: 67000, outflow: 39000 },
];

export function CashFlowChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-card rounded-2xl p-6 shadow-md"
    >
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
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-popover border border-border rounded-lg px-4 py-3 shadow-lg">
                      <p className="font-medium text-foreground mb-2">{label}</p>
                      {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                          {entry.name}: ${(entry.value as number).toLocaleString()}
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
    </motion.div>
  );
}
