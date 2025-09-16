#!/bin/bash

# Azure App Service startup script for Django
echo "Starting Django application..."

# Navigate to the app directory
cd /home/site/wwwroot

# Install dependencies if not already installed
if [ ! -d "antenv" ]; then
    echo "Creating virtual environment..."
    python -m venv antenv
fi

# Activate virtual environment
source antenv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install requirements
echo "Installing requirements..."
pip install -r requirements.txt

# Run migrations
echo "Running database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start the Django application
echo "Starting Django server..."
exec gunicorn --bind 0.0.0.0:8000 --workers 2 --timeout 600 chetak.wsgi:application