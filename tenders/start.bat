@echo off
title Tenders Monitor
cd /d "%~dp0"

echo ================================================
echo   Tenders Monitor - installing and starting
echo ================================================
echo.

rem --- 1. Find Python ---
set "PY="
py -3 -c "import sys" >nul 2>nul && set "PY=py -3"
if not defined PY (python -c "import sys" >nul 2>nul && set "PY=python")

if not defined PY (
    echo [1/3] Python not found - installing it now, please wait...
    winget install -e --id Python.Python.3.12 --scope user --accept-source-agreements --accept-package-agreements
    if errorlevel 1 (
        echo.
        echo Could not install Python automatically.
        echo Please install it from https://www.python.org/downloads/
        echo and tick "Add Python to PATH". Then double-click this file again.
        start https://www.python.org/downloads/
        pause
        exit /b 1
    )
    echo.
    echo Python installed. CLOSE this window and double-click start.bat again.
    pause
    exit /b 0
)
echo [1/3] Python found.

rem --- 2. Install libraries (fast if already installed) ---
echo [2/3] Installing libraries...
%PY% -m pip install --quiet --disable-pip-version-check streamlit requests pandas beautifulsoup4 openpyxl
if errorlevel 1 (
    echo Library installation failed. Check the internet connection and try again.
    pause
    exit /b 1
)

rem --- 3. Start the app ---
echo [3/3] Starting... the browser will open by itself.
echo Keep this window open while you use the app. Close it to stop.
echo.
%PY% -m streamlit run app.py --browser.gatherUsageStats false
pause
