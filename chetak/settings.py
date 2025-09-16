


from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-6%366&lwt3q&l7qnov(hf2xs&5i1=ub+6$+cuwrw$(s3+g_nlh'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# Azure Front Door configuration
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    'teamv-hudvbrdpb0geeacx.z01.azurefd.net',  # Azure Front Door endpoint
    '.azurefd.net',  # Allow all Azure Front Door domains
    '.azure.com',   # Azure domains
]


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',  # For CORS handling with Azure Front Door
    'Mainapp',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Should be first
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # For static files
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'chetak.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': ['Mainapp/templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'chetak.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'

# Static files configuration for production
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Additional locations of static files
# Only include if directory exists
import os
if os.path.exists(BASE_DIR / 'Mainapp' / 'static'):
    STATICFILES_DIRS = [
        BASE_DIR / 'Mainapp' / 'static',
    ]
else:
    STATICFILES_DIRS = []

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Azure Front Door and Security Configuration
# CSRF trusted origins for Azure Front Door
CSRF_TRUSTED_ORIGINS = [
    'https://teamv-hudvbrdpb0geeacx.z01.azurefd.net',
    'https://*.azurefd.net',
]

# Security headers for production
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = False  # Set to True in production
USE_TZ = True

# CORS settings for Azure Front Door
CORS_ALLOWED_ORIGINS = [
    'https://teamv-hudvbrdpb0geeacx.z01.azurefd.net',
]

# Azure Front Door specific headers
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
