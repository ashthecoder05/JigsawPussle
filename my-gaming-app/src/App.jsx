import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import './App.css'
import JigsawPuzzle from './components/JigsawPuzzle';
import MemoryMatchingGame from './components/MemoryMatchingGame';
import ColorRush90 from './components/ColorMode';
import Auth from './components/Auth';
import SimpleAuth from './components/SimpleAuth';
import Scoreboard from './components/Scoreboard';
import { auth, supabase } from './lib/supabase';
import { saveUserToGlobalList } from './lib/localStorage';

function HomePage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center">
      <div className="w-full max-w-7xl px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
            Welcome to Game Arcade
          </h1>
        </div>

        {/* Subtitle */}
        <div className="text-center mb-16">
          <p className="text-xl text-gray-600">Choose your favorite game to play!</p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full mb-16">
          {/* Jigsaw Puzzle Game Card */}
          <Link
            to="/jigsaw"
            className="bg-white rounded-3xl shadow-xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group block"
          >
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-4xl text-white shadow-lg group-hover:shadow-xl transition-shadow">
                🧩
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Jigsaw Puzzle</h2>
              <p className="text-gray-600 mb-6">
                Solve the 3×3 sliding puzzle by arranging numbers 1-8 in order
              </p>
              <div className="inline-flex items-center text-blue-600 font-semibold">
                Play Now
                <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>

          {/* Memory Matching Game Card */}
          <Link
            to="/memory"
            className="bg-white rounded-3xl shadow-xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group block"
          >
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-4xl text-white shadow-lg group-hover:shadow-xl transition-shadow">
                🧠
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Memory Matching</h2>
              <p className="text-gray-600 mb-6">
                Test your memory by finding matching pairs of cards
              </p>
              <div className="inline-flex items-center text-purple-600 font-semibold">
                Play Now
                <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>

          {/* Color Rush Game Card */}
          <Link
            to="/color"
            className="bg-white rounded-3xl shadow-xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group block"
          >
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-400 via-yellow-400 to-green-400 rounded-full flex items-center justify-center text-4xl text-white shadow-lg group-hover:shadow-xl transition-shadow">
                🌈
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Color Rush</h2>
              <p className="text-gray-600 mb-6">
                Fast-paced 90-second color matching challenge
              </p>
              <div className="inline-flex items-center text-red-600 font-semibold">
                Play Now
                <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>
        </div>

      </div>
    </div>
  )
}

function GameLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-gray-100">
      <Link
        to="/"
        className="fixed top-4 left-4 z-50 bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-2"
      >
        ← Back to Arcade
      </Link>
      {children}
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check authentication state
  useEffect(() => {
    // First check for local storage user
    const localUser = localStorage.getItem('gameArcadeUser')
    if (localUser) {
      try {
        const user = JSON.parse(localUser)
        // Make sure user is in global list for shared scoreboard
        saveUserToGlobalList(user)
        setUser(user)
        setLoading(false)
        return
      } catch {
        localStorage.removeItem('gameArcadeUser')
      }
    }

    // If Supabase is configured, check for Supabase user
    if (supabase) {
      auth.getCurrentUser().then(({ data: { user } }) => {
        setUser(user)
        setLoading(false)
      })

      const { data: { subscription } } = auth.onAuthStateChange(
        (_, session) => {
          setUser(session?.user ?? null)
          setLoading(false)
        }
      )

      return () => subscription.unsubscribe()
    } else {
      setLoading(false)
    }
  }, [])


  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading Game Arcade...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="w-full min-h-screen">
        <Routes>
          <Route
            path="/"
            element={<HomePage />}
          />
          <Route
            path="/jigsaw"
            element={
              <GameLayout>
                <JigsawPuzzle user={user} />
              </GameLayout>
            }
          />
          <Route
            path="/memory"
            element={
              <GameLayout>
                <MemoryMatchingGame user={user} />
              </GameLayout>
            }
          />
          <Route
            path="/color"
            element={
              <GameLayout>
                <ColorRush90 user={user} />
              </GameLayout>
            }
          />
          <Route
            path="/scoreboard"
            element={
              <GameLayout>
                <Scoreboard user={user} />
              </GameLayout>
            }
          />
          <Route
            path="/auth"
            element={
              supabase ?
                <Auth onAuthSuccess={() => window.location.href = '/'} /> :
                <SimpleAuth onAuthSuccess={(user) => {
                  setUser(user)
                  window.location.href = '/'
                }} />
            }
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App