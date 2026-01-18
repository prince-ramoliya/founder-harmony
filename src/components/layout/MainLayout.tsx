import { Sidebar } from "./Sidebar";
import { motion } from "framer-motion";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen transition-all duration-300"
        style={{ marginLeft: "280px" }}
      >
        <div className="p-8">
          {children}
        </div>
      </motion.main>
    </div>
  );
}
