#!/bin/bash

# Skywall OS Ecosystem Visualization Demo
# Simple HTTP server launcher

PORT=8003

echo "Starting Skywall OS Ecosystem Demo..."
echo "Opening http://localhost:$PORT in your browser..."
echo "Press Ctrl+C to stop the server"
echo ""

# Try python3 first, then python, then python2
if command -v python3 &> /dev/null; then
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    python -m http.server $PORT
else
    echo "Error: Python is not installed or not in PATH"
    exit 1
fi

