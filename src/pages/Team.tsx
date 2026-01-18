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
  Clock,
  Edit2,
  Check,
  X,
  Copy,
  Link
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
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
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [founders, setFounders] = useState<Founder[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member" | "viewer">("member");
  const [inviting, setInviting] = useState(false);
  const [editingFounderId, setEditingFounderId] = useState<string | null>(null);
  const [editEquity, setEditEquity] = useState("");
  const [savingEquity, setSavingEquity] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (workspace?.id) {
      fetchTeamData();
      // Generate invite link
      const baseUrl = window.location.origin;
      setInviteLink(`${baseUrl}/auth?invite=${workspace.id}`);
    }
  }, [workspace?.id]);

  const fetchTeamData = async () => {
    if (!workspace?.id) return;
    
    try {
      const [foundersRes, invitesRes] = await Promise.all([
        supabase
          .from("founders")
          .select("*")
          .eq("workspace_id", workspace.id)
          .order("equity_percentage", { ascending: false }),
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

  const handleEditEquity = (founder: Founder) => {
    setEditingFounderId(founder.id);
    setEditEquity(founder.equity_percentage.toString());
  };

  const handleCancelEdit = () => {
    setEditingFounderId(null);
    setEditEquity("");
  };

  const handleSaveEquity = async (founderId: string) => {
    const newEquity = parseFloat(editEquity);
    if (isNaN(newEquity) || newEquity < 0 || newEquity > 100) {
      toast({
        title: "Invalid equity",
        description: "Please enter a value between 0 and 100.",
        variant: "destructive",
      });
      return;
    }

    setSavingEquity(true);
    try {
      const founder = founders.find(f => f.id === founderId);
      const oldEquity = founder?.equity_percentage;

      const { error } = await supabase
        .from("founders")
        .update({ equity_percentage: newEquity })
        .eq("id", founderId);

      if (error) throw error;

      // Create audit log
      if (workspace?.id) {
        await supabase.from("audit_logs").insert({
          workspace_id: workspace.id,
          user_id: user?.id,
          action: "equity_change",
          entity_type: "founder",
          entity_id: founderId,
          old_data: { equity_percentage: oldEquity },
          new_data: { equity_percentage: newEquity },
          reason: `Equity updated from ${oldEquity}% to ${newEquity}%`,
        });
      }

      toast({
        title: "Equity updated",
        description: `Equity updated to ${newEquity}%`,
      });

      setEditingFounderId(null);
      setEditEquity("");
      fetchTeamData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingEquity(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      toast({
        title: "Link copied!",
        description: "Share this link with your partners.",
      });
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const totalEquity = founders.reduce((sum, f) => sum + f.equity_percentage, 0);

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
              Manage your team members and equity distribution
            </motion.p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary">
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
                {/* Invite Link */}
                <div className="bg-muted/50 rounded p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Link className="w-4 h-4" />
                    Share Invite Link
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={inviteLink}
                      readOnly
                      className="flex-1 text-sm bg-background"
                    />
                    <Button
                      variant="outline"
                      onClick={handleCopyLink}
                      className="flex-shrink-0"
                    >
                      {linkCopied ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or invite by email</span>
                  </div>
                </div>

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

        {/* Equity Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded p-4 border ${
            totalEquity === 100 
              ? "bg-success/5 border-success/20" 
              : "bg-warning/5 border-warning/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Total Equity Allocated</p>
              <p className="text-sm text-muted-foreground">
                {totalEquity === 100 
                  ? "Equity is fully allocated" 
                  : `${100 - totalEquity}% remaining to allocate`}
              </p>
            </div>
            <div className={`text-3xl font-bold ${
              totalEquity === 100 ? "text-success" : "text-warning"
            }`}>
              {totalEquity}%
            </div>
          </div>
        </motion.div>

        {/* Team Members */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded p-6 border border-border"
        >
          <div className="flex items-center gap-3 mb-6">
            <Crown className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Founders & Members</h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : founders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No team members yet.</p>
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
                      {editingFounderId === founder.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={editEquity}
                            onChange={(e) => setEditEquity(e.target.value)}
                            className="w-20 h-7 text-sm"
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => handleSaveEquity(founder.id)}
                            disabled={savingEquity}
                          >
                            <Check className="w-4 h-4 text-success" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={handleCancelEdit}
                          >
                            <X className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {founder.equity_percentage}% equity
                        </span>
                      )}
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 hover:bg-muted rounded transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border border-border">
                      <DropdownMenuItem onClick={() => handleEditEquity(founder)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Equity
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
            className="bg-card rounded p-6 border border-border"
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
                  className="flex items-center gap-4 p-4 rounded border border-dashed border-border"
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
