"""
Django settings for crm_backend project.
"""

from pathlib import Path
import os
import dj_database_url # Kräver: pip install dj-database-url

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# SECURITY WARNING: keep the secret key used in production secret!
# I produktion bör denna läsas från en miljövariabel
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-!3+=)t221%&8xk$co1gye=hbf5(5$$tx+wielus$a^_5l=zmey')

# SECURITY WARNING: don't run with debug turned on in production!
# Sätt DEBUG till False i molnet via miljövariabler
DEBUG = os.environ.get('DEBUG', 'True') == 'True'

# Tillåt Railway/Render domäner samt localhost
ALLOWED_HOSTS = ['*', 'localhost', '127.0.0.1']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'core',
    'corsheaders',
    'whitenoise.runserver_nostatic', # Kräver: pip install whitenoise
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', # För statiska filer i molnet
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'crm_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
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

WSGI_APPLICATION = 'crm_backend.wsgi.application'


# Database - Optimerad för både lokal Postgres och Moln-Postgres
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
    'default': dj_database_url.config(
        # Om DATABASE_URL inte finns i systemet, använd dina lokala uppgifter:
        # default='postgres://crm_user:KZB570!aik.se1@localhost:5432/crm_db',
        # default='postgresql://postgres.alhqomvhqdmjzedkwmzf:KZB570!aik.se1@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
        default='postgresql://postgres.alhqomvhqdmjzedkwmzf:KZB570!aik.se1@aws-1-eu-north-1.pooler.supabase.com:5432/postgres',
        conn_max_age=600
    )
}


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',},
]


# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles' # Plats för samlade filer vid deploy
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS - Tillåt din lokala React och din framtida moln-URL
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Tillåt alla för enkelhetens skull under test (valfritt men smidigt vid deploy)
CORS_ALLOW_ALL_ORIGINS = True