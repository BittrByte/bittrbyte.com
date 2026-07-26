#!/bin/bash

# SkyWall OS - 3D Manhattan Demo Launcher
# This script starts a local web server to run the 3D Manhattan demonstration

echo "========================================="
echo "  SKYWALL OS - 3D Manhattan Demo"
echo "========================================="
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Navigate to the script directory
cd "$SCRIPT_DIR"

echo "Starting web server..."
echo "Location: $SCRIPT_DIR"
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    PORT=8083
    echo "Server running at: http://localhost:$PORT"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "========================================="
    echo ""
    
    # Try to open browser automatically
    sleep 1
    if command -v open &> /dev/null; then
        open "http://localhost:$PORT"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:$PORT"
    fi
    
    python3 -m http.server $PORT
else
    echo "Error: Python 3 is not installed"
    echo "Please install Python 3 to run this demo"
    exit 1
fi



