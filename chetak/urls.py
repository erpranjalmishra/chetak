
from django.contrib import admin
from django.urls import path
from Mainapp.views import *
urlpatterns = [
    path('admin/', admin.site.urls),
    path('', homepage, name='home'),
]
