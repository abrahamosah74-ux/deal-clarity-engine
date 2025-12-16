@echo off
REM Deal Clarity Engine - Portable Web Server
REM This starts a local web server to run the Deal Clarity Engine

cd /d "%~dp0"

echo Starting Deal Clarity Engine...
echo.
echo Opening app at http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

REM Check if Python is available (for simple HTTP server)
where python >nul 2>nul
if %ERRORLEVEL% == 0 (
    cd build
    python -m http.server 3000
) else (
    REM Fallback: Use Node.js http-server if available
    where npx >nul 2>nul
    if %ERRORLEVEL% == 0 (
        cd build
        npx http-server -p 3000
    ) else (
        echo Error: Neither Python nor Node.js found
        echo Please install Python or Node.js to run this app
        pause
        exit /b 1
    )
)
