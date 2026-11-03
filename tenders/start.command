#!/bin/bash
# Tenders Monitor - Mac: double-click to install everything and start the app.
cd "$(dirname "$0")" || exit 1
export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"

echo "================================================"
echo "  Tenders Monitor - installing and starting"
echo "================================================"
echo

# uv downloads Python and the libraries by itself (no admin password needed)
if ! command -v uv >/dev/null 2>&1; then
  echo "[1/2] First run: installing tools, please wait..."
  if ! curl -LsSf https://astral.sh/uv/install.sh | sh; then
    echo
    echo "Installation failed. Check the internet connection and try again."
    read -r -p "Press Enter to close..."
    exit 1
  fi
  export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"
fi
echo "[1/2] Tools ready."

echo "[2/2] Starting... the browser will open by itself (first time takes 1-2 min)."
echo "Keep this window open while you use the app. Close it to stop."
echo
uv run --no-project --python 3.12 \
  --with streamlit --with requests --with pandas --with beautifulsoup4 --with openpyxl \
  streamlit run app.py --browser.gatherUsageStats false

read -r -p "Press Enter to close..."
