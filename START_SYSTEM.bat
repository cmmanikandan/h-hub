@echo off
setlocal
set "ROOT=%~dp0"
cd /d "%ROOT%"

TITLE H-Hub Project Starter
echo ===================================================
echo             H-HUB SYSTEM STARTUP
echo ===================================================
echo.

if not exist "server\package.json" (
	echo ERROR: server\package.json not found.
	pause
	exit /b 1
)

if not exist "package.json" (
	echo ERROR: frontend package.json not found.
	pause
	exit /b 1
)

echo Installing backend dependencies...
cd /d "%ROOT%server"
call npm install

echo Installing frontend dependencies...
cd /d "%ROOT%"
call npm install

echo.
echo [1/2] Starting Backend Server (Port 5000)...
start "H-Hub Backend" cmd /k "cd /d "%ROOT%server" && npm start"

echo [2/2] Starting Frontend Website (Port 5173 or next available)...
start "H-Hub Frontend" cmd /k "cd /d "%ROOT%" && npm run dev"

echo.
echo ===================================================
echo   SYSTEMS ARE STARTING...
echo.
echo   - Backend:  http://localhost:5000
echo   - Frontend: http://localhost:5173 (or 5174+ if busy)
echo.
echo   Close this window after both terminals are open.
echo ===================================================
echo.
PAUSE
