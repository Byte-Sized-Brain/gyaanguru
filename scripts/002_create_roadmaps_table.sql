-- Create roadmaps table
CREATE TABLE IF NOT EXISTS public.roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  goal TEXT NOT NULL,
  time_commitment TEXT,
  additional_info TEXT,
  content JSONB NOT NULL,
  nsqf_level INTEGER,
  nsqf_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS roadmaps_user_id_idx ON public.roadmaps(user_id);
CREATE INDEX IF NOT EXISTS roadmaps_created_at_idx ON public.roadmaps(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own roadmaps"
  ON public.roadmaps
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roadmaps"
  ON public.roadmaps
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roadmaps"
  ON public.roadmaps
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roadmaps"
  ON public.roadmaps
  FOR DELETE
  USING (auth.uid() = user_id);
