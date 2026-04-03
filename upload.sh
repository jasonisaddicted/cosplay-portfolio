#!/bin/bash

# Batch Upload Script - Upload event photos from #To Upload folder
# Usage: ./upload.sh [--dry-run]

cd "$(dirname "$0")"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

# Run the batch upload script with arguments passed through
node batch-upload-events.js "$@"
