#!/bin/bash

# Seed Firebase Firestore with test data

cd "$(dirname "$0")" || exit

echo "🌱 Starting Firebase seeding..."
echo ""

node scripts/seed-firebase.js

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Seeding complete!"
  echo "📸 Your local server is ready to display photos"
else
  echo ""
  echo "❌ Seeding failed!"
  exit 1
fi
