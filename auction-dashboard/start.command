#!/bin/bash
# Double-click to start the dashboard on macOS (or run ./start.command on Linux).
# The first start installs everything (a few minutes); later starts are quick.
cd "$(dirname "$0")" || exit 1
if ! command -v python3 >/dev/null 2>&1; then
  echo "Python is not installed. Install it from https://www.python.org/downloads/ and run this file again."
  read -r -p "Press Enter to close..."
  exit 1
fi
if [ ! -f .venv/installed.ok ]; then
  echo "First start: installing, please wait..."
  python3 -m venv .venv \
    && .venv/bin/python -m pip install -r requirements.txt \
    && .venv/bin/python -m playwright install chromium \
    && touch .venv/installed.ok \
    || { echo "Installation failed - see the messages above."; read -r -p "Press Enter to close..."; exit 1; }
fi
# Skip Streamlit's one-time "Email:" question (same file Streamlit writes when you just press Enter).
if [ ! -f "$HOME/.streamlit/credentials.toml" ]; then
  mkdir -p "$HOME/.streamlit" && printf '[general]\nemail = ""\n' > "$HOME/.streamlit/credentials.toml"
fi
echo "The dashboard opens in your browser. Keep this window open while you use it."
exec .venv/bin/python -m streamlit run app.py
