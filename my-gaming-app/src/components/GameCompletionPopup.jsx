import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GameCompletionPopup = ({
  isVisible,
  gameTitle,
  score,
  moves,
  time,
  player,
  onPlayAgain,
  onClose
}) => {
  const navigate = useNavigate();
  const [confettiPieces, setConfettiPieces] = useState([]);

  useEffect(() => {
    if (isVisible) {
      // Generate confetti pieces
      const pieces = [];
      for (let i = 0; i < 50; i++) {
        pieces.push({
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 3,
          duration: 3 + Math.random() * 2,
          color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'][Math.floor(Math.random() * 6)]
        });
      }
      setConfettiPieces(pieces);
    }
  }, [isVisible]);

  const handleBackToArcade = () => {
    navigate('/');
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confettiPieces.map((piece) => (
          <div
            key={piece.id}
            className="absolute w-3 h-3 rounded-full animate-bounce"
            style={{
              left: `${piece.left}%`,
              backgroundColor: piece.color,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              top: '-20px',
              transform: 'translateY(100vh)',
            }}
          />
        ))}
      </div>

      {/* Popup Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full mx-4 text-center animate-[fadeIn_0.5s_ease-out]">

        {/* Trophy and Title */}
        <div className="mb-8">
          <div className="text-8xl mb-4 animate-bounce">🏆</div>
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-4">
            Congratulations!
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            {gameTitle} Completed!
          </h2>
          {player && (
            <p className="text-lg text-gray-600">
              Great job, <span className="font-semibold text-purple-600">{player.name}</span>!
            </p>
          )}
        </div>

        {/* Game Stats */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Your Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {score !== undefined && (
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">{score}</div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
            )}
            {moves !== undefined && (
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">{moves}</div>
                <div className="text-sm text-gray-600">Moves</div>
              </div>
            )}
            {time !== undefined && (
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">{time}</div>
                <div className="text-sm text-gray-600">Time</div>
              </div>
            )}
          </div>
        </div>

        {/* Score Saved Message */}
        {player && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-700 font-semibold">
                Score saved to leaderboard!
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onPlayAgain}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xl font-bold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            🎮 Play Again
          </button>
          <button
            onClick={handleBackToArcade}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xl font-bold rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            🏠 Back to Arcade
          </button>
        </div>

        {/* Fun Message */}
        <div className="mt-8 text-gray-500">
          <p className="text-lg">🎉 Amazing work! Challenge your friends to beat your score!</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default GameCompletionPopup;