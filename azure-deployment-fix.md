# Azure App Service Deployment Fix Guide

## Current Issue Analysis
The deployment failed because:
1. ❌ App Service couldn't find the Django project files
2. ❌ Virtual environment path was incorrect
3. ❌ Missing proper startup command
4. ❌ Missing required files (requirements.txt, startup script)

## ✅ Solution: Fixed Deployment Configuration

### Files Created/Updated:
- ✅ `Dockerfile` - For container deployment
- ✅ `startup.sh` - Linux startup script
- ✅ `startup.txt` - Startup command reference
- ✅ `web.config` - Windows App Service config
- ✅ `.dockerignore` - Container build optimization
- ✅ `requirements.txt` - Updated with all dependencies
- ✅ Database migrations applied

## 🚀 Deployment Options

### Option 1: Container Deployment (Recommended)

**Step 1: Build and Push Container**
```bash
# Build the container locally (optional test)
docker build -t chetak-app .
docker run -p 8000:8000 chetak-app

# For Azure Container Registry
az acr build --registry <your-registry> --image chetak-app:latest .
```

**Step 2: Configure Azure App Service**
1. Create App Service with **Container** runtime
2. Set container image: `<your-registry>.azurecr.io/chetak-app:latest`
3. Configure app settings:
   ```
   DJANGO_SETTINGS_MODULE=chetak.production_settings
   SECRET_KEY=<your-secret-key>
   WEBSITES_PORT=8000
   ```

### Option 2: Python App Service (Linux)

**Step 1: Configure App Service**
1. Runtime: Python 3.13
2. Startup Command: `gunicorn --bind 0.0.0.0:8000 --workers 2 --timeout 600 chetak.wsgi:application`

**Step 2: App Settings**
```
DJANGO_SETTINGS_MODULE=chetak.production_settings
SECRET_KEY=<your-production-secret-key>
SCM_DO_BUILD_DURING_DEPLOYMENT=true
ENABLE_ORYX_BUILD=true
```

**Step 3: Deploy via Git or ZIP**
```bash
# Git deployment
git remote add azure <your-git-url>
git push azure main

# Or ZIP deployment
az webapp deployment source config-zip --resource-group <rg> --name <app-name> --src deployment.zip
```

### Option 3: Azure Container Instances

**Deploy directly to ACI:**
```bash
az container create \
  --resource-group myResourceGroup \
  --name chetak-app \
  --image <your-registry>.azurecr.io/chetak-app:latest \
  --ports 8000 \
  --dns-name-label chetak-app-unique \
  --environment-variables \
    DJANGO_SETTINGS_MODULE=chetak.production_settings \
    SECRET_KEY=<your-secret-key>
```

## 🔧 Azure Front Door Configuration Update

**Update Origin Configuration:**
1. Go to Azure Portal → Front Door → Origin Groups → `chetak-by-teamv`
2. Update origin settings:
   ```
   Host name: <your-new-app-url>
   Origin host header: <same-as-hostname>
   HTTP port: 80
   HTTPS port: 443
   Health probe path: /health/
   ```

**Example URLs based on deployment option:**
- Container App: `chetak-app.azurecontainer.io`
- App Service: `chetak-app.azurewebsites.net`
- Container Instance: `chetak-app-unique.eastus.azurecontainer.io`

## 🔍 Troubleshooting Commands

**Local Testing:**
```bash
# Test with gunicorn locally
C:/SIH2025/chetak/myenv/Scripts/python.exe -m gunicorn --bind 127.0.0.1:8000 chetak.wsgi:application

# Test health endpoint
curl http://localhost:8000/health/
```

**Container Testing:**
```bash
# Build and test container
docker build -t chetak-test .
docker run -p 8000:8000 chetak-test

# Check container health
docker ps
curl http://localhost:8000/health/
```

**Azure Debugging:**
```bash
# View App Service logs
az webapp log tail --name <app-name> --resource-group <rg>

# SSH into container (if enabled)
az webapp ssh --name <app-name> --resource-group <rg>
```

## 📋 Pre-Deployment Checklist

- ✅ `requirements.txt` updated with all dependencies
- ✅ Database migrations applied
- ✅ Static files configuration working
- ✅ Health check endpoint responding
- ✅ Production settings configured
- ✅ Environment variables set
- ✅ Container builds successfully (if using containers)

## 🎯 Recommended Next Steps

1. **Choose deployment method** (Container recommended for Azure Front Door)
2. **Deploy using one of the options above**
3. **Update Front Door origin** with new app URL
4. **Test the complete flow**: Front Door → App → Health Check
5. **Monitor logs** for any remaining issues

## 📞 Support Commands

If you need help with any step:
```bash
# Check current app status
az webapp show --name <app-name> --resource-group <rg> --query "state"

# View recent deployments
az webapp deployment list --name <app-name> --resource-group <rg>

# Get app URL
az webapp show --name <app-name> --resource-group <rg> --query "defaultHostName" -o tsv
```

The deployment should now work correctly with these fixes!