import React, { useState, useEffect } from 'react';
import { scores } from '../lib/supabase';

const MemoryMatchingGame = ({ player }) => {
  const symbols = ['♠', '♥', '♦', '♣', '★', '♪', '☀', '☽', '❤', '☘', '⚡', '☃'];

  const [difficulty, setDifficulty] = useState('easy');
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const getDifficultySettings = () => {
    switch (difficulty) {
      case 'easy':
        return { pairs: 6, rows: 3, cols: 4 };
      case 'medium':
        return { pairs: 8, rows: 4, cols: 4 };
      case 'hard':
        return { pairs: 12, rows: 4, cols: 6 };
      default:
        return { pairs: 6, rows: 3, cols: 4 };
    }
  };

  const initializeGame = () => {
    const { pairs } = getDifficultySettings();
    const selectedSymbols = symbols.slice(0, pairs);
    const cardPairs = [...selectedSymbols, ...selectedSymbols];

    const shuffledCards = cardPairs
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false
      }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs([]);
    setMoves(0);
    setGameStarted(true);
    setGameWon(false);
    setTimeElapsed(0);
  };

  const handleCardClick = (cardId) => {
    if (!gameStarted || gameWon) return;

    const card = cards.find(c => c.id === cardId);
    if (card.isFlipped || card.isMatched || flippedCards.length >= 2) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    setCards(prevCards =>
      prevCards.map(c =>
        c.id === cardId ? { ...c, isFlipped: true } : c
      )
    );

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);

      const [firstCardId, secondCardId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstCardId);
      const secondCard = cards.find(c => c.id === secondCardId);

      if (firstCard.symbol === secondCard.symbol) {
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(c =>
              c.id === firstCardId || c.id === secondCardId
                ? { ...c, isMatched: true }
                : c
            )
          );
          setMatchedPairs(prev => [...prev, firstCard.symbol]);
          setFlippedCards([]);
        }, 1000);
      } else {
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(c =>
              c.id === firstCardId || c.id === secondCardId
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    let interval;
    if (gameStarted && !gameWon) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameWon]);

  useEffect(() => {
    const { pairs } = getDifficultySettings();
    if (matchedPairs.length === pairs && gameStarted) {
      setGameWon(true);
      setGameStarted(false);

      // Save score when game is won
      if (player) {
        // Calculate score based on efficiency (lower moves and time = higher score)
        const efficiency = Math.max(0, 1000 - (moves * 10) - timeElapsed);
        scores.saveScore(player.id, 'memory', efficiency, moves, timeElapsed);
      }
    }
  }, [matchedPairs, difficulty, gameStarted, player, moves, timeElapsed]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const { rows, cols } = getDifficultySettings();

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
            Memory Matching Game
          </h1>
          <p className="text-gray-600 text-lg">
            Test your memory by finding matching pairs of cards
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {/* Game Setup */}
          {!gameStarted && !gameWon && (
            <div className="text-center mb-8">
              <div className="mb-6">
                <label className="block text-xl font-semibold text-gray-700 mb-4">
                  Choose Your Challenge:
                </label>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="px-6 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-medium"
                  >
                    <option value="easy">Easy (3×4 - 6 pairs)</option>
                    <option value="medium">Medium (4×4 - 8 pairs)</option>
                    <option value="hard">Hard (4×6 - 12 pairs)</option>
                  </select>
                  <button
                    onClick={initializeGame}
                    className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Start Game
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Game Stats */}
          {gameStarted && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-gray-50 rounded-xl p-4">
              <div className="text-xl font-bold text-gray-700">
                Moves: <span className="text-purple-600">{moves}</span>
              </div>
              <div className="text-xl font-bold text-gray-700">
                Time: <span className="text-purple-600">{formatTime(timeElapsed)}</span>
              </div>
              <button
                onClick={initializeGame}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                New Game
              </button>
            </div>
          )}

          {/* Win Message */}
          {gameWon && (
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 border border-green-400 text-green-800 px-6 py-6 rounded-xl mb-8 text-center animate-bounce">
              <div className="text-3xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
              <p className="text-lg mb-4">You completed the game in {moves} moves and {formatTime(timeElapsed)}!</p>
              <button
                onClick={initializeGame}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Play Again
              </button>
            </div>
          )}

          {/* Game Board */}
          {cards.length > 0 && (
            <div className="flex justify-center mb-8">
              <div
                className={`grid gap-3 md:gap-4`}
                style={{
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                }}
              >
                {cards.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    className={`
                      w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 flex items-center justify-center text-2xl md:text-3xl font-bold rounded-xl shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105 active:scale-95
                      ${card.isFlipped || card.isMatched
                        ? 'bg-gradient-to-br from-purple-400 to-purple-600 text-white rotate-0'
                        : 'bg-gradient-to-br from-gray-200 to-gray-400 text-gray-400 hover:from-gray-300 hover:to-gray-500'
                      }
                      ${card.isMatched ? 'ring-4 ring-green-400 shadow-xl' : ''}
                    `}
                  >
                    {card.isFlipped || card.isMatched ? card.symbol : '?'}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Welcome Message */}
          {!gameStarted && !gameWon && cards.length === 0 && (
            <div className="text-center py-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">How to Play:</h3>
                <div className="space-y-2 text-gray-600">
                  <p>🔍 Choose your difficulty level above</p>
                  <p>🃏 Click cards to flip them and reveal symbols</p>
                  <p>🎯 Find matching pairs by remembering card locations</p>
                  <p>🏆 Match all pairs to win the game!</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoryMatchingGame;