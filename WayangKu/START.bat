@echo off
echo ========================================
echo  WayangKu - Virtual Dalang
echo ========================================
echo.
echo Killing old Python processes...
taskkill /F /IM python.exe 2>nul

echo.
echo Starting server on port 8000...
cd /d D:\WayangKu
start /B python -m http.server 8000

echo.
echo Waiting for server...
timeout /t 3 /nobreak >nul

echo.
echo Opening browser...
start "" "http://localhost:8000/"

echo.
echo ========================================
echo  Server running on http://localhost:8000
echo  Press Ctrl+C to stop
echo ========================================
echo.
pause
