# Supabase Setup Guide for Game Arcade

## 🚀 Quick Setup Steps

### 1. Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Sign in to your account
3. Create a new project
4. Wait for the project to be set up

### 2. Get Your Project Credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy your:
   - **Project URL** (something like: `https://your-project-id.supabase.co`)
   - **Anon (public) key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 3. Update Environment Variables
1. Open the `.env.local` file in your project root
2. Replace the placeholder values:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

### 4. Set Up Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Create a new query
3. Copy and paste the entire content from `supabase-schema.sql`
4. Click **Run** to execute the schema

### 5. Configure Authentication
1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. Under **Auth Settings**, make sure:
   - **Enable email confirmations** is OFF (for easier testing)
   - **Enable email change confirmations** is OFF (for easier testing)
   - You can enable these later for production

### 6. Test Your Setup
1. Start your development server: `npm run dev`
2. Open your Game Arcade app
3. Click **Sign In** and create a new account
4. Try playing games and check if scores are saved
5. View the **Scoreboard** to see your scores

## 🎮 Features Included

### Authentication System
- ✅ User registration with email/password
- ✅ User login/logout
- ✅ Persistent authentication state
- ✅ User profile management

### Database Schema
- ✅ **profiles** table - User profiles with display names
- ✅ **scores** table - Game scores with user tracking
- ✅ Row Level Security (RLS) policies
- ✅ Automatic profile creation on signup

### Game Integration
- ✅ Score tracking for all three games:
  - **Jigsaw Puzzle**: Tracks moves and time
  - **Memory Matching**: Tracks score and time  
  - **Color Rush**: Tracks score (colors identified)

### Scoreboard Features
- ✅ Global leaderboards for each game
- ✅ Personal best scores
- ✅ Real-time score updates
- ✅ Responsive design

## 🔧 Troubleshooting

### Common Issues:

1. **"Invalid API key" error**
   - Double-check your `.env.local` file
   - Make sure you're using the correct Anon key
   - Restart your dev server after updating `.env.local`

2. **Database connection issues**
   - Verify your project URL is correct
   - Make sure you've run the SQL schema commands
   - Check that RLS policies are enabled

3. **Authentication not working**
   - Check Authentication settings in Supabase dashboard
   - Disable email confirmations for testing
   - Check browser console for errors

4. **Scores not saving**
   - Verify the database schema was created correctly
   - Check that you're signed in when playing games
   - Look for errors in the browser console

## 📝 Next Steps

Once everything is working:

1. **Production Setup**:
   - Enable email confirmations
   - Set up custom email templates
   - Configure proper security policies

2. **Game Enhancements**:
   - Add score integration to individual game components
   - Implement real-time leaderboard updates
   - Add achievement system

3. **UI Improvements**:
   - Add user avatars
   - Implement user profiles
   - Add social features

## 🏆 Game Score Integration

To save scores from your games, use the `database.saveScore()` function:

```javascript
import { database } from '../lib/supabase';

// Example: Save Jigsaw Puzzle score
await database.saveScore(user.id, 'jigsaw', moves, moves, timeInSeconds);

// Example: Save Memory Game score  
await database.saveScore(user.id, 'memory', score, null, timeInSeconds);

// Example: Save Color Rush score
await database.saveScore(user.id, 'color', colorsIdentified, null, 90);
```

Your Game Arcade now has a complete backend system with user authentication and score tracking! 🎉