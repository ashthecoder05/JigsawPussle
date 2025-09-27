-- Simple Game Arcade Schema
-- Run these SQL commands in your Supabase SQL Editor

-- Create players table (no auth needed)
CREATE TABLE public.players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create scores table
CREATE TABLE public.scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  game_type TEXT NOT NULL CHECK (game_type IN ('jigsaw', 'memory', 'color')),
  score INTEGER NOT NULL,
  moves INTEGER, -- For jigsaw puzzle (number of moves)
  time_taken INTEGER, -- Time in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (but make it simple)
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- Simple policies - anyone can read, anyone can insert
CREATE POLICY "Anyone can view players" ON public.players
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create players" ON public.players
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view scores" ON public.scores
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert scores" ON public.scores
  FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX players_name_idx ON public.players (name);
CREATE INDEX scores_player_id_idx ON public.scores (player_id);
CREATE INDEX scores_game_type_idx ON public.scores (game_type);
CREATE INDEX scores_score_idx ON public.scores (score DESC);
CREATE INDEX scores_created_at_idx ON public.scores (created_at DESC);

-- Create a view for leaderboards with player names
CREATE VIEW public.leaderboard AS
SELECT
  s.*,
  p.name as player_name
FROM public.scores s
JOIN public.players p ON s.player_id = p.id
ORDER BY s.score DESC;