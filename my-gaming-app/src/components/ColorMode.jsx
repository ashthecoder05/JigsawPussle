import React, { useState, useEffect, useRef } from 'react';
import { scores } from '../lib/supabase';
import GameCompletionPopup from './GameCompletionPopup';

const ColorRush90 = ({ player }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [currentColor, setCurrentColor] = useState('');
  const [isMatch, setIsMatch] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  const timerRef = useRef(null);
  const scoreSavedRef = useRef(false);

  const colors = {
    'RED': '#dc2626',
    'BLUE': '#2563eb',
    'GREEN': '#16a34a',
    'YELLOW': '#eab308',
    'PURPLE': '#9333ea',
    'ORANGE': '#ea580c',
    'PINK': '#ec4899',
    'CYAN': '#06b6d4'
  };

  const colorNames = Object.keys(colors);

  const fetchLeaderboard = async () => {
    try {
      const { data } = await scores.getGameLeaderboard('color', 10);
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setLeaderboard([]);
    }
    setLoadingLeaderboard(false);
  };

  const generateChallenge = () => {
    const word = colorNames[Math.floor(Math.random() * colorNames.length)];
    const color = colorNames[Math.floor(Math.random() * colorNames.length)];
    const match = Math.random() < 0.5;

    setCurrentWord(word);
    setCurrentColor(match ? word : color);
    setIsMatch(match);
  };

  const startGame = () => {
    setGameStarted(true);
    setGameWon(false);
    setTimeLeft(10);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    scoreSavedRef.current = false;
    generateChallenge();

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setScore(currentScore => {
            endGame(currentScore);
            return currentScore;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswer = (answer) => {
    if (!gameStarted || gameWon) return;

    if (answer === isMatch) {
      setScore(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        setBestStreak(current => Math.max(current, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
    }

    generateChallenge();
  };

  const endGame = (finalScore = score) => {
    setGameWon(true);
    setGameStarted(false);
    clearInterval(timerRef.current);

    if (player && !scoreSavedRef.current) {
      scoreSavedRef.current = true;
      scores.saveScore(player.id, 'color', finalScore, null, 10);

      setTimeout(() => {
        fetchLeaderboard();
      }, 1000);
    }
  };


  useEffect(() => {
    fetchLeaderboard();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const GameLeaderboard = () => (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        🏆 High Scores
      </h3>
      {loadingLeaderboard ? (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.length > 0 ? (
            leaderboard.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  index === 0
                    ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400'
                    : index === 1
                    ? 'bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-400'
                    : index === 2
                    ? 'bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-400'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{entry.player_name}</p>
                    <p className="text-xs text-gray-600">
                      10-second rush
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">{entry.score}</p>
                  <p className="text-xs text-gray-500">correct</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p className="text-lg">🎯</p>
              <p className="text-sm">No scores yet!</p>
              <p className="text-xs">Be the first to complete the challenge</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 mb-4">
            Color Rush Challenge
          </h1>
          <p className="text-gray-600 text-lg">
            Fast-paced 10-second color matching challenge
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              {/* Game Setup */}
              {!gameStarted && !gameWon && (
                <div className="text-center mb-8">
                  <div className="mb-6">
                    <div className="text-6xl mb-6">🏃‍♂️💨</div>
                    <h2 className="text-3xl font-bold text-orange-600 mb-6">10-Second Challenge</h2>
                  </div>


                  <button
                    onClick={startGame}
                    className="px-12 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white text-2xl font-bold rounded-xl hover:from-red-600 hover:to-orange-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    START CHALLENGE
                  </button>

                  <div className="mt-4 text-gray-500">
                    {player && <p className="text-sm mt-1">Playing as: {player.name}</p>}
                  </div>
                </div>
              )}

              {/* Game Stats */}
              {gameStarted && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-gray-50 rounded-xl p-4">
                  <div className="text-xl font-bold text-gray-700">
                    Score: <span className="text-red-600">{score}</span>
                  </div>
                  <div className="text-xl font-bold text-gray-700">
                    Time: <span className="text-red-600">{formatTime(timeLeft)}</span>
                  </div>
                  <div className="text-xl font-bold text-gray-700">
                    Streak: <span className="text-orange-600">{streak}</span>
                  </div>
                  {player && (
                    <div className="text-sm text-gray-600">Playing as: {player.name}</div>
                  )}
                  <button
                    onClick={startGame}
                    className="px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    New Game
                  </button>
                </div>
              )}


              {/* Game Board */}
              {gameStarted && !gameWon && (
                <div className="text-center mb-8">
                  <p className="text-gray-600 text-xl mb-6 font-semibold">
                    Does the word match the color?
                  </p>
                  <div
                    className="text-6xl md:text-8xl font-bold mb-8 p-6 rounded-2xl border-4 border-gray-300 transition-all duration-200"
                    style={{ color: colors[currentColor] }}
                  >
                    {currentWord}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <button
                      onClick={() => handleAnswer(true)}
                      className="px-12 py-4 bg-green-600 text-white text-2xl font-bold rounded-xl hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-xl w-full sm:w-auto"
                    >
                      YES
                    </button>
                    <button
                      onClick={() => handleAnswer(false)}
                      className="px-12 py-4 bg-red-600 text-white text-2xl font-bold rounded-xl hover:bg-red-700 transition-all duration-200 transform hover:scale-105 shadow-xl w-full sm:w-auto"
                    >
                      NO
                    </button>
                  </div>

                  <div className="mt-6 text-gray-500">
                    <p className="text-sm mt-2">Go as fast as possible!</p>
                  </div>
                </div>
              )}

              {/* Welcome Message */}
              {!gameStarted && !gameWon && (
                <div className="text-center py-8">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Ready for the Challenge?</h3>
                    <div className="space-y-2 text-gray-600">
                      <p>🏃‍♂️ Test your speed and accuracy</p>
                      <p>🎯 Match colors as fast as you can</p>
                      <p>⏱️ Beat the 10-second countdown</p>
                      <p>🏆 Compete for the highest score!</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-1">
            <GameLeaderboard />
          </div>
        </div>
      </div>

      {/* Game Completion Popup */}
      <GameCompletionPopup
        isVisible={gameWon}
        gameTitle="Color Rush"
        score={score}
        time="10 seconds"
        player={player}
        onPlayAgain={startGame}
        onClose={() => setGameWon(false)}
      />
    </div>
  );
};

export default ColorRush90;