import React, {useState, useEffect } from 'react';


const JigsawPuzzle = () => {

    const solvedState = [1,2,3,4,5,6,7,8, null];

    const [tiles, setTiles] = useState([]);
    const [moves, setMoves] = useState(0);
    const [isWon, setIsWon] = useState(false);


    const shuffleTiles = () => {
        let shuffled = [...solvedState];

        for (let i = 0; i < 200 ; i++ ){
            const emptyIndex = shuffled.indexOf(null);
            const possibleMoves = getValidMoves(emptyIndex);
            const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            [shuffled[emptyIndex], shuffled[randomMove]] = [shuffled[randomMove],shuffled[emptyIndex]];
        }

        setTiles(shuffled);
        setMoves(0);
        setIsWon(false);

    };

    const getValidMoves = (emptyIndex) => {
       const moves = [];
       const row = Math.floor(emptyIndex / 3);
       const col = emptyIndex % 3;


       if (row > 0) moves.push(emptyIndex - 3);
       if (row < 2) moves.push(emptyIndex + 3);
       if (col > 0) moves.push(emptyIndex - 1);
       if (col < 2) moves.push(emptyIndex + 1);

       return moves;
    };
    
    const handleTileClick = (index) => {
        if (isWon) return;

        const emptyIndex = tiles.indexOf(null);
        const validMoves = getValidMoves(emptyIndex);

        if (validMoves.includes(index)){
            const newTiles = [...tiles];
            [newTiles[emptyIndex], newTiles[index]] = [newTiles[index], newTiles[emptyIndex]];
            setTiles(newTiles)
            setMoves(moves + 1); 
        }
    };

    useEffect (() => {
        if (tiles.length > 0 && JSON.stringify(tiles) == JSON.stringify(solvedState)){
            setIsWon(true);            
         }
    },[tiles]);

    useEffect(() => {
        shuffleTiles();
    }, []);

return (
    <div className="flex flex-col items-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          3×3 Jigsaw Puzzle
        </h1>
        
        <div className="text-center mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-gray-600">
              Moves: <span className="text-blue-600">{moves}</span>
            </span>
            <button
              onClick={shuffleTiles}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors duration-200 font-medium"
            >
              New Game
            </button>
          </div>
          
          {isWon && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 animate-bounce">
              🎉 Congratulations! You solved it in {moves} moves!
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 w-64 h-64 mx-auto bg-gray-200 p-4 rounded-xl shadow-inner">
          {tiles.map((tile, index) => (
            <div
              key={index}
              onClick={() => handleTileClick(index)}
              className={`
                flex items-center justify-center text-2xl font-bold rounded-lg shadow-md transition-all duration-200 cursor-pointer
                ${tile === null 
                  ? 'bg-gray-200 cursor-default' 
                  : 'bg-gradient-to-br from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700 hover:shadow-lg transform hover:scale-105'
                }
              `}
            >
              {tile}
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-gray-600">
          <p className="text-sm">
            Click on tiles adjacent to the empty space to move them.
          </p>
          <p className="text-sm mt-2">
            Goal: Arrange numbers 1-8 in order with empty space at bottom right.
          </p>
        </div>
      </div>
    </div>
);

} 

export default JigsawPuzzle