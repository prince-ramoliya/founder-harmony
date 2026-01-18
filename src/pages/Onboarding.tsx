import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  Users, 
  ArrowRight, 
  ArrowLeft,
  Plus,
  X,
  Mail,
  CheckCircle2,
  Rocket
} from "lucide-react";

const steps = [
  { id: 1, title: "Create Workspace", icon: Building2 },
  { id: 2, title: "Invite Founders", icon: Users },
  { id: 3, title: "Ready to Go", icon: Rocket },
];

interface Invite {
  email: string;
  name: string;
}

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [workspaceName, setWorkspaceName] = useState("");
  const [invites, setInvites] = useState<Invite[]>([{ email: "", name: "" }]);
  const [loading, setLoading] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refetchWorkspaces } = useWorkspace();
  const { toast } = useToast();

  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim()) {
      toast({
        title: "Workspace name required",
        description: "Please enter a name for your workspace.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please sign in to create a workspace.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create workspace + assign current user as admin (server-side)
      const { data, error: workspaceError } = await supabase
        .rpc("create_workspace", { _name: workspaceName });

      if (workspaceError) throw workspaceError;

      const workspace = (Array.isArray(data) ? data[0] : data) as any;
      if (!workspace?.id) throw new Error("Workspace creation failed");

      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("user_id", user.id)
        .single();

      // Create founder entry for current user
      const { error: founderError } = await supabase
        .from("founders")
        .insert({
          workspace_id: workspace.id,
          user_id: user.id,
          name: profile?.full_name || user.email?.split("@")[0] || "Founder",
          email: user.email,
          role_title: "CEO & Co-founder",
          equity_percentage: 100,
          color: "#3B82F6",
        });

      if (founderError) throw founderError;

      // Create audit log
      await supabase.from("audit_logs").insert({
        workspace_id: workspace.id,
        user_id: user.id,
        action: "create",
        entity_type: "workspace",
        entity_id: workspace.id,
        new_data: { name: workspaceName },
        reason: "Workspace created during onboarding",
      });

      setWorkspaceId(workspace.id);
      setCurrentStep(2);

      toast({
        title: "Workspace created!",
        description: `${workspaceName} is ready. Now invite your co-founders.`,
      });
    } catch (error: any) {
      toast({
        title: "Error creating workspace",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddInvite = () => {
    setInvites([...invites, { email: "", name: "" }]);
  };

  const handleRemoveInvite = (index: number) => {
    setInvites(invites.filter((_, i) => i !== index));
  };

  const handleInviteChange = (index: number, field: "email" | "name", value: string) => {
    const newInvites = [...invites];
    newInvites[index][field] = value;
    setInvites(newInvites);
  };

  const handleSendInvites = async () => {
    if (!workspaceId) return;

    const validInvites = invites.filter(i => i.email.trim() && i.email.includes("@"));
    
    if (validInvites.length === 0) {
      setCurrentStep(3);
      return;
    }

    setLoading(true);

    try {
      for (const invite of validInvites) {
        // Create workspace invite
        await supabase.from("workspace_invites").insert({
          workspace_id: workspaceId,
          email: invite.email,
          role: "member",
          invited_by: user?.id,
        });

        // Create founder placeholder
        await supabase.from("founders").insert({
          workspace_id: workspaceId,
          name: invite.name || invite.email.split("@")[0],
          email: invite.email,
          role_title: "Co-founder",
          equity_percentage: 0,
          color: ["#10B981", "#F59E0B", "#EF4444", "#8B5CF6"][validInvites.indexOf(invite) % 4],
        });

        // Audit log
        await supabase.from("audit_logs").insert({
          workspace_id: workspaceId,
          user_id: user?.id,
          action: "invite",
          entity_type: "workspace_invite",
          new_data: { email: invite.email, name: invite.name },
          reason: "Co-founder invited during onboarding",
        });
      }

      toast({
        title: "Invites sent!",
        description: `${validInvites.length} co-founder(s) have been invited.`,
      });

      setCurrentStep(3);
    } catch (error: any) {
      toast({
        title: "Error sending invites",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    await refetchWorkspaces();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ 
                  scale: currentStep >= step.id ? 1 : 0.8,
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-[6px] transition-colors ${
                  currentStep >= step.id 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <step.icon className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
              </motion.div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  currentStep > step.id ? "bg-primary" : "bg-border"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-card rounded-[6px] p-8 shadow-lg border border-border">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-[6px] gradient-primary flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Create your workspace
                  </h2>
                  <p className="text-muted-foreground">
                    This is where you and your co-founders will track equity and finances.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workspaceName">Company / Workspace Name</Label>
                  <Input
                    id="workspaceName"
                    placeholder="e.g., Acme Startup"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="text-lg py-6"
                  />
                </div>

                <Button
                  onClick={handleCreateWorkspace}
                  disabled={loading || !workspaceName.trim()}
                  className="w-full gradient-primary shadow-glow py-6"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-[6px] bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-success" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Invite your co-founders
                  </h2>
                  <p className="text-muted-foreground">
                    Add your team members to start tracking equity together.
                  </p>
                </div>

                <div className="space-y-4">
                  {invites.map((invite, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3"
                    >
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Email address"
                            value={invite.email}
                            onChange={(e) => handleInviteChange(index, "email", e.target.value)}
                            className="pl-9"
                          />
                        </div>
                        <Input
                          placeholder="Name (optional)"
                          value={invite.name}
                          onChange={(e) => handleInviteChange(index, "name", e.target.value)}
                        />
                      </div>
                      {invites.length > 1 && (
                        <button
                          onClick={() => handleRemoveInvite(index)}
                          className="p-2 hover:bg-muted rounded-[6px] transition-colors"
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      )}
                    </motion.div>
                  ))}

                  <button
                    onClick={handleAddInvite}
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add another co-founder
                  </button>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleSendInvites}
                    disabled={loading}
                    className="flex-1 gradient-primary"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        {invites.some(i => i.email.trim()) ? "Send Invites" : "Skip for now"}
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto"
                >
                  <CheckCircle2 className="w-10 h-10 text-success" />
                </motion.div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    You're all set!
                  </h2>
                  <p className="text-muted-foreground">
                    Your workspace is ready. Start tracking equity, expenses, and revenue.
                  </p>
                </div>

                <div className="bg-muted/50 rounded-[6px] p-6 text-left space-y-3">
                  <p className="font-medium text-foreground">What's next:</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Set up equity distribution for all founders
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Record capital contributions
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Track expenses and revenue
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Run exit simulations
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={handleFinish}
                  className="w-full gradient-primary shadow-glow py-6"
                >
                  <span className="flex items-center gap-2">
                    Go to Dashboard
                    <Rocket className="w-4 h-4" />
                  </span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
