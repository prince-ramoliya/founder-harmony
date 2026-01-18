-- Create a SECURITY DEFINER RPC to create a workspace and immediately assign the creator as admin
-- This avoids RLS issues when returning the inserted workspace row before membership exists.
CREATE OR REPLACE FUNCTION public.create_workspace(_name text)
RETURNS public.workspaces
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ws public.workspaces;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  INSERT INTO public.workspaces (name)
  VALUES (_name)
  RETURNING * INTO ws;

  INSERT INTO public.user_roles (user_id, workspace_id, role)
  VALUES (auth.uid(), ws.id, 'admin')
  ON CONFLICT (user_id, workspace_id) DO NOTHING;

  RETURN ws;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_workspace(text) TO authenticated;