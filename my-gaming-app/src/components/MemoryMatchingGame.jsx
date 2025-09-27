import React, { useState, useEffect } from 'react';
import { scores } from '../lib/supabase';
import GameCompletionPopup from './GameCompletionPopup';

const MemoryMatchingGame = ({ player }) => {
  const symbols = ['♠', '♥', '♦', '♣', '★', '♪', '☀', '☽', '❤', '☘', '⚡', '☃'];

  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [scoreSaved, setScoreSaved] = useState(false);

  const getDifficultySettings = () => {
    return { pairs: 12, rows: 4, cols: 6 };
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
    setScoreSaved(false);
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

  const fetchLeaderboard = async () => {
    try {
      const { data } = await scores.getGameLeaderboard('memory', 10);
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setLeaderboard([]);
    }
    setLoadingLeaderboard(false);
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
    if (matchedPairs.length === pairs && gameStarted && !scoreSaved) {
      setGameWon(true);
      setGameStarted(false);

      // Save score when game is won
      if (player) {
        // For memory game, lower time is better, so we use negative time as score for sorting
        const score = Math.max(0, 1000 - timeElapsed);
        scores.saveScore(player.id, 'memory', score, moves, timeElapsed);
        setScoreSaved(true);

        // Refresh leaderboard after saving
        setTimeout(() => {
          fetchLeaderboard();
        }, 1000);
      }
    }
  }, [matchedPairs, gameStarted, player, moves, timeElapsed, scoreSaved]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const { rows, cols } = getDifficultySettings();

  const GameLeaderboard = () => (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        ⏱️ Best Times
      </h3>
      {loadingLeaderboard ? (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
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
                      {entry.moves} moves
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-purple-600">
                    {entry.time_taken ? formatTime(entry.time_taken) : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">time</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p className="text-lg">🎯</p>
              <p className="text-sm">No scores yet!</p>
              <p className="text-xs">Be the first to complete the game</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
            Memory Matching Game
          </h1>
          <p className="text-gray-600 text-lg">
            Test your memory by finding matching pairs of cards
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
                    <div className="flex justify-center">
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
                  {player && (
                    <div className="text-sm text-gray-600">Playing as: {player.name}</div>
                  )}
                  <button
                    onClick={initializeGame}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    New Game
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
                      <p>🏆 Complete as fast as possible to get on the leaderboard!</p>
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
        gameTitle="Memory Matching"
        score={Math.max(0, 1000 - timeElapsed)}
        moves={moves}
        time={formatTime(timeElapsed)}
        player={player}
        onPlayAgain={initializeGame}
        onClose={() => setGameWon(false)}
      />
    </div>
  );
};

export default MemoryMatchingGame;