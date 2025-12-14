-- ============================================
-- MIGRATION: Fix SELECT access on profiles (406 errors)
-- ============================================
-- RLS 406 can occur if no policy matches the current role.
-- We add an explicit policy allowing authenticated users to read their own profile.
-- Existing public read policy remains unchanged.

-- Allow authenticated users to select their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Ensure public read (if already present, this is no-op because policy names differ)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT
TO public
USING (true);

