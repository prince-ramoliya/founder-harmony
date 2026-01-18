import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Plus, 
  Mail, 
  Shield,
  MoreHorizontal,
  UserPlus,
  Crown,
  Clock
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
import { useToast } from "@/hooks/use-toast";

interface Founder {
  id: string;
  name: string;
  email: string | null;
  role_title: string | null;
  equity_percentage: number;
  color: string | null;
  avatar: string | null;
}

interface Invite {
  id: string;
  email: string;
  role: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
}

export default function Team() {
  const { workspace } = useWorkspace();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [founders, setFounders] = useState<Founder[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member" | "viewer">("member");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (workspace?.id) {
      fetchTeamData();
    }
  }, [workspace?.id]);

  const fetchTeamData = async () => {
    if (!workspace?.id) return;
    
    try {
      const [foundersRes, invitesRes] = await Promise.all([
        supabase
          .from("founders")
          .select("*")
          .eq("workspace_id", workspace.id),
        supabase
          .from("workspace_invites")
          .select("*")
          .eq("workspace_id", workspace.id)
          .is("accepted_at", null)
      ]);

      if (foundersRes.data) setFounders(foundersRes.data);
      if (invitesRes.data) setInvites(invitesRes.data);
    } catch (error) {
      console.error("Error fetching team data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!workspace?.id || !inviteEmail) return;
    
    setInviting(true);
    try {
      const { error } = await supabase
        .from("workspace_invites")
        .insert({
          workspace_id: workspace.id,
          email: inviteEmail,
          role: inviteRole,
        });

      if (error) throw error;

      toast({
        title: "Invitation sent",
        description: `Invitation sent to ${inviteEmail}`,
      });
      
      setDialogOpen(false);
      setInviteEmail("");
      fetchTeamData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setInviting(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

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
              <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              Team Management
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mt-2"
            >
              Manage your team members and invitations
            </motion.p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary shadow-glow">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your workspace.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input 
                    type="email" 
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <select 
                    className="w-full px-3 py-2 rounded border border-input bg-background text-foreground"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <Button 
                  className="w-full gradient-primary"
                  onClick={handleInvite}
                  disabled={inviting || !inviteEmail}
                >
                  {inviting ? "Sending..." : "Send Invitation"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Team Members */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded border p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Crown className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Founders & Members</h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {founders.map((founder, index) => (
                <motion.div
                  key={founder.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded border border-border hover:bg-muted/50 transition-colors"
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium"
                    style={{ 
                      backgroundColor: `${founder.color || '#3B82F6'}20`, 
                      color: founder.color || '#3B82F6' 
                    }}
                  >
                    {founder.avatar || getInitials(founder.name)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{founder.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {founder.equity_percentage}% equity
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{founder.role_title || "Team Member"}</span>
                      {founder.email && (
                        <>
                          <span>•</span>
                          <span>{founder.email}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button className="p-2 hover:bg-muted rounded transition-colors">
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Pending Invitations */}
        {invites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded border p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-5 h-5 text-warning" />
              <h3 className="text-lg font-semibold text-foreground">Pending Invitations</h3>
            </div>

            <div className="space-y-4">
              {invites.map((invite, index) => (
                <motion.div
                  key={invite.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded border border-border border-dashed"
                >
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-foreground">{invite.email}</span>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="w-3 h-3" />
                      <span className="capitalize">{invite.role}</span>
                      <span>•</span>
                      <span>Expires {new Date(invite.expires_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-warning/10 text-warning">
                    Pending
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </MainLayout>
  );
}
