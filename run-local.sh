#!/bin/bash

# Cosplay Portfolio - Local Development Script

# Change to project directory
cd "$(dirname "$0")" || exit

echo "🎭 Cosplay Portfolio - Local Server"
echo "===================================="
echo ""
echo "Choose mode:"
echo "1) Development (with hot reload) - PORT 3000"
echo "2) Production (build & run) - PORT 3000"
echo ""
read -p "Enter choice (1 or 2): " choice

case $choice in
  1)
    echo "🚀 Starting development server..."
    npm run dev
    ;;
  2)
    echo "🏗️  Building for production..."
    npm run build
    if [ $? -eq 0 ]; then
      echo "✅ Build successful!"
      echo "🚀 Starting production server..."
      npm run start
    else
      echo "❌ Build failed!"
      exit 1
    fi
    ;;
  *)
    echo "Invalid choice. Using development mode..."
    npm run dev
    ;;
esac
