import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if Supabase credentials are configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_project_url_here' && 
  supabaseAnonKey !== 'your_supabase_anon_key_here'

export const supabase = isSupabaseConfigured ? 
  createClient(supabaseUrl, supabaseAnonKey) : 
  null

// Auth helper functions
export const auth = {
  // Sign up new user
  signUp: async (email, password, displayName) => {
    if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        }
      }
    })
    return { data, error }
  },

  // Sign in user
  signIn: async (email, password) => {
    if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Sign out user
  signOut: async () => {
    if (!supabase) return { error: { message: 'Supabase not configured' } }
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  getCurrentUser: () => {
    if (!supabase) return Promise.resolve({ data: { user: null }, error: null })
    return supabase.auth.getUser()
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } }
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helper functions
export const database = {
  // Save game score
  saveScore: async (userId, gameType, score, moves = null, time = null) => {
    if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
    const { data, error } = await supabase
      .from('scores')
      .insert([
        {
          user_id: userId,
          game_type: gameType,
          score: score,
          moves: moves,
          time_taken: time,
          created_at: new Date().toISOString()
        }
      ])
    return { data, error }
  },

  // Get user's best scores
  getUserBestScores: async (userId) => {
    if (!supabase) return { data: [], error: null }
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', userId)
      .order('score', { ascending: false })
    return { data, error }
  },

  // Get leaderboard for a specific game
  getLeaderboard: async (gameType, limit = 10) => {
    if (!supabase) return { data: [], error: null }
    const { data, error } = await supabase
      .from('scores')
      .select(`
        *,
        profiles (display_name)
      `)
      .eq('game_type', gameType)
      .order('score', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  // Get user profile
  getProfile: async (userId) => {
    if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  // Update user profile
  updateProfile: async (userId, updates) => {
    if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
    return { data, error }
  }
}