@echo off
echo Starting dev server inside WSL Ubuntu...
echo Open http://localhost:3000 in your browser when ready.
echo.
wsl -d Ubuntu bash -lc "cd ~/Savari-King/frontend && chmod +x dev.sh && ./dev.sh"
pause
