-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create posts table for saved generated posts
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  key_points JSONB NOT NULL,
  audience TEXT NOT NULL,
  selected_style JSONB NOT NULL,
  content TEXT NOT NULL,
  hook_options JSONB NOT NULL,
  selected_hook TEXT,
  variations JSONB,
  is_favorite BOOLEAN DEFAULT false,
  uses INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create voices table for voice samples
CREATE TABLE IF NOT EXISTS public.voices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create calendar_events table
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('post', 'idea', 'task')),
  hook TEXT,
  category TEXT,
  color TEXT NOT NULL CHECK (color IN ('orange', 'blue', 'green', 'purple')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reference_posts table (for reference library)
CREATE TABLE IF NOT EXISTS public.reference_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Founder', 'Storytelling', 'Career Growth', 'AI', 'Sales', 'Marketing')),
  tags JSONB NOT NULL,
  author TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own data
CREATE POLICY "Users can view their own posts" ON posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own voices" ON voices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own voices" ON voices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own voices" ON voices FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own calendar events" ON calendar_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own calendar events" ON calendar_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own calendar events" ON calendar_events FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view reference posts" ON reference_posts FOR SELECT USING (true);
