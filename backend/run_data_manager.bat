@echo off
echo ========================================
echo   Data Manager - Online Booking System
echo ========================================
echo.

if "%1"=="" (
    echo Usage: run_data_manager.bat [action] [options]
    echo.
    echo Actions:
    echo   setup     - Complete database setup
    echo   clear     - Clear all data
    echo   generate  - Generate data
    echo   add-sample- Add sample bookings
    echo   stats     - Show statistics
    echo   help      - Show help
    echo.
    echo Examples:
    echo   run_data_manager.bat setup
    echo   run_data_manager.bat generate flights 7
    echo   run_data_manager.bat stats
    echo.
    pause
    exit /b 0
)

set action=%1
set type=%2
set days=%3

echo Running: node data_manager.js --action=%action%
if not "%type%"=="" (
    echo With type: %type%
)
if not "%days%"=="" (
    echo With days: %days%
)
echo.

if "%action%"=="setup" (
    node data_manager.js --action=setup
) else if "%action%"=="clear" (
    node data_manager.js --action=clear
) else if "%action%"=="generate" (
    if "%type%"=="" (
        node data_manager.js --action=generate
    ) else if "%days%"=="" (
        node data_manager.js --action=generate --type=%type%
    ) else (
        node data_manager.js --action=generate --type=%type% --days=%days%
    )
) else if "%action%"=="add-sample" (
    if "%type%"=="" (
        node data_manager.js --action=add-sample
    ) else (
        node data_manager.js --action=add-sample --count=%type%
    )
) else if "%action%"=="stats" (
    node data_manager.js --action=stats
) else if "%action%"=="help" (
    node data_manager.js --action=help
) else (
    echo ERROR: Unknown action '%action%'
    echo Run 'run_data_manager.bat help' for usage information
)

echo.
pause

