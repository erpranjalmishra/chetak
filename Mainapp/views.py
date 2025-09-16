from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# Create your views here.
def homepage(request):
    return render(request, 'index.html')

@csrf_exempt
def health_check(request):
    """Health check endpoint for Azure Front Door"""
    return JsonResponse({
        'status': 'healthy',
        'service': 'chetak-django-app',
        'version': '1.0.0'
    })