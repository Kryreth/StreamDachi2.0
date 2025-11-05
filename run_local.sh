#!/bin/bash

# Colors for terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

clear

echo ""
echo "  ==================================================="
echo -e "    ${GREEN}STREAMDACHI - LOCAL MODE${NC}"
echo "  ==================================================="
echo ""
echo "  Database: SQLite (app.db)"
echo "  Server: http://localhost:5000"
echo ""
echo "  Starting in 2 seconds..."
echo "  Press Ctrl+C to cancel"
echo "  ==================================================="
echo ""

sleep 2

echo -e "  ${BLUE}[1/2]${NC} Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "  Installing packages (this may take a minute)..."
    npm install
    if [ $? -ne 0 ]; then
        echo ""
        echo -e "  ${RED}ERROR: npm install failed!${NC}"
        echo "  Make sure Node.js is installed."
        read -p "  Press Enter to exit..."
        exit 1
    fi
else
    echo "  Dependencies OK!"
fi

echo ""
echo -e "  ${BLUE}[2/2]${NC} Starting StreamDachi..."
echo ""
echo "  ==================================================="
echo -e "    ${GREEN}SERVER RUNNING${NC}"
echo "  ==================================================="
echo ""
echo "  Open your browser to: http://localhost:5000"
echo ""
echo "  Press Ctrl+C to stop the server"
echo "  ==================================================="
echo ""

npx tsx server/index.ts

if [ $? -ne 0 ]; then
    echo ""
    echo "  ==================================================="
    echo -e "    ${RED}SERVER STOPPED WITH ERROR${NC}"
    echo "  ==================================================="
    echo ""
    read -p "  Press Enter to exit..."
    exit 1
fi

echo ""
echo "  ==================================================="
echo -e "    ${GREEN}SERVER STOPPED NORMALLY${NC}"
echo "  ==================================================="
echo ""
read -p "  Press Enter to exit..."
