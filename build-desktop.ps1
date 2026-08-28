Write-Host "Starting Custom YT Playlist Organizer Desktop Build..." -ForegroundColor Green

# 1. Run Vite build
Write-Host "1. Building React web assets..." -ForegroundColor Cyan
npm run build

# 2. Setup release directory
$ReleaseDir = "C:\Users\tommb\youtube-organizer\release\YT-Playlist-Organizer-win32-x64"
if (Test-Path $ReleaseDir) {
    Remove-Item -Recurse -Force $ReleaseDir
}
New-Item -ItemType Directory -Path $ReleaseDir -Force

# 3. Extract Electron template
Write-Host "2. Extracting Electron runtime..." -ForegroundColor Cyan
$ZipPath = "C:\Users\tommb\AppData\Local\electron\Cache\c94f2fc32e1fb05767f75322ea533eeb9828155f017ec184140930a3ec825e81\electron-v31.7.7-win32-x64.zip"
Expand-Archive -Path $ZipPath -DestinationPath $ReleaseDir -Force

# 4. Create resources/app folder
Write-Host "3. Packaging application files..." -ForegroundColor Cyan
$AppDir = Join-Path $ReleaseDir "resources\app"
New-Item -ItemType Directory -Path $AppDir -Force

# Copy files
Copy-Item -Recurse -Force "dist" $AppDir
Copy-Item -Recurse -Force "electron" $AppDir
Copy-Item "package.json" $AppDir

# 5. Rename executable
Write-Host "4. Renaming executable..." -ForegroundColor Cyan
Rename-Item -Path (Join-Path $ReleaseDir "electron.exe") -NewName "YT-Playlist-Organizer.exe" -Force

Write-Host "SUCCESS! Standalone desktop app built in: $ReleaseDir" -ForegroundColor Green
Write-Host "To run, double-click YT-Playlist-Organizer.exe inside that folder!" -ForegroundColor Green
