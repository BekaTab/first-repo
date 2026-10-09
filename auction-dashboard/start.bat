@echo off
rem Double-click to start the dashboard on Windows.
rem The first start installs everything (a few minutes); later starts are quick.
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
  echo Python is not installed. Install it from https://www.python.org/downloads/
  echo and tick "Add python.exe to PATH" during installation, then run this file again.
  pause
  exit /b 1
)
if not exist ".venv\installed.ok" (
  echo First start: installing, please wait...
  python -m venv .venv || goto :fail
  ".venv\Scripts\python.exe" -m pip install -r requirements.txt || goto :fail
  ".venv\Scripts\python.exe" -m playwright install chromium || goto :fail
  echo ok> ".venv\installed.ok"
)
rem Skip Streamlit's one-time "Email:" question (same file Streamlit writes when you just press Enter).
if not exist "%USERPROFILE%\.streamlit\credentials.toml" (
  mkdir "%USERPROFILE%\.streamlit" 2>nul
  (echo [general]& echo email = "")> "%USERPROFILE%\.streamlit\credentials.toml"
)
echo The dashboard opens in your browser. Keep this window open while you use it.
".venv\Scripts\python.exe" -m streamlit run app.py
pause
exit /b 0
:fail
echo Installation failed - see the messages above.
pause
exit /b 1
