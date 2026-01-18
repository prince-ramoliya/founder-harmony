import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  variant?: "default" | "primary" | "success";
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  variant = "default",
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      className={cn(
        "relative overflow-hidden rounded-2xl p-6 transition-shadow duration-300",
        variant === "default" && "bg-card shadow-md hover:shadow-lg",
        variant === "primary" && "gradient-primary text-primary-foreground shadow-lg shadow-primary/20",
        variant === "success" && "gradient-success text-success-foreground shadow-lg shadow-success/20"
      )}
    >
      {/* Background decoration */}
      {variant !== "default" && (
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
      )}
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            variant === "default" ? "bg-primary/10" : "bg-white/20"
          )}>
            <Icon className={cn(
              "w-6 h-6",
              variant === "default" ? "text-primary" : "text-current"
            )} />
          </div>
          {change && (
            <span className={cn(
              "text-sm font-medium px-2 py-1 rounded-full",
              variant === "default" && changeType === "positive" && "bg-success/10 text-success",
              variant === "default" && changeType === "negative" && "bg-destructive/10 text-destructive",
              variant === "default" && changeType === "neutral" && "bg-muted text-muted-foreground",
              variant !== "default" && "bg-white/20"
            )}>
              {change}
            </span>
          )}
        </div>
        
        <p className={cn(
          "text-sm font-medium mb-1",
          variant === "default" ? "text-muted-foreground" : "text-current/80"
        )}>
          {title}
        </p>
        <p className={cn(
          "text-3xl font-bold tracking-tight",
          variant === "default" ? "text-foreground" : "text-current"
        )}>
          {value}
        </p>
      </div>
    </motion.div>
  );
}
