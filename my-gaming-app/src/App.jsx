import { useState, useEffect } from 'react'
import './App.css'
import JigsawPuzzle from './components/JigsawPuzzle';
import MemoryMatchingGame from './components/MemoryMatchingGame';
import ColorRush90 from './components/ColorMode';
import Auth from './components/Auth';
import SimpleAuth from './components/SimpleAuth';
import Scoreboard from './components/Scoreboard';
import { auth, supabase } from './lib/supabase';
import { saveUserToGlobalList } from './lib/localStorage';

function App() {
  const [currentPage, setCurrentPage] = useState('home')
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
      } catch (error) {
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
        (event, session) => {
          setUser(session?.user ?? null)
          setLoading(false)
        }
      )

      return () => subscription.unsubscribe()
    } else {
      setLoading(false)
    }
  }, [])

  const handleSignOut = async () => {
    // Handle both local and Supabase users
    if (user?.isLocal) {
      localStorage.removeItem('gameArcadeUser')
      setUser(null)
    } else if (supabase) {
      await auth.signOut()
    }
    setCurrentPage('home')
  }

  const renderPage = () => {
    switch(currentPage) {
      case 'jigsaw':
        return <JigsawPuzzle user={user} />
      case 'memory':
        return <MemoryMatchingGame user={user} />
      case 'color':
        return <ColorRush90 user={user} />
      case 'scoreboard':
        return <Scoreboard user={user} currentPage={currentPage} setCurrentPage={setCurrentPage} />
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center p-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-between w-full max-w-6xl mb-8">
                <div></div>
                <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                  Welcome to Game Arcade
                </h1>
                <div className="flex items-center gap-4">
                  {user ? (
                    <div className="flex items-center gap-4">
                      <span className="text-gray-700">Hello, {user.isLocal ? user.username : (user.user_metadata?.display_name || user.email)}!</span>
                      <button
                        onClick={handleSignOut}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setCurrentPage('auth')}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xl text-gray-600">Choose your favorite game to play!</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full">
              {/* Jigsaw Puzzle Game Card */}
              <div 
                onClick={() => setCurrentPage('jigsaw')}
                className="bg-white rounded-3xl shadow-xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
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
              </div>

              {/* Memory Matching Game Card */}
              <div 
                onClick={() => setCurrentPage('memory')}
                className="bg-white rounded-3xl shadow-xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
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
              </div>

              {/* Color Rush Game Card */}
              <div 
                onClick={() => setCurrentPage('color')}
                className="bg-white rounded-3xl shadow-xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
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
              </div>
            </div>

            {/* Scoreboard Button */}
            <div className="mt-12">
              <button
                onClick={() => setCurrentPage('scoreboard')}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-xl font-bold text-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                🏆 View Scoreboard
              </button>
            </div>
          </div>
        )
      case 'auth':
        // Use SimpleAuth if Supabase is not configured, otherwise use full Auth
        return supabase ? 
          <Auth onAuthSuccess={() => setCurrentPage('home')} /> :
          <SimpleAuth onAuthSuccess={(user) => {
            setUser(user)
            setCurrentPage('home')
          }} />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading Game Arcade...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {currentPage !== 'home' && currentPage !== 'auth' && currentPage !== 'scoreboard' && (
        <button
          onClick={() => setCurrentPage('home')}
          className="fixed top-4 left-4 z-50 bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-2"
        >
          ← Back to Arcade
        </button>
      )}
      {renderPage()}
    </div>
  )
}

export default App
