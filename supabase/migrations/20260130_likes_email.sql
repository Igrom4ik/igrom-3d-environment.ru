-- Add email column to likes table
ALTER TABLE public.likes ADD COLUMN IF NOT EXISTS email TEXT;

-- Create unique index to prevent duplicate likes from same email on same project
-- We use a unique index instead of a constraint to easily handle the "if exists" logic via ON CONFLICT (if needed) or just catching the error
CREATE UNIQUE INDEX IF NOT EXISTS idx_likes_project_email ON public.likes(project_slug, email);

-- Update RLS policies to allow inserting with email
DROP POLICY IF EXISTS "Anyone can insert likes" ON public.likes;
CREATE POLICY "Anyone can insert likes" ON public.likes
    FOR INSERT WITH CHECK (true);
