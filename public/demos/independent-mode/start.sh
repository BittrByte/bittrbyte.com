#!/bin/bash

# Start script for Skywall OS - Independent Mode Demo
# This script launches a local web server to view the independent mode demo

PORT=8003

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        SKYWALL OS - Independent Mode Demo                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Starting local web server on port $PORT..."
echo ""

# Check if port is already in use
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port $PORT is already in use."
    echo "   Please stop the other service or change the PORT variable in this script."
    exit 1
fi

# Start Python's built-in HTTP server
if command -v python3 &> /dev/null; then
    echo "✓ Server running at: http://localhost:$PORT"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    echo "✓ Server running at: http://localhost:$PORT"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python -m http.server $PORT
else
    echo "❌ Error: Python is not installed."
    echo "   Please install Python 3 to run this demo."
    exit 1
fi










