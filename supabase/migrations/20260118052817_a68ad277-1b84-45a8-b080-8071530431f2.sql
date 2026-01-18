-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'member', 'viewer');

-- Create enum for audit action types
CREATE TYPE public.audit_action AS ENUM ('create', 'update', 'delete', 'equity_change', 'approval', 'invite');

-- Create workspaces table (company)
CREATE TABLE public.workspaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for workspace membership
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, workspace_id)
);

-- Create founders table (equity tracking)
CREATE TABLE public.founders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  role_title TEXT,
  equity_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#4F46E5',
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create capital_contributions table
CREATE TABLE public.capital_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  founder_id UUID REFERENCES public.founders(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  contribution_type TEXT NOT NULL DEFAULT 'Cash',
  equity_impact BOOLEAN DEFAULT true,
  status TEXT NOT NULL DEFAULT 'Confirmed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  category TEXT NOT NULL,
  expense_type TEXT NOT NULL DEFAULT 'Company',
  owner_id UUID REFERENCES public.founders(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create revenue table
CREATE TABLE public.revenue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  source TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  revenue_type TEXT NOT NULL DEFAULT 'One-time',
  status TEXT NOT NULL DEFAULT 'Received',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit_logs table (immutable)
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action audit_action NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workspace_invites table
CREATE TABLE public.workspace_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, email)
);

-- Enable RLS on all tables
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capital_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invites ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check workspace membership
CREATE OR REPLACE FUNCTION public.has_workspace_access(_user_id UUID, _workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND workspace_id = _workspace_id
  )
$$;

-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_workspace_admin(_user_id UUID, _workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND workspace_id = _workspace_id
      AND role = 'admin'
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Workspaces policies
CREATE POLICY "Users can view workspaces they belong to"
ON public.workspaces FOR SELECT
USING (public.has_workspace_access(auth.uid(), id));

CREATE POLICY "Users can create workspaces"
ON public.workspaces FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update their workspaces"
ON public.workspaces FOR UPDATE
USING (public.is_workspace_admin(auth.uid(), id));

-- User roles policies
CREATE POLICY "Users can view roles in their workspaces"
ON public.user_roles FOR SELECT
USING (public.has_workspace_access(auth.uid(), workspace_id));

CREATE POLICY "Admins can manage roles in their workspaces"
ON public.user_roles FOR INSERT
WITH CHECK (public.is_workspace_admin(auth.uid(), workspace_id) OR auth.uid() = user_id);

CREATE POLICY "Admins can delete roles in their workspaces"
ON public.user_roles FOR DELETE
USING (public.is_workspace_admin(auth.uid(), workspace_id));

-- Founders policies
CREATE POLICY "Users can view founders in their workspaces"
ON public.founders FOR SELECT
USING (public.has_workspace_access(auth.uid(), workspace_id));

CREATE POLICY "Members can create founders in their workspaces"
ON public.founders FOR INSERT
WITH CHECK (public.has_workspace_access(auth.uid(), workspace_id));

CREATE POLICY "Members can update founders in their workspaces"
ON public.founders FOR UPDATE
USING (public.has_workspace_access(auth.uid(), workspace_id));

CREATE POLICY "Admins can delete founders in their workspaces"
ON public.founders FOR DELETE
USING (public.is_workspace_admin(auth.uid(), workspace_id));

-- Capital contributions policies
CREATE POLICY "Users can view contributions in their workspaces"
ON public.capital_contributions FOR SELECT
USING (public.has_workspace_access(auth.uid(), workspace_id));

CREATE POLICY "Members can create contributions"
ON public.capital_contributions FOR INSERT
WITH CHECK (public.has_workspace_access(auth.uid(), workspace_id));

CREATE POLICY "Members can update contributions"
ON public.capital_contributions FOR UPDATE
USING (public.has_workspace_access(auth.uid(), workspace_id));

-- Expenses policies
CREATE POLICY "Users can view expenses in their workspaces"
ON public.expenses FOR SELECT
USING (public.has_workspace_access(auth.uid(), workspace_id));

CREATE POLICY "Members can create expenses"
ON public.expenses FOR INSERT
WITH CHECK (public.has_workspace_access(auth.uid(), workspace_id));

CREATE POLICY "Members can update expenses"
ON public.expenses FOR UPDATE
USING (public.has_workspace_access(auth.uid(), workspace_id));

-- Revenue policies
CREATE POLICY "Users can view revenue in their workspaces"
ON public.revenue FOR SELECT
USING (public.has_workspace_access(auth.uid(), workspace_id));

CREATE POLICY "Members can create revenue"
ON public.revenue FOR INSERT
WITH CHECK (public.has_workspace_access(auth.uid(), workspace_id));

CREATE POLICY "Members can update revenue"
ON public.revenue FOR UPDATE
USING (public.has_workspace_access(auth.uid(), workspace_id));

-- Audit logs policies (read-only for members, insert for system)
CREATE POLICY "Users can view audit logs in their workspaces"
ON public.audit_logs FOR SELECT
USING (public.has_workspace_access(auth.uid(), workspace_id));

CREATE POLICY "Members can create audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (public.has_workspace_access(auth.uid(), workspace_id));

-- Workspace invites policies
CREATE POLICY "Users can view invites in their workspaces"
ON public.workspace_invites FOR SELECT
USING (public.has_workspace_access(auth.uid(), workspace_id) OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Admins can create invites"
ON public.workspace_invites FOR INSERT
WITH CHECK (public.is_workspace_admin(auth.uid(), workspace_id));

CREATE POLICY "Invites can be updated by admins or invitee"
ON public.workspace_invites FOR UPDATE
USING (public.is_workspace_admin(auth.uid(), workspace_id) OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for timestamp updates
CREATE TRIGGER update_workspaces_updated_at
BEFORE UPDATE ON public.workspaces
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_founders_updated_at
BEFORE UPDATE ON public.founders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.founders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.revenue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.capital_contributions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;