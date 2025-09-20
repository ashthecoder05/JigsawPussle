import { useState } from 'react'
import './App.css'
import JigsawPuzzle from './components/JigsawPuzzle';
import MemoryMatchingGame from './components/MemoryMatchingGame';

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  const renderPage = () => {
    switch(currentPage) {
      case 'jigsaw':
        return <JigsawPuzzle />
      case 'memory':
        return <MemoryMatchingGame />
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center p-8">
            <div className="text-center mb-12">
              <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
                Welcome to Game Arcade
              </h1>
              <p className="text-xl text-gray-600">Choose your favorite game to play!</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
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
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen">
      {currentPage !== 'home' && (
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
