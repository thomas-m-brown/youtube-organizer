# YT Playlist Organizer: Idempotent Playlist Management & Quota Guard

![React](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61dafb?style=flat-square&logo=react&logoColor=black)
![Electron](https://img.shields.io/badge/desktop-Electron-47848F?style=flat-square&logo=electron&logoColor=white)
![Google Cloud](https://img.shields.io/badge/auth-Google%20OAuth%202.0%20PKCE-4285F4?style=flat-square&logo=google&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

A production-grade desktop application engineered for non-destructive, batch playlist reorganization using the YouTube Data API v3 and Google Identity Services (GIS) OAuth 2.0. Built to solve library fragmentation and categorization without risking data loss.

---

## Screenshots

| Dashboard (Plan Preview) | Backup History (Revert Logs) |
|:---:|:---:|
| ![Dashboard Preview](src/assets/dashboard_preview.png) | ![Backup History Preview](src/assets/history_preview.png) |

| Appearance & General Settings |
|:---:|
| ![Settings Preview](src/assets/settings_preview.png) |

---

## Systems Architecture & Data Safety

```mermaid
flowchart LR
    User[User Rule Selection] --> Filter[Safe-Zone Isolation Filter]
    Filter --> Diff[State Diff Generator]
    Diff --> Backup[Transactional JSON Snapshot]
    Backup --> Batch[Batch API Quota Guard]
    Batch --> YouTube[YouTube Data API v3 Engine]
    YouTube -.-> Rollback[Atomic Rollback Engine]
```

1. **Transactional Rollback Engine**:
   - Destructive operations (merges, deletes, bulk reorganization) generate pre-execution state snapshots.
   - If an API error occurs mid-batch or a user reverts, the local rollback engine references historical JSON logs to restore original playlist compositions and video ordering.
2. **Strict Quota Conservation**:
   - YouTube Data API v3 enforces a default quota limit of 10,000 units/day.
   - Operations are batched, validated client-side, and cached locally to eliminate redundant network roundtrips and avoid quota depletion.
3. **Protected Safe Zones**:
   - High-value collections (Liked Videos, user-flagged rare archives, curated albums) are quarantined behind read-only protections to prevent accidental mutation during bulk operations.
4. **OAuth 2.0 PKCE Authentication**:
   - Implements modern Google Identity Services (GIS) token flows without persistent backend secret storage, ensuring client-side security.

---

## Features

- **Smart Auto-Sort**: Automatically matches, categorizes, and merges playlists into master collections using configurable keyword heuristics.
- **Side-by-Side Playlist Toggles**: Granular per-playlist controls to include in active batches or protect in isolated safe zones.
- **Bulk Cleanup Tools**: Strip trailing emoji suffixes, automated metadata tags, and boilerplate descriptions in a single batch pass.
- **Full Metadata Management**: In-app dialogs for renaming, deleting, and updating custom playlist cover thumbnails via YouTube URLs or local image uploads.
- **Cross-Platform Themes**: Complete dark, light, and system-adaptive UI themes.

---

## Setup & Installation

### 1. Clone & Install
```bash
git clone https://github.com/thomas-m-brown/youtube-organizer.git
cd youtube-organizer
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Provide your Google OAuth Client ID in `.env`:
```env
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id_here
```

### 3. Google OAuth Setup
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the **YouTube Data API v3**.
3. Under **OAuth consent screen**, add the scopes:
   - `.../auth/youtube`
   - `.../auth/youtube.force-ssl`
4. Under **Credentials**, create an **OAuth 2.0 Client ID** (Web application).
   - Set **Authorized JavaScript Origins** to `http://localhost:5173`.
   - Set **Authorized Redirect URIs** to `http://localhost:5173`.
5. Save the generated Client ID in your local `.env`.

### 4. Run Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:5173/`.

---

## Desktop Packaging (Electron)

### Development Desktop Window
```bash
npm run electron:start
```

### Package Installers (.exe / .app)
* **Windows (`.exe`)**:
  ```bash
  npm run electron:build:win
  ```
* **macOS (`.app` / `.dmg`)**:
  ```bash
  npm run electron:build:mac
  ```
Installers will be generated in the `/release` directory.

---

## Technologies Used

- **Desktop Framework**: Electron
- **Frontend Core**: React 19, React Router v7, Vite
- **Icons**: Lucide React
- **APIs**: YouTube Data API v3, Google Identity Services (GIS OAuth 2.0)
- **Styling**: Vanilla CSS with structured design tokens

---

## License

MIT
