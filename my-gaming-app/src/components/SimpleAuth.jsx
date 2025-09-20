import React, { useState } from 'react';
import { saveUserToGlobalList } from '../lib/localStorage';

const SimpleAuth = ({ onAuthSuccess }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate username
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (username.trim().length < 2) {
      setError('Username must be at least 2 characters');
      return;
    }

    if (username.trim().length > 20) {
      setError('Username must be less than 20 characters');
      return;
    }

    // Create a simple user object
    const user = {
      id: 'local_' + username.trim().toLowerCase().replace(/[^a-z0-9]/g, ''),
      username: username.trim(),
      isLocal: true
    };

    // Store username in localStorage
    localStorage.setItem('gameArcadeUser', JSON.stringify(user));
    
    // Also save to global users list for shared scoreboard
    saveUserToGlobalList(user);

    onAuthSuccess?.(user);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎮 Game Arcade
          </h1>
          <p className="text-gray-600">
            Enter your username to start playing!
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              placeholder="Enter your username"
              maxLength={20}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Your scores will be saved locally with this username
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-colors duration-200"
          >
            Start Playing 🚀
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            No registration required! Just pick a username and play.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleAuth;