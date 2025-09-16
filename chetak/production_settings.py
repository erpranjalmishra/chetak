"""
Production settings for Azure deployment
"""
import os
from .settings import *

# Production settings
DEBUG = False

# Azure Front Door configuration
ALLOWED_HOSTS = [
    'teamv-hudvbrdpb0geeacx.z01.azurefd.net',
    '.azurefd.net',
    '.azure.com',
    '.azurewebsites.net',
    'chetak-by-teamv.azurewebsites.net',
    'chetak.teamvimarsh.me',  # Custom domain
    'localhost',
    '127.0.0.1',
    os.environ.get('WEBSITE_HOSTNAME', ''),
]

# Database configuration for production
# Using SQLite for simplicity - change to PostgreSQL/MySQL for production
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Security settings
SECRET_KEY = os.environ.get('SECRET_KEY', SECRET_KEY)
SECURE_SSL_REDIRECT = False  # Let Azure Front Door handle SSL
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True

# CSRF settings for Azure Front Door
CSRF_TRUSTED_ORIGINS = [
    'https://teamv-hudvbrdpb0geeacx.z01.azurefd.net',
    'https://*.azurefd.net',
    'https://*.azurewebsites.net',
    'https://chetak-by-teamv.azurewebsites.net',
    'https://chetak.teamvimarsh.me',  # Custom domain
]

# CORS settings
CORS_ALLOWED_ORIGINS = [
    'https://teamv-hudvbrdpb0geeacx.z01.azurefd.net',
    'https://chetak-by-teamv.azurewebsites.net',
    'https://chetak.teamvimarsh.me',  # Custom domain
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = False

# Static files configuration for production
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Remove STATICFILES_DIRS to avoid Azure deployment warnings
STATICFILES_DIRS = []

# Simplified logging for Azure
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}