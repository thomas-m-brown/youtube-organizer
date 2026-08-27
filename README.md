# YT Playlist Organizer

A YouTube-style, dark-mode web application designed to automatically scan, analyze, and reorganize your YouTube playlists into structured master categories using Google Identity Services (GIS) OAuth and the YouTube Data API v3.

## Features

- **OAuth 2.0 Integration**: Sign in securely with your Google account to manage your playlists.
- **Smart Auto-Sort**: Automatically matches, categorizes, and merges your playlists into master collections based on customizable keyword heuristics.
- **Side-by-Side Playlist Toggles**: Mark specific playlists for sorting or protect them in a safe zone (like liked songs, albums, and rare tracks) to keep them untouched.
- **Interactive Revert (Backup)**: Destructive master sorts create an automatic backup, allowing you to delete the master collections and safely restore your original video list items.
- **Appearance Modes**: Complete Dark, Light, and System Default theme integration.
- **Bulk Cleanup Tools**: Bulk clear trailing emoji suffixes or auto-generated descriptions across all your playlists in one click.
- **Playlist Management**: Create, rename, delete, and set custom cover thumbnails (either from a YouTube video URL/ID or a local image upload) via a custom in-app modal.
- **Custom Modals**: Standardized interface dialogs to prevent the browser from blocking dialog prompts.

## Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-username/yt-playlist-organizer.git
cd yt-playlist-organizer
```

### 2. Configure Environment Variables
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Open `.env` and configure your Google OAuth Client ID:
```env
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id_here
```

### 3. Install dependencies
```bash
npm install
```

### 4. Run local server
```bash
npm run dev
```

The app will start running locally at `http://localhost:5173/`.

## Technologies Used

- **Frontend**: React 19, React Router v7, Vite
- **Icons**: Lucide React
- **APIs**: YouTube Data API v3, Google Identity Services (OAuth 2.0)
- **Styling**: Vanilla CSS (CSS Variables)

## Credits
Created by **Thomas M. Brown** & **Google AntiGravity**.
