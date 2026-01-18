import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Settings as SettingsIcon, 
  Building2, 
  Bell,
  Shield,
  Palette,
  Save,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Settings() {
  const navigate = useNavigate();
  const { workspace, refetchWorkspaces } = useWorkspace();
  const { toast } = useToast();
  const [workspaceName, setWorkspaceName] = useState(workspace?.name || "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
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

  const handleDeleteAllData = async () => {
    if (!workspace?.id) return;
    
    setDeleting(true);
    try {
      // Delete all data in order (respecting foreign keys)
      await supabase.from("audit_logs").delete().eq("workspace_id", workspace.id);
      await supabase.from("capital_contributions").delete().eq("workspace_id", workspace.id);
      await supabase.from("expenses").delete().eq("workspace_id", workspace.id);
      await supabase.from("revenue").delete().eq("workspace_id", workspace.id);
      await supabase.from("workspace_invites").delete().eq("workspace_id", workspace.id);
      await supabase.from("founders").delete().eq("workspace_id", workspace.id);
      await supabase.from("user_roles").delete().eq("workspace_id", workspace.id);
      await supabase.from("workspaces").delete().eq("id", workspace.id);

      toast({
        title: "Data deleted",
        description: "All workspace data has been permanently deleted.",
      });

      // Redirect to onboarding
      navigate("/onboarding");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-primary" />
            </div>
            Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your workspace and preferences
          </p>
        </div>

        {/* Workspace Settings */}
        <div className="bg-card rounded border p-6">
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
        </div>

        {/* Notification Settings */}
        <div className="bg-card rounded border p-6">
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
        </div>

        {/* Security Settings */}
        <div className="bg-card rounded border p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Security</h3>
          </div>

          <div className="space-y-4 max-w-md">
            <div className="p-4 rounded border bg-muted/50">
              <p className="font-medium text-foreground mb-1">Audit Log</p>
              <p className="text-sm text-muted-foreground mb-3">
                All changes to equity, capital, and expenses are automatically logged and immutable.
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href="/audit-log">View Audit Log</a>
              </Button>
            </div>
            <div className="p-4 rounded border bg-muted/50">
              <p className="font-medium text-foreground mb-1">Data Export</p>
              <p className="text-sm text-muted-foreground mb-3">
                Export all your workspace data in CSV format.
              </p>
              <Button variant="outline" size="sm">
                Export Data
              </Button>
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-card rounded border p-6">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Appearance</h3>
          </div>

          <div className="flex gap-4">
            <button className="flex flex-col items-center gap-2 p-4 rounded border-2 border-primary bg-background">
              <div className="w-12 h-8 rounded bg-white border border-border" />
              <span className="text-sm font-medium text-foreground">Light</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 rounded border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-8 rounded bg-gray-900 border border-gray-700" />
              <span className="text-sm font-medium text-foreground">Dark</span>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-card rounded border border-destructive/30 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Trash2 className="w-5 h-5 text-destructive" />
            <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
          </div>

          <div className="space-y-4 max-w-md">
            <div className="p-4 rounded border border-destructive/30 bg-destructive/5">
              <p className="font-medium text-foreground mb-1">Delete All Data</p>
              <p className="text-sm text-muted-foreground mb-4">
                Permanently delete all workspace data including founders, equity, expenses, revenue, 
                capital contributions, and audit logs. This action cannot be undone.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={deleting}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    {deleting ? "Deleting..." : "Delete All Data"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all data in your workspace including:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>All founders and equity allocations</li>
                        <li>All expenses and revenue records</li>
                        <li>All capital contributions</li>
                        <li>All audit logs and history</li>
                        <li>All team invitations</li>
                      </ul>
                      <p className="mt-3 font-medium text-destructive">
                        This action cannot be undone. You will be redirected to create a new workspace.
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAllData}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Yes, delete everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
