-- SQL commands to run in Supabase SQL Editor to fix RLS policy issues

-- First, let's check what policies already exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('disputes', 'evidence');

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('disputes', 'evidence');

-- Enable RLS on tables (if not already enabled)
-- ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;

-- Create policies to allow anonymous users to insert disputes
-- Option 1: Allow all anonymous users to insert disputes
-- CREATE POLICY "Allow anonymous dispute insertion" ON disputes
--     FOR INSERT 
--     TO anon
--     WITH CHECK (true);

-- Allow anonymous users to insert evidence linked to disputes
CREATE POLICY "Allow anonymous evidence insertion" ON evidence
    FOR INSERT 
    TO anon
    WITH CHECK (true);

-- Option 2: More restrictive policy (alternative to Option 1)
-- Only allow inserts with valid email format and required fields
-- CREATE POLICY "Allow valid dispute insertion" ON disputes
--     FOR INSERT 
--     TO anon
--     WITH CHECK (
--         customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
--         AND length(customer_name) > 0
--         AND length(complaint) > 0
--     );

-- Allow authenticated users to read all disputes (for adjudicator view)
CREATE POLICY "Allow authenticated users to read disputes" ON disputes
    FOR SELECT 
    TO authenticated
    USING (true);

-- Allow authenticated users to update disputes (for adjudicator responses)
CREATE POLICY "Allow authenticated users to update disputes" ON disputes
    FOR UPDATE 
    TO authenticated
    USING (true);

-- Allow authenticated users to read evidence
CREATE POLICY "Allow authenticated users to read evidence" ON evidence
    FOR SELECT 
    TO authenticated
    USING (true);

-- Grant necessary permissions to anon role
GRANT INSERT ON disputes TO anon;
GRANT INSERT ON evidence TO anon;

-- Grant sequence usage (only if sequences exist - check table structure first)
-- Run this query first to check if sequences exist:
-- SELECT c.relname FROM pg_class c WHERE c.relkind = 'S' AND c.relname LIKE '%disputes%' OR c.relname LIKE '%evidence%';

-- If sequences exist, uncomment and run these lines:
-- GRANT USAGE ON SEQUENCE disputes_id_seq TO anon;
-- GRANT USAGE ON SEQUENCE evidence_id_seq TO anon;

-- If the tables use UUID (which is common in Supabase), the sequences won't exist
-- and the above grants are not needed