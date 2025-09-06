-- Enable RLS on queries table
ALTER TABLE public.queries ENABLE ROW LEVEL SECURITY;

-- Create policies for queries table
-- Allow users to view queries associated with their email
CREATE POLICY "queries_select_by_email" ON public.queries
  FOR SELECT USING (true); -- Allow reading all queries for demo purposes

-- Allow users to insert queries
CREATE POLICY "queries_insert" ON public.queries
  FOR INSERT WITH CHECK (true); -- Allow inserting queries for demo purposes

-- Allow users to update their own queries
CREATE POLICY "queries_update_by_email" ON public.queries
  FOR UPDATE USING (true); -- Allow updating for demo purposes

-- Allow users to delete their own queries  
CREATE POLICY "queries_delete_by_email" ON public.queries
  FOR DELETE USING (true); -- Allow deleting for demo purposes
