const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');

let server;
let mainWindow;
const distDir = path.resolve(__dirname, '../dist');

// Simple built-in HTTP server to host the dist/ folder on localhost
// to bypass Google OAuth restrictions on file:// protocols
function startLocalServer() {
  server = http.createServer((req, res) => {
    // Clean request path and prevent path traversal
    let safeUrlPath = path.normalize(req.url.split('?')[0]).replace(/^(\.\.[\/\\])+/, '');
    let filePath = path.join(distDir, safeUrlPath);
    if (!filePath.startsWith(distDir)) {
      res.writeHead(403);
      return res.end("Forbidden");
    }

    if (filePath === distDir || filePath === path.join(distDir, '/')) {
      filePath = path.join(distDir, 'index.html');
    }

    // Serve files with correct mime types
    fs.readFile(filePath, (err, data) => {
      if (err) {
        // Fallback to index.html for React Router compatibility
        fs.readFile(path.join(distDir, 'index.html'), (errHtml, htmlData) => {
          if (errHtml) {
            res.writeHead(404);
            res.end("Not Found");
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(htmlData);
          }
        });
      } else {
        let ext = path.extname(filePath);
        let mimeType = 'text/plain';
        if (ext === '.html') mimeType = 'text/html';
        else if (ext === '.css') mimeType = 'text/css';
        else if (ext === '.js') mimeType = 'text/javascript';
        else if (ext === '.svg') mimeType = 'image/svg+xml';
        else if (ext === '.png') mimeType = 'image/png';
        
        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(data);
      }
    });
  });

  // Bind to localhost port 5173 (which matches Google OAuth Authorized Origin)
  server.listen(5173, '127.0.0.1');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "YouTube Playlist Organizer",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Route external URLs to default system browser and deny internal Electron window opening
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    try {
      const parsedUrl = new URL(navigationUrl);
      if (parsedUrl.origin !== 'http://127.0.0.1:5173' && parsedUrl.origin !== 'http://localhost:5173') {
        event.preventDefault();
        shell.openExternal(navigationUrl);
      }
    } catch {
      event.preventDefault();
    }
  });

  mainWindow.loadURL('http://127.0.0.1:5173');
  
  // Remove default menu bar
  mainWindow.setMenuBarVisibility(false);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  startLocalServer();
  createWindow();
});

app.on('window-all-closed', () => {
  if (server) server.close();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
