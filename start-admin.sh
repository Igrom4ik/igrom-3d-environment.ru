#!/bin/bash

echo "Starting Next.js development server..."
npm run dev &
SERVER_PID=$!

echo "Opening Admin Panel (Secret Login)..."

# Small delay to allow the process to initialize
sleep 2

# Open the default browser immediately
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  # Windows (Git Bash / WSL)
  start http://localhost:3000/secret-login
elif [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  open http://localhost:3000/secret-login
else
  # Linux
  xdg-open http://localhost:3000/secret-login
fi

# Keep the script running to maintain the server process
wait $SERVER_PID
