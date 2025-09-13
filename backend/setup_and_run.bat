@echo off
echo ========================================
echo   Online Booking System - Setup & Run
echo ========================================
echo.

echo [1/6] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js is installed

echo.
echo [2/6] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed

echo.
echo [3/6] Setting up environment configuration...
if not exist .env (
    copy env.example .env >nul
    echo ✓ Environment file created
) else (
    echo ✓ Environment file already exists
)

echo.
echo [4/6] Starting MongoDB service...
net start MongoDB >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Could not start MongoDB service
    echo Please ensure MongoDB is installed and running
    echo You can start it manually with: net start MongoDB
    echo.
    set /p continue="Continue anyway? (y/n): "
    if /i not "%continue%"=="y" (
        exit /b 1
    )
) else (
    echo ✓ MongoDB service started
)

echo.
echo [5/6] Setting up database with sample data...
node data_manager.js --action=setup
if %errorlevel% neq 0 (
    echo ERROR: Database setup failed
    pause
    exit /b 1
)
echo ✓ Database setup completed

echo.
echo [6/6] Starting the backend server...
echo.
echo ========================================
echo   Server is starting...
echo   Backend API: http://localhost:3000
echo   Frontend: http://localhost:8000
echo   Admin Panel: http://localhost:8000/pages/admin/login.html
echo   Admin Login: admin@travelease.com / admin123
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

node server.js

