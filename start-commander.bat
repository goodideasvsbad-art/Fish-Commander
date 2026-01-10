@echo off
echo.
echo ============================================
echo   Starting Commander Desktop + Fish Backend
echo ============================================
echo.
echo This will open TWO windows:
echo   1. Fish Backend (port 5055)
echo   2. Commander Frontend (port 3000)
echo.
echo Keep both windows open!
echo.
echo ============================================
echo.

REM Start backend in new window
start "Fish Backend" cmd /k "cd /d C:\Users\andy\Desktop\The~Fish && python file_relay.py"

timeout /t 3 /nobreak >nul

REM Start frontend in new window
start "Commander Frontend" cmd /k "cd /d C:\Users\andy\Desktop\commander-desktop && npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo ============================================
echo   Commander Desktop Starting...
echo ============================================
echo.
echo Backend:  http://localhost:5055
echo Frontend: http://localhost:3000
echo.
echo Opening browser in 5 seconds...
echo.
timeout /t 5 /nobreak >nul

start http://localhost:3000

echo.
echo All systems running!
echo Close this window when you're done.
echo.
pause
