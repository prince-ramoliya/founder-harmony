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

const reports = [
  {
    id: 1,
    name: "Equity Cap Table",
    description: "Current ownership breakdown with full history",
    icon: PieChart,
    color: "#4F46E5",
    lastGenerated: "2024-06-15",
    formats: ["PDF", "CSV"]
  },
  {
    id: 2,
    name: "Profit & Loss Statement",
    description: "Monthly P&L with revenue and expense breakdown",
    icon: TrendingUp,
    color: "#10B981",
    lastGenerated: "2024-06-01",
    formats: ["PDF", "Excel"]
  },
  {
    id: 3,
    name: "Expense Report",
    description: "Detailed expense breakdown by category and owner",
    icon: Receipt,
    color: "#F59E0B",
    lastGenerated: "2024-06-10",
    formats: ["PDF", "CSV"]
  },
  {
    id: 4,
    name: "Capital Contributions",
    description: "All founder contributions with timestamps",
    icon: Wallet,
    color: "#8B5CF6",
    lastGenerated: "2024-06-12",
    formats: ["PDF", "CSV"]
  },
];

const recentReports = [
  { id: 1, name: "Q2 2024 P&L Statement", date: "2024-06-15", type: "PDF", size: "245 KB" },
  { id: 2, name: "Equity Cap Table - June", date: "2024-06-01", type: "PDF", size: "128 KB" },
  { id: 3, name: "Expense Summary - May", date: "2024-05-31", type: "CSV", size: "56 KB" },
  { id: 4, name: "Investor Summary Q1", date: "2024-04-01", type: "PDF", size: "312 KB" },
];

export default function Reports() {
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
              whileHover={{ y: -4 }}
              className="bg-card rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${report.color}15` }}
                >
                  <report.icon className="w-7 h-7" style={{ color: report.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-foreground mb-1">{report.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    <Calendar className="w-3.5 h-3.5" />
                    Last generated: {report.lastGenerated}
                  </div>
                  <div className="flex items-center gap-2">
                    {report.formats.map((format) => (
                      <Button
                        key={format}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        <Download className="w-3 h-3 mr-1.5" />
                        {format}
                      </Button>
                    ))}
                  </div>
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
          className="bg-card rounded-2xl p-6 shadow-md gradient-primary"
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
            <Button className="bg-white/20 hover:bg-white/30 text-primary-foreground border-0 shadow-lg">
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </motion.div>

        {/* Recent Downloads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-2xl p-6 shadow-md"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Recent Downloads</h3>
            <button className="flex items-center gap-1 text-sm text-primary hover:text-primary/80">
              View all
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {recentReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{report.name}</p>
                    <p className="text-sm text-muted-foreground">{report.date} • {report.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground">
                    {report.type}
                  </span>
                  <Button variant="ghost" size="icon">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}
