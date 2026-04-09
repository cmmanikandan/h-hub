@echo off
setlocal
set "ROOT=%~dp0"
cd /d "%ROOT%"

echo ==========================================
echo   H-Hub SQL Backend Starter
echo ==========================================
echo.
echo Database Configuration:
echo -----------------------
echo To use MySQL, update 'server/.env' and set:
echo DB_DIALECT=mysql
echo DB_HOST=localhost
echo DB_NAME=hub_db
echo DB_USER=root
echo DB_PASS=CMMANI02
echo.
echo Current backend is using SQLite (default) for zero-config startup.
echo.

if not exist "server\package.json" (
	echo ERROR: server\package.json not found.
	echo Run this script from the project root folder.
	pause
	exit /b 1
)

echo Setting up dependencies...
cd /d "%ROOT%server"
call npm install
echo.
echo Starting H-Hub API Server on http://localhost:5000...
echo.
npm start
PAUSE
