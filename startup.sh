#!/bin/bash

# Azure App Service Startup Script - Optimized for Fast Startup
echo "=== Starting Django App on Azure App Service ==="
echo "Timestamp: $(date)"
echo "Python version: $(python --version)"
echo "PORT environment variable: $PORT"
echo "WEBSITES_PORT environment variable: $WEBSITES_PORT"

# Set default port if not provided
if [ -z "$PORT" ]; then
    export PORT=8000
    echo "Setting PORT to default: 8000"
fi

# Navigate to app directory
cd /home/site/wwwroot
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Check if manage.py exists
if [ ! -f "manage.py" ]; then
    echo "ERROR: manage.py not found in $(pwd)"
    echo "Directory contents:"
    ls -la
    exit 1
fi

# Install dependencies quickly
echo "Installing dependencies..."
pip install --no-cache-dir -r requirements.txt --quiet

# Skip migrations for faster startup (run separately if needed)
# python manage.py migrate --noinput

# Collect static files quickly
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear --verbosity 0

# Start the application with optimized settings
echo "Starting Django application on port $PORT..."
echo "Command: gunicorn --bind 0.0.0.0:$PORT --workers 1 --timeout 120 --keep-alive 2 --max-requests 1000 --preload chetak.wsgi:application"

# Start gunicorn with Azure-optimized settings
exec gunicorn \
    --bind "0.0.0.0:$PORT" \
    --workers 1 \
    --timeout 120 \
    --keep-alive 2 \
    --max-requests 1000 \
    --preload \
    --access-logfile '-' \
    --error-logfile '-' \
    --log-level info \
    chetak.wsgi:application