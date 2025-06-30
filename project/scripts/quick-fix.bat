@echo off
setlocal

echo.
echo ==================================================
echo            SecuriComm Quick-Fix Script
echo ==================================================
echo.

rem --- Kill Process on Port 8081 ---
echo [1/6] Killing process on port 8081...
npx kill-port 8081 >nul 2>&1
if %errorlevel% neq 0 (
    echo    No process found on port 8081.
) else (
    echo    Process on port 8081 killed successfully.
)

rem --- Clear Caches ---
echo [2/6] Clearing npm and Expo caches...
npm cache clean --force >nul 2>&1
npx expo start --clear >nul 2>&1
echo    Caches cleared.

rem --- Remove Old Dependencies ---
echo [3/6] Removing old dependencies...
if exist node_modules ( rd /s /q node_modules )
if exist package-lock.json ( del /q package-lock.json )
echo    Old dependencies removed.

rem --- Install Dependencies ---
echo [4/6] Installing dependencies...
npm install >nul 2>&1
if %errorlevel% neq 0 (
    echo    Error: npm install failed. Please check your network connection and try again.
    exit /b 1
) else (
    echo    Dependencies installed successfully.
)

rem --- Create .env File ---
echo [5/6] Checking for .env file...
if not exist .env (
    echo    .env file not found. Creating from .env.example...
    copy .env.example .env >nul 2>&1
) else (
    echo    .env file already exists.
)

rem --- Start Development Server ---
echo [6/6] Starting Expo development server...
echo    You can close this window when you are finished.
start "Expo Dev Server" npx expo start --web --port 8081

echo.
echo ==================================================
echo    Development environment is ready!
echo    Access your application at http://localhost:8081
echo ==================================================
echo.
