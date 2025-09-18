@echo off
echo ================================
echo  STARTING BACKEND SERVER
echo ================================
cd /d "C:\online_booking_system\Online Booking System Project_ Step-by-Step Guide\backend"
echo Current directory: %CD%
echo.
echo Checking if Node.js is available...
node --version
echo.
echo Checking if server.js exists...
if exist server.js (
    echo ✅ server.js found
) else (
    echo ❌ server.js NOT found
    pause
    exit
)
echo.
echo Starting server...
echo Press Ctrl+C to stop the server
echo.
node server.js