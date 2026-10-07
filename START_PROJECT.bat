@echo off
title DriveEase Car Rental Full-Stack Launcher
color 0b
echo ======================================================================
echo              DriveEase Car Rental - Full-Stack Launcher
echo ======================================================================
echo.
echo [1/2] Starting Express Backend Server on http://localhost:4000 ...
start "DriveEase Backend API [Port 4000]" cmd /k "cd /d %~dp0server && npm start"
timeout /t 3 /nobreak >nul
echo.
echo [2/2] Starting React Vite Frontend Client on http://localhost:5173 ...
start "DriveEase Frontend Client [Port 5173]" cmd /k "cd /d %~dp0Client && npm run dev"
echo.
echo ======================================================================
echo Both Backend and Frontend launched in separate windows!
echo - Customer Portal: http://localhost:5173
echo - Admin Portal:    http://localhost:5173/owner/login
echo - Backend API:     http://localhost:4000
echo ======================================================================
pause
