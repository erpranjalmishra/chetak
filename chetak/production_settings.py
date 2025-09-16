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
    os.environ.get('AZURE_WEBAPP_NAME', '') + '.azurewebsites.net',
]

# Database configuration for production
# Uncomment and configure for your production database
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': os.environ.get('DB_NAME'),
#         'USER': os.environ.get('DB_USER'),
#         'PASSWORD': os.environ.get('DB_PASSWORD'),
#         'HOST': os.environ.get('DB_HOST'),
#         'PORT': os.environ.get('DB_PORT', '5432'),
#     }
# }

# Security settings
SECRET_KEY = os.environ.get('SECRET_KEY', SECRET_KEY)
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# CSRF settings for Azure Front Door
CSRF_TRUSTED_ORIGINS = [
    'https://teamv-hudvbrdpb0geeacx.z01.azurefd.net',
    'https://*.azurefd.net',
]

# CORS settings
CORS_ALLOWED_ORIGINS = [
    'https://teamv-hudvbrdpb0geeacx.z01.azurefd.net',
]

CORS_ALLOW_CREDENTIALS = True

# Static files configuration for production
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'django.log',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}