import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Settings as SettingsIcon, 
  Building2, 
  Bell,
  Shield,
  Palette,
  Save
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Settings() {
  const { workspace, refetchWorkspaces } = useWorkspace();
  const { toast } = useToast();
  const [workspaceName, setWorkspaceName] = useState(workspace?.name || "");
  const [saving, setSaving] = useState(false);
  
  // Notification settings (UI only for now)
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [equityAlerts, setEquityAlerts] = useState(true);
  const [expenseAlerts, setExpenseAlerts] = useState(true);

  const handleSaveWorkspace = async () => {
    if (!workspace?.id || !workspaceName) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("workspaces")
        .update({ name: workspaceName })
        .eq("id", workspace.id);

      if (error) throw error;

      await refetchWorkspaces();
      
      toast({
        title: "Settings saved",
        description: "Your workspace settings have been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        {/* Header */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-foreground flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-[6px] bg-primary/10 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-primary" />
            </div>
            Settings
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mt-2"
          >
            Manage your workspace and preferences
          </motion.p>
        </div>

        {/* Workspace Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-[6px] p-6 shadow-md"
        >
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Workspace Settings</h3>
          </div>

          <div className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label>Workspace Name</Label>
              <Input 
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="Your Company Name"
              />
            </div>
            <div className="space-y-2">
              <Label>Workspace ID</Label>
              <Input 
                value={workspace?.id || ""}
                disabled
                className="bg-muted text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">
                This is your unique workspace identifier
              </p>
            </div>
            <Button 
              onClick={handleSaveWorkspace}
              disabled={saving}
              className="gradient-primary"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-[6px] p-6 shadow-md"
        >
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
          </div>

          <div className="space-y-6 max-w-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive email updates about activity</p>
              </div>
              <Switch 
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Equity Change Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified when equity is adjusted</p>
              </div>
              <Switch 
                checked={equityAlerts}
                onCheckedChange={setEquityAlerts}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Expense Alerts</p>
                <p className="text-sm text-muted-foreground">Alerts for large expenses</p>
              </div>
              <Switch 
                checked={expenseAlerts}
                onCheckedChange={setExpenseAlerts}
              />
            </div>
          </div>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-[6px] p-6 shadow-md"
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Security</h3>
          </div>

          <div className="space-y-4 max-w-md">
            <div className="p-4 rounded-[6px] border border-border bg-muted/50">
              <p className="font-medium text-foreground mb-1">Audit Log</p>
              <p className="text-sm text-muted-foreground mb-3">
                All changes to equity, capital, and expenses are automatically logged and immutable.
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href="/audit-log">View Audit Log</a>
              </Button>
            </div>
            <div className="p-4 rounded-[6px] border border-border bg-muted/50">
              <p className="font-medium text-foreground mb-1">Data Export</p>
              <p className="text-sm text-muted-foreground mb-3">
                Export all your workspace data in CSV format.
              </p>
              <Button variant="outline" size="sm">
                Export Data
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Theme Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-[6px] p-6 shadow-md"
        >
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Appearance</h3>
          </div>

          <div className="flex gap-4">
            <button className="flex flex-col items-center gap-2 p-4 rounded-[6px] border-2 border-primary bg-background">
              <div className="w-12 h-8 rounded bg-white border border-border" />
              <span className="text-sm font-medium text-foreground">Light</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 rounded-[6px] border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-8 rounded bg-gray-900 border border-gray-700" />
              <span className="text-sm font-medium text-foreground">Dark</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}
