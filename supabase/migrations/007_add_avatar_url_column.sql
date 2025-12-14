-- Ensure avatar_url column exists on profiles (idempotent)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

