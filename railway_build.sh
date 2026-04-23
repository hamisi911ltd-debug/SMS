#!/bin/bash

# Railway build script

echo "🚀 Starting Railway build process..."

echo "📦 Installing dependencies..."
pip install -r requirements.txt

echo "🗂️ Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "🗄️ Running database migrations..."
python manage.py migrate --noinput

echo "✅ Build completed successfully!"