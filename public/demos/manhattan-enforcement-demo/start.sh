#!/bin/bash

# Manhattan Enforcement Demo - Start Script
# Opens the demo in the default browser

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Path to the demo HTML file
HTML_FILE="$DIR/index.html"

# Check if file exists
if [ ! -f "$HTML_FILE" ]; then
    echo "Error: index.html not found at $HTML_FILE"
    exit 1
fi

echo "Starting Manhattan Enforcement Demo..."
echo "Opening: $HTML_FILE"

# Open in default browser (macOS)
open "$HTML_FILE"

echo "Demo started! The demo will run in an infinite loop."
echo "Close the browser tab to stop the demo."









