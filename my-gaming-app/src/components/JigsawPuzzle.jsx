import React, {useState, useEffect } from 'react';
import { scores } from '../lib/supabase';


const JigsawPuzzle = ({ player }) => {

    const solvedState = [1,2,3,4,5,6,7,8, null];

    const [tiles, setTiles] = useState([]);
    const [moves, setMoves] = useState(0);
    const [isWon, setIsWon] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [scoreSaved, setScoreSaved] = useState(false);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);


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
        setStartTime(Date.now());
        setScoreSaved(false);

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

    const fetchLeaderboard = async () => {
        try {
            const { data } = await scores.getGameLeaderboard('jigsaw', 10);
            setLeaderboard(data || []);
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
            setLeaderboard([]);
        }
        setLoadingLeaderboard(false);
    };

    useEffect (() => {
        if (tiles.length > 0 && JSON.stringify(tiles) == JSON.stringify(solvedState)){
            setIsWon(true);

            // Save score when puzzle is solved
            if (player && !scoreSaved) {
                const timeInSeconds = Math.floor((Date.now() - startTime) / 1000);

                // Save to Supabase
                scores.saveScore(player.id, 'jigsaw', moves, moves, timeInSeconds);
                setScoreSaved(true);

                // Refresh leaderboard after saving
                setTimeout(() => {
                    fetchLeaderboard();
                }, 1000);
            }
         }
    },[tiles, player, moves, startTime, scoreSaved]);

    useEffect(() => {
        shuffleTiles();
        fetchLeaderboard();
    }, []);

const GameLeaderboard = () => (
    <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            🏆 Best Moves
        </h3>
        {loadingLeaderboard ? (
            <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
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
                                        {entry.time_taken ? `${Math.floor(entry.time_taken / 60)}:${String(entry.time_taken % 60).padStart(2, '0')}` : 'Time N/A'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-blue-600">{entry.moves}</p>
                                <p className="text-xs text-gray-500">moves</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-6 text-gray-500">
                        <p className="text-lg">🎯</p>
                        <p className="text-sm">No scores yet!</p>
                        <p className="text-xs">Be the first to complete the puzzle</p>
                    </div>
                )}
            </div>
        )}
    </div>
);

return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-7xl">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
                    3×3 Jigsaw Puzzle
                </h1>
                <p className="text-gray-600 text-lg">
                    Arrange numbers 1-8 in order by sliding tiles into the empty space
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Game Area */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                            <div className="text-center sm:text-left">
                                <span className="text-2xl font-bold text-gray-800">
                                    Moves: <span className="text-blue-600">{moves}</span>
                                </span>
                                {player && (
                                    <p className="text-sm text-gray-600 mt-1">Playing as: {player.name}</p>
                                )}
                            </div>
                            <button
                                onClick={shuffleTiles}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                New Game
                            </button>
                        </div>

                        {isWon && (
                            <div className="bg-gradient-to-r from-green-100 to-emerald-100 border border-green-400 text-green-800 px-6 py-4 rounded-xl mb-6 text-center animate-bounce">
                                <div className="text-2xl mb-2">🎉</div>
                                <div className="font-bold text-lg">Congratulations!</div>
                                <div>You solved it in {moves} moves!</div>
                                {player && <div className="text-sm mt-1">Score saved to leaderboard</div>}
                            </div>
                        )}

                        {/* Game Board */}
                        <div className="flex justify-center">
                            <div className="grid grid-cols-3 gap-3 w-80 h-80 bg-gray-100 p-4 rounded-2xl shadow-inner">
                                {tiles.map((tile, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleTileClick(index)}
                                        className={`
                                            flex items-center justify-center text-3xl font-bold rounded-xl shadow-md transition-all duration-200 cursor-pointer
                                            ${tile === null
                                                ? 'bg-gray-200 cursor-default shadow-inner'
                                                : 'bg-gradient-to-br from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700 hover:shadow-lg transform hover:scale-105 active:scale-95'
                                            }
                                        `}
                                    >
                                        {tile}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="mt-8 text-center">
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h3 className="font-semibold text-gray-800 mb-2">How to Play:</h3>
                                <p className="text-gray-600 text-sm mb-2">
                                    Click on tiles adjacent to the empty space to slide them
                                </p>
                                <p className="text-gray-600 text-sm">
                                    Goal: Arrange numbers 1-8 in order with the empty space at bottom right
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Leaderboard */}
                <div className="lg:col-span-1">
                    <GameLeaderboard />
                </div>
            </div>
        </div>
    </div>
);

}

export default JigsawPuzzle