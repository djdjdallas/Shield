-- Fix RLS: Allow both anonymous AND authenticated users to insert scans
-- This fixes the "new row violates row-level security policy" error

-- Drop existing policies if they exist (to avoid errors)
DROP POLICY IF EXISTS "Authenticated users can insert scans" ON public.scam_scans;
DROP POLICY IF EXISTS "Authenticated users can select all scans" ON public.scam_scans;
DROP POLICY IF EXISTS "Allow public inserts" ON public.scam_scans;
DROP POLICY IF EXISTS "Allow public selects for insert" ON public.scam_scans;

-- Add policy for ALL users (anon + authenticated) to insert
-- Using PUBLIC role covers both anon and authenticated
CREATE POLICY "Allow public inserts" ON public.scam_scans
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Also allow public to select (needed for .insert().select())
CREATE POLICY "Allow public selects for insert" ON public.scam_scans
  FOR SELECT
  TO public
  USING (true);
