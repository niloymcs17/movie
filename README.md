# CineWave - Movie Explorer Dashboard

A modern movie discovery app built with React, TypeScript, and Vite. Browse thousands of movies with advanced filtering, search, and infinite scroll.

## Installation & Setup

**Prerequisites:** Node.js (v14 or higher)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file** in the root directory:
   ```bash
   VITE_TMDB_API_KEY=your_tmdb_api_key_here
   ```
   Get your API key from [TMDB Settings](https://www.themoviedb.org/settings/api)

3. **Run the app:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

### Search Movies
- Type in the search bar to automatically search for movies (300ms debounce)
- Search triggers automatically as you type - no need to press Enter
- Search results can be filtered by year

### Filter Options
- **Sort By:** Choose how movies are sorted (Most Popular, Newest First, Highest Rated)
- **Genre:** Filter by movie genre (disabled during search)
- **Year:** Filter by release year
- **Min Rating:** Set minimum rating threshold (disabled during search)

### Browse Movies
- Scroll down to automatically load more movies (infinite scroll)
- Click on any movie card to view detailed information
- View related/recommended movies in the details modal

### Reset Filters
- Click the logo or clear button (X) in the search bar to reset everything