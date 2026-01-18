-- Remove overly-permissive workspace INSERT policy (WITH CHECK true)
DROP POLICY IF EXISTS "Authenticated users can create workspaces" ON public.workspaces;