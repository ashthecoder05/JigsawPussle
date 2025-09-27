import React, { useState, useEffect, useRef } from 'react';
import { Clock, Trophy, Target, RotateCcw } from 'lucide-react';


const ColorRush90 = () => {
    const [gameState, setGameState] = useState('menu'); // menu, playing, gameOver
    const [timeLeft, setTimeLeft] = useState(90);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [currentWord, setCurrentWord] = useState('');
    const [currentColor, setCurrentColor] = useState('');
    const [isMatch, setIsMatch] = useState(false);
    const [highScore, setHighScore] = useState(0);

    const timerRef = useRef(null);

    // Colors for the challenge
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

    useEffect(() => {
        const savedHighScore = localStorage.getItem('colorRush90HighScore');
        if (savedHighScore) {
          setHighScore(parseInt(savedHighScore));
        }
      }, []);


      const generateChallenge = () => {
        const word = colorNames[Math.floor(Math.random() * colorNames.length)];
        const color = colorNames[Math.floor(Math.random() * colorNames.length)];
        const match = Math.random() < 0.5;

        setCurrentWord(word);
        setCurrentColor(match ? word : color);
        setIsMatch(match);
      };

      const startGame = () => {
        setGameState('playing');
        setTimeLeft(90);
        setScore(0);
        setStreak(0);
        setBestStreak(0);
        generateChallenge();

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
              if (prev <= 1) {
                endGame();
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
    };

    const handleAnswer = (answer) => {
        if (gameState !== 'playing') return;

        if (answer === isMatch) {
          // Correct answer
          setScore(prev => prev + 1);
          setStreak(prev => {
            const newStreak = prev + 1;
            setBestStreak(current => Math.max(current, newStreak));
            return newStreak;
          });
        } else {
          // Wrong answer
          setStreak(0);
        }

        // Generate next challenge immediately
        generateChallenge();
      };

      const endGame = () => {
        setGameState('gameOver');
        clearInterval(timerRef.current);

        // Update high score
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem('colorRush90HighScore', score.toString());
        }
      };

      useEffect(() => {
        const handleKeyPress = (e) => {
          if (gameState === 'playing') {
            if (e.key === 'y' || e.key === 'Y' || e.key === '1' || e.key === 'ArrowLeft') {
              handleAnswer(true);
            } else if (e.key === 'n' || e.key === 'N' || e.key === '2' || e.key === 'ArrowRight') {
              handleAnswer(false);
            }
          }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
      }, [gameState]);

      useEffect(() => {
        return () => {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
        };
      }, []);


      const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      };


      if (gameState === 'menu') {
        return (
          <div className="w-full min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex flex-col items-center justify-center px-4 py-8">
            <div className="w-full max-w-4xl">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 mb-4">
                  Color Rush Challenge
                </h1>
                <p className="text-gray-600 text-lg">
                  Fast-paced 90-second color matching challenge
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                <div className="text-center mb-8">
                  <div className="text-6xl mb-6">🏃‍♂️💨</div>
                  <h2 className="text-3xl font-bold text-orange-600 mb-8">90-Second Challenge</h2>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 mb-8">
                  <h3 className="text-2xl font-bold text-red-600 mb-4 text-center">🎯 How to Play</h3>
                  <div className="space-y-3 text-lg text-gray-700">
                    <p>• You have exactly <span className="text-red-600 font-bold">90 SECONDS</span></p>
                    <p>• Click <span className="text-green-600 font-bold">YES</span> if the word matches the color</p>
                    <p>• Click <span className="text-red-600 font-bold">NO</span> if they don't match</p>
                    <p>• Go as <span className="text-orange-600 font-bold">FAST</span> as possible!</p>
                    <p>• Build streaks for maximum points</p>
                  </div>
                </div>

                {highScore > 0 && (
                  <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-400 rounded-xl p-4 mb-6 text-center">
                    <p className="text-orange-700 text-xl font-bold">
                      🏆 Personal Best: {highScore} correct answers
                    </p>
                  </div>
                )}

                <div className="text-center">
                  <button
                    onClick={startGame}
                    className="px-12 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white text-2xl font-bold rounded-xl hover:from-red-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl mb-4"
                  >
                    START CHALLENGE
                  </button>

                  <div className="text-gray-500">
                    <p>Keyboard shortcuts: Y/1/← = YES | N/2/→ = NO</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // Game Screen
      if (gameState === 'playing') {
        return (
          <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 px-4 py-8">
            <div className="w-full max-w-5xl mx-auto">
              {/* Stats Bar */}
              <div className="bg-black bg-opacity-70 rounded-2xl p-6 mb-8 text-white">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="flex items-center gap-3">
                      <Trophy className="text-yellow-400" size={32} />
                      <div className="text-center sm:text-left">
                        <div className="text-3xl font-bold">{score}</div>
                        <div className="text-sm text-gray-300">Score</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Target className="text-orange-400" size={32} />
                      <div className="text-center sm:text-left">
                        <div className="text-2xl font-bold">{streak}</div>
                        <div className="text-sm text-gray-300">Streak</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-300">{bestStreak}</div>
                      <div className="text-sm text-gray-300">Best</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="text-red-400" size={32} />
                    <div className="text-center">
                      <div className="text-4xl font-bold text-red-400">{formatTime(timeLeft)}</div>
                      <div className="text-sm text-gray-300">Time Left</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Game Area */}
              <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
                <div className="mb-8">
                  <p className="text-gray-600 text-xl mb-6 font-semibold">
                    Does the word match the color?
                  </p>
                  <div
                    className="text-6xl md:text-8xl lg:text-9xl font-bold mb-8 p-6 rounded-2xl border-4 border-gray-300 transition-all duration-200"
                    style={{ color: colors[currentColor] }}
                  >
                    {currentWord}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
                  <button
                    onClick={() => handleAnswer(true)}
                    className="px-16 py-6 bg-green-600 text-white text-3xl font-bold rounded-2xl hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-2xl w-full sm:w-auto"
                  >
                    YES
                  </button>
                  <button
                    onClick={() => handleAnswer(false)}
                    className="px-16 py-6 bg-red-600 text-white text-3xl font-bold rounded-2xl hover:bg-red-700 transition-all duration-200 transform hover:scale-105 shadow-2xl w-full sm:w-auto"
                  >
                    NO
                  </button>
                </div>

                <div className="mt-8 text-gray-500 text-lg">
                  <p>Y/1/← = YES | N/2/→ = NO</p>
                  <p className="text-sm mt-2">Go as fast as possible!</p>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="mt-6 text-center">
                <div className="bg-gray-200 rounded-full h-4 max-w-md mx-auto">
                  <div
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-1000"
                    style={{ width: `${((90 - timeLeft) / 90) * 100}%` }}
                  ></div>
                </div>
                <p className="text-white mt-2">Progress: {Math.round(((90 - timeLeft) / 90) * 100)}%</p>
              </div>
            </div>
          </div>
        );
      }

      // Game Over Screen
      if (gameState === 'gameOver') {
        const isNewRecord = score === highScore && score > 0;

        return (
          <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex flex-col items-center justify-center px-4 py-8">
            <div className="w-full max-w-3xl">
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 text-center">
                <div className="text-6xl mb-6">
                  {isNewRecord ? '🏆' : '⏱️'}
                </div>
                <h2 className="text-4xl font-bold mb-6 text-gray-800">
                  {isNewRecord ? 'NEW RECORD!' : 'TIME\'S UP!'}
                </h2>

                <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-orange-500 mb-2">{score}</div>
                      <div className="text-lg text-gray-600">Final Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-red-500 mb-2">{bestStreak}</div>
                      <div className="text-lg text-gray-600">Best Streak</div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-300">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">{highScore}</div>
                      <div className="text-lg text-gray-600">Personal Best</div>
                    </div>
                  </div>
                </div>

                {isNewRecord && (
                  <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-400 rounded-xl p-4 mb-6">
                    <p className="text-orange-700 text-xl font-bold">
                      🎉 Congratulations on your new record!
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <button
                    onClick={startGame}
                    className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white text-xl font-bold rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    PLAY AGAIN
                  </button>
                  <button
                    onClick={() => setGameState('menu')}
                    className="block mx-auto px-8 py-3 bg-gray-600 text-white text-lg font-bold rounded-xl hover:bg-gray-700 transition-colors"
                  >
                    Main Menu
                  </button>
                </div>

                <div className="mt-8 text-gray-500 text-sm">
                  <p>Challenge friends to beat your record of {highScore} correct answers!</p>
                </div>
              </div>
            </div>
          </div>
        );
      }
    };

    export default ColorRush90;