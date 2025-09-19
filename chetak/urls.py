from Mainapp.views import *
from django.contrib import admin
from django.urls import path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', homepage, name='home'),
    path('login/', logipage, name='logipage'),
    path('register/', registerpage, name='register'),
    path("adminprofile/", adminprofilepage,name="adminprofile"),
    path("logout/",logoutouting),
    path("govoffice/",govofficer),
    path("ashaworker/",ashaworker),
    path("reports/",reporting),
    
]


