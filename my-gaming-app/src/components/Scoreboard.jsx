import React, { useState, useEffect } from 'react';
import { database, supabase } from '../lib/supabase';
import { getLocalLeaderboard, getLocalUserBestScores } from '../lib/localStorage';

const Scoreboard = ({ user, setCurrentPage }) => {
  const [activeTab, setActiveTab] = useState('jigsaw');
  const [leaderboard, setLeaderboard] = useState([]);
  const [userScores, setUserScores] = useState([]);
  const [loading, setLoading] = useState(true);

  const gameTypes = {
    jigsaw: { name: 'Jigsaw Puzzle', icon: '🧩' },
    memory: { name: 'Memory Matching', icon: '🧠' },
    color: { name: 'Color Rush', icon: '🌈' }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (supabase) {
        // Use Supabase for data if configured
        const { data: leaderData } = await database.getLeaderboard(activeTab, 10);
        setLeaderboard(leaderData || []);

        if (user) {
          const { data: userScoreData } = await database.getUserBestScores(user.id);
          const filteredUserScores = userScoreData?.filter(score => score.game_type === activeTab) || [];
          setUserScores(filteredUserScores);
        }
      } else {
        // Use local storage for data
        const { data: leaderData } = getLocalLeaderboard(activeTab, 10);
        setLeaderboard(leaderData || []);

        if (user) {
          const { data: userScoreData } = getLocalUserBestScores(user.id);
          const filteredUserScores = userScoreData?.filter(score => score.game_type === activeTab) || [];
          setUserScores(filteredUserScores);
        }
      }
    } catch (error) {
      console.error('Error fetching scoreboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreDisplay = (score, gameType, moves, timeTaken) => {
    switch (gameType) {
      case 'jigsaw':
        return (
          <div>
            <div className="font-bold">{moves || 0} moves</div>
            <div className="text-sm text-gray-500">{formatTime(timeTaken)}</div>
          </div>
        );
      case 'memory':
        return (
          <div>
            <div className="font-bold">{score} points</div>
            <div className="text-sm text-gray-500">{formatTime(timeTaken)}</div>
          </div>
        );
      case 'color':
        return (
          <div>
            <div className="font-bold">{score} colors</div>
            <div className="text-sm text-gray-500">90 seconds</div>
          </div>
        );
      default:
        return score;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage('home')}
              className="bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-2"
            >
              ← Back to Arcade
            </button>
            <h1 className="text-4xl font-bold text-gray-800">🏆 Scoreboard</h1>
          </div>
          {user && (
            <div className="bg-white rounded-lg shadow-lg px-4 py-2">
              <div className="text-sm text-gray-600">Currently signed in as:</div>
              <div className="font-bold text-purple-600">
                {user.isLocal ? user.username : (user.user_metadata?.display_name || user.email)}
              </div>
            </div>
          )}
        </div>

        {/* Game Type Tabs */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex space-x-1 mb-6">
            {Object.entries(gameTypes).map(([key, game]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors duration-200 ${
                  activeTab === key
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {game.icon} {game.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-2 text-gray-600">Loading scores...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Global Leaderboard */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">🌍 Global Leaderboard</h3>
                <div className="space-y-3">
                  {leaderboard.length > 0 ? (
                    leaderboard.map((entry, index) => (
                      <div
                        key={entry.id}
                        className={`flex items-center justify-between p-4 rounded-lg ${
                          index === 0 ? 'bg-yellow-100 border-2 border-yellow-300' :
                          index === 1 ? 'bg-gray-100 border-2 border-gray-300' :
                          index === 2 ? 'bg-orange-100 border-2 border-orange-300' :
                          'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-500 text-white' :
                            index === 2 ? 'bg-orange-500 text-white' :
                            'bg-purple-500 text-white'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold">
                              {entry.profiles?.display_name || 'Anonymous'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(entry.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {getScoreDisplay(entry.score, entry.game_type, entry.moves, entry.time_taken)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No scores yet. Be the first to play!
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Best */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">🎯 Your Best Scores</h3>
                {user ? (
                  <div className="space-y-3">
                    {userScores.length > 0 ? (
                      userScores.slice(0, 5).map((score, index) => (
                        <div
                          key={score.id}
                          className="flex items-center justify-between p-4 bg-blue-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-semibold">Game #{index + 1}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(score.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {getScoreDisplay(score.score, score.game_type, score.moves, score.time_taken)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Play some games to see your scores here!
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Sign in to track your personal scores
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scoreboard;