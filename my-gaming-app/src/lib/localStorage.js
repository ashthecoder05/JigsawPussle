// Local storage utilities for username-based score tracking

// Save user info to global users list
export const saveUserToGlobalList = (user) => {
  try {
    const usersKey = 'gameArcadeAllUsers'
    const existingUsers = JSON.parse(localStorage.getItem(usersKey) || '{}')
    
    // Store user by their ID for easy lookup
    existingUsers[user.id] = {
      id: user.id,
      username: user.username,
      isLocal: user.isLocal,
      lastSeen: new Date().toISOString()
    }
    
    localStorage.setItem(usersKey, JSON.stringify(existingUsers))
    return { data: user, error: null }
  } catch (error) {
    return { data: null, error: { message: 'Failed to save user info' } }
  }
}

// Save a score for a local user
export const saveLocalScore = (userId, gameType, score, moves = null, time = null) => {
  try {
    const scoresKey = 'gameArcadeScores'
    const existingScores = JSON.parse(localStorage.getItem(scoresKey) || '[]')
    
    const newScore = {
      id: Date.now().toString(), // Simple ID based on timestamp
      user_id: userId,
      game_type: gameType,
      score: score,
      moves: moves,
      time_taken: time,
      created_at: new Date().toISOString()
    }
    
    existingScores.push(newScore)
    localStorage.setItem(scoresKey, JSON.stringify(existingScores))
    
    return { data: newScore, error: null }
  } catch (error) {
    return { data: null, error: { message: 'Failed to save score locally' } }
  }
}

// Get user's best scores from local storage
export const getLocalUserBestScores = (userId) => {
  try {
    const scoresKey = 'gameArcadeScores'
    const allScores = JSON.parse(localStorage.getItem(scoresKey) || '[]')
    
    const userScores = allScores
      .filter(score => score.user_id === userId)
      .sort((a, b) => b.score - a.score) // Sort by score descending
    
    return { data: userScores, error: null }
  } catch (error) {
    return { data: [], error: { message: 'Failed to get user scores' } }
  }
}

// Get leaderboard for a specific game from local storage
export const getLocalLeaderboard = (gameType, limit = 10) => {
  try {
    const scoresKey = 'gameArcadeScores'
    const usersKey = 'gameArcadeAllUsers'
    const currentUserKey = 'gameArcadeUser'
    
    const allScores = JSON.parse(localStorage.getItem(scoresKey) || '[]')
    const allUsers = JSON.parse(localStorage.getItem(usersKey) || '{}')
    const currentUser = JSON.parse(localStorage.getItem(currentUserKey) || 'null')
    
    // If current user exists, make sure they're in the all users list
    if (currentUser && !allUsers[currentUser.id]) {
      allUsers[currentUser.id] = currentUser
      localStorage.setItem(usersKey, JSON.stringify(allUsers))
    }
    
    const gameScores = allScores
      .filter(score => score.game_type === gameType)
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, limit)
      .map(score => ({
        ...score,
        profiles: {
          display_name: allUsers[score.user_id]?.username || 'Unknown User'
        }
      }))
    
    return { data: gameScores, error: null }
  } catch (error) {
    return { data: [], error: { message: 'Failed to get leaderboard' } }
  }
}

// Get all local scores for debugging/export
export const getAllLocalScores = () => {
  try {
    const scoresKey = 'gameArcadeScores'
    const allScores = JSON.parse(localStorage.getItem(scoresKey) || '[]')
    return { data: allScores, error: null }
  } catch (error) {
    return { data: [], error: { message: 'Failed to get all scores' } }
  }
}

// Clear all local scores (utility function)
export const clearLocalScores = () => {
  try {
    localStorage.removeItem('gameArcadeScores')
    return { error: null }
  } catch (error) {
    return { error: { message: 'Failed to clear scores' } }
  }
}