import React, { useState } from 'react';

const PlayerEntry = ({ onPlayerJoin }) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (name.trim().length > 20) {
      setError('Name must be less than 20 characters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onPlayerJoin(name.trim());
    } catch (err) {
      setError('Failed to join. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎮</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome to Game Arcade!
            </h1>
            <p className="text-gray-600">
              Enter your name to start playing
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-lg font-semibold text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                disabled={isLoading}
                autoFocus
              />
              {error && (
                <p className="mt-2 text-red-600 text-sm">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xl font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                  Joining...
                </div>
              ) : (
                'Join Arcade'
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 text-center">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-600 text-sm">
                🎯 Play three exciting games<br/>
                🏆 Compete for high scores<br/>
                💾 Your progress is automatically saved
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerEntry;