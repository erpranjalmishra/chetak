from django.shortcuts import render,redirect
from django.contrib import messages
from django.contrib.auth.models import User
from .models import *
from django.contrib.auth import authenticate,login,logout
def homepage(request):
    return render(request, 'index.html')

def logipage(request):
    if(request.method=="POST"):
        role = request.POST.get("userType") or request.POST.get("user_type")
        username = request.POST.get("username")
        password = request.POST.get("password")
        
        if username and password:
            user = authenticate(request, username=username, password=password)
            if user is not None:
                if role == "admin":
                    if user.is_staff:
                        login(request, user)
                        return redirect('/adminprofile/')
                    else:
                        messages.error(request, 'You do not have admin privileges.')
                else:
                    # Handle other role types here
                    login(request, user)
                    messages.success(request, f'Welcome! Logged in as {role}.')
                    return redirect('/govoffice/')
            else:
                messages.error(request, 'Invalid username or password.')
        else:
            messages.error(request, 'Please enter both username and password.')
    
    return render(request, 'login.html')

def registerpage(request):
    if(request.method=="POST"):
        username = request.POST.get("username")
        email = request.POST.get("email")
        password = request.POST.get("password")
        confirm_password = request.POST.get("confirm_password")
        
        if password != confirm_password:
            messages.error(request, "Passwords do not match.")
            return redirect('register')
        
        if len(password) < 8:
            messages.error(request, "Password must be at least 8 characters long.")
            return redirect('register')
        
        
        if User.objects.filter(username=username).exists():
            messages.error(request, "Username already taken.")
            return redirect('register')
        
        if User.objects.filter(email=email).exists():
            messages.error(request, "Email already registered.")
            return redirect('register')
        
        user = User.objects.create_user(username=username, email=email, password=password)
        user.save()
        role=UserType.objects.create(username=username, user_type="user")
        role.save()
        messages.success(request, "Registration successful. Please log in.")
        return redirect('logipage')
    return render(request, 'register.html')


def adminprofilepage(request):
    return render(request,"adminprofile.html")


def logoutouting(request):
    logout(request)
    return redirect("/")

def govofficer(request):
    return render(request,"govoffice.html")


def ashaworker(request):
    return render(request,"ashaworkerlocations.html")

def reporting(request):
    return render(request,"asha_reprts.html")