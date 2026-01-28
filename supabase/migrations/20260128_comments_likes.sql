
-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_slug TEXT NOT NULL,
    nickname TEXT NOT NULL,
    email TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create likes table
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_slug TEXT NOT NULL,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Create policies for comments
CREATE POLICY "Anyone can view comments" ON public.comments
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert comments" ON public.comments
    FOR INSERT WITH CHECK (true);

-- Create policies for likes
CREATE POLICY "Anyone can view likes" ON public.likes
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert likes" ON public.likes
    FOR INSERT WITH CHECK (true);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_comments_project_slug ON public.comments(project_slug);
CREATE INDEX IF NOT EXISTS idx_likes_project_slug ON public.likes(project_slug);
