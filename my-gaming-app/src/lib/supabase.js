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

// Simple player management functions
export const players = {
  // Create or get existing player by name
  createOrGetPlayer: async (name) => {
    if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }

    // First try to find existing player
    const { data: existing, error: findError } = await supabase
      .from('players')
      .select('*')
      .eq('name', name)
      .single()

    if (existing) {
      return { data: existing, error: null }
    }

    // If not found, create new player
    const { data: newPlayer, error: createError } = await supabase
      .from('players')
      .insert([{ name }])
      .select()
      .single()

    return { data: newPlayer, error: createError }
  },

  // Get player by ID
  getPlayer: async (playerId) => {
    if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', playerId)
      .single()
    return { data, error }
  },

  // Check if name is available
  isNameAvailable: async (name) => {
    if (!supabase) return { available: true, error: null }
    const { data, error } = await supabase
      .from('players')
      .select('id')
      .eq('name', name)
      .single()

    return { available: !data, error }
  }
}

// Score management functions
export const scores = {
  // Save game score
  saveScore: async (playerId, gameType, score, moves = null, time = null) => {
    if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
    const { data, error } = await supabase
      .from('scores')
      .insert([
        {
          player_id: playerId,
          game_type: gameType,
          score: score,
          moves: moves,
          time_taken: time
        }
      ])
      .select()
    return { data, error }
  },

  // Get player's best scores for all games
  getPlayerBestScores: async (playerId) => {
    if (!supabase) return { data: [], error: null }
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('player_id', playerId)
      .order('score', { ascending: false })
    return { data, error }
  },

  // Get leaderboard for a specific game
  getGameLeaderboard: async (gameType, limit = 10) => {
    if (!supabase) return { data: [], error: null }
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('game_type', gameType)
      .order('score', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  // Get overall leaderboard (all games)
  getOverallLeaderboard: async (limit = 10) => {
    if (!supabase) return { data: [], error: null }
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(limit)
    return { data, error }
  }
}

// Local storage helpers for persistence
export const localStorage = {
  // Save player data locally
  savePlayer: (player) => {
    try {
      window.localStorage.setItem('arcade_player', JSON.stringify(player))
    } catch (error) {
      console.error('Failed to save player to localStorage:', error)
    }
  },

  // Get player data from local storage
  getPlayer: () => {
    try {
      const stored = window.localStorage.getItem('arcade_player')
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('Failed to get player from localStorage:', error)
      return null
    }
  },

  // Clear player data
  clearPlayer: () => {
    try {
      window.localStorage.removeItem('arcade_player')
    } catch (error) {
      console.error('Failed to clear player from localStorage:', error)
    }
  }
}