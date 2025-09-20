import React, { useState, useEffect } from 'react';

const MemoryMatchingGame = () => {
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
    }
  }, [matchedPairs, difficulty, gameStarted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const { rows, cols } = getDifficultySettings();

  return (
    <div className="flex flex-col items-center p-8 bg-gradient-to-br from-purple-50 to-pink-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Memory Matching Game
        </h1>
        
        {!gameStarted && !gameWon && (
          <div className="text-center mb-6">
            <div className="mb-4">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Choose Difficulty:
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="easy">Easy (3×4)</option>
                <option value="medium">Medium (4×4)</option>
                <option value="hard">Hard (4×6)</option>
              </select>
            </div>
            <button
              onClick={initializeGame}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium text-lg"
            >
              Start Game
            </button>
          </div>
        )}

        {gameStarted && (
          <div className="flex justify-between items-center mb-6">
            <div className="text-lg font-semibold text-gray-600">
              Moves: <span className="text-purple-600">{moves}</span>
            </div>
            <div className="text-lg font-semibold text-gray-600">
              Time: <span className="text-purple-600">{formatTime(timeElapsed)}</span>
            </div>
            <button
              onClick={initializeGame}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200"
            >
              New Game
            </button>
          </div>
        )}

        {gameWon && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg mb-6 text-center animate-bounce">
            <h2 className="text-xl font-bold">Congratulations!</h2>
            <p>You completed the game in {moves} moves and {formatTime(timeElapsed)}!</p>
            <button
              onClick={initializeGame}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              Play Again
            </button>
          </div>
        )}

        {cards.length > 0 && (
          <div 
            className={`grid gap-3 mx-auto justify-center`}
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
              maxWidth: `${cols * 80 + (cols - 1) * 12}px`
            }}
          >
            {cards.map((card) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`
                  w-20 h-20 flex items-center justify-center text-2xl font-bold rounded-lg shadow-md transition-all duration-300 cursor-pointer transform hover:scale-105
                  ${card.isFlipped || card.isMatched
                    ? 'bg-gradient-to-br from-purple-400 to-purple-600 text-white rotate-0'
                    : 'bg-gradient-to-br from-gray-200 to-gray-400 text-gray-400 hover:from-gray-300 hover:to-gray-500'
                  }
                  ${card.isMatched ? 'ring-4 ring-green-400' : ''}
                `}
              >
                {card.isFlipped || card.isMatched ? card.symbol : '?'}
              </div>
            ))}
          </div>
        )}

        {!gameStarted && !gameWon && cards.length === 0 && (
          <div className="text-center text-gray-600 mt-8">
            <p className="text-lg">Welcome to Memory Matching Game!</p>
            <p className="mt-2">Choose your difficulty level and start playing.</p>
            <p className="mt-2">Find all matching pairs by flipping two cards at a time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryMatchingGame;