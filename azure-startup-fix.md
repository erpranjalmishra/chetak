# Azure App Service Startup Timeout Fix

## 🚨 **Current Issue**: Startup Probe Failed
**Error**: `Site startup probe failed after 230.0167409 seconds`
**Root Cause**: Azure App Service health check not getting HTTP 200 response within timeout

## ✅ **Immediate Fixes Applied**

### 1. **Optimized Startup Script** (`startup.sh`)
- ⚡ Reduced worker count to 1 (faster startup)
- ⚡ Reduced timeout to 120 seconds
- ⚡ Added proper error logging
- ⚡ Optimized gunicorn settings for Azure

### 2. **Updated App Configuration**
- 🔧 Added Azure-specific ALLOWED_HOSTS
- 🔧 Simplified logging configuration
- 🔧 Disabled SSL redirect (let Front Door handle it)
- 🔧 Added proper CORS settings

### 3. **Optimized Docker Container**
- 🚀 Faster health check intervals
- 🚀 Reduced worker count for quicker startup
- 🚀 Optimized for Azure App Service environment

## 🔧 **Azure Configuration Steps**

### **Option A: Fix Current Deployment (Recommended)**

**1. Update App Service Configuration:**
```bash
# Set the startup command
az webapp config set \
  --resource-group <your-rg> \
  --name chetak-by-teamv \
  --startup-file "gunicorn --bind 0.0.0.0:8000 --workers 1 --timeout 120 chetak.wsgi:application"
```

**2. Configure App Settings:**
```bash
az webapp config appsettings set \
  --resource-group <your-rg> \
  --name chetak-by-teamv \
  --settings \
    DJANGO_SETTINGS_MODULE=chetak.production_settings \
    WEBSITES_PORT=8000 \
    SCM_DO_BUILD_DURING_DEPLOYMENT=true \
    ENABLE_ORYX_BUILD=true
```

**3. Enable Application Logging:**
```bash
az webapp log config \
  --resource-group <your-rg> \
  --name chetak-by-teamv \
  --application-logging filesystem \
  --level information
```

### **Option B: Container Deployment (Alternative)**

**1. Build and Push Container:**
```bash
# Build locally
docker build -t chetak-app .

# Test locally first
docker run -p 8000:8000 chetak-app
curl http://localhost:8000/health/

# Push to Azure Container Registry
az acr build --registry <your-registry> --image chetak-app:latest .
```

**2. Deploy Container to App Service:**
```bash
az webapp create \
  --resource-group <your-rg> \
  --plan <your-plan> \
  --name chetak-by-teamv-container \
  --deployment-container-image-name <registry>.azurecr.io/chetak-app:latest
```

## 🐛 **Debugging Steps**

### **1. Check Current Logs:**
```bash
# View real-time logs
az webapp log tail --resource-group <your-rg> --name chetak-by-teamv

# Download log files
az webapp log download --resource-group <your-rg> --name chetak-by-teamv
```

### **2. Test Health Endpoint:**
```bash
# Test after deployment
curl https://chetak-by-teamv.azurewebsites.net/health/
```

### **3. SSH into Container (if enabled):**
```bash
az webapp ssh --resource-group <your-rg> --name chetak-by-teamv
```

## 🎯 **Quick Fix Commands for Azure Portal**

### **Application Settings to Add:**
```
Name: DJANGO_SETTINGS_MODULE
Value: chetak.production_settings

Name: WEBSITES_PORT  
Value: 8000

Name: SCM_DO_BUILD_DURING_DEPLOYMENT
Value: true

Name: PYTHONPATH
Value: /home/site/wwwroot
```

### **Startup Command Options:**
```bash
# Option 1: Simple gunicorn (recommended)
gunicorn --bind 0.0.0.0:8000 --workers 1 --timeout 120 chetak.wsgi:application

# Option 2: Django development server (for testing)
python manage.py runserver 0.0.0.0:8000

# Option 3: Using environment variable for port
gunicorn --bind 0.0.0.0:$PORT --workers 1 --timeout 120 chetak.wsgi:application
```

## 🔍 **Troubleshooting Checklist**

- [ ] **Files are deployed**: Check if manage.py exists in /home/site/wwwroot
- [ ] **Dependencies installed**: requirements.txt processed correctly
- [ ] **Port configuration**: App listening on port 8000
- [ ] **Health endpoint**: /health/ returns HTTP 200
- [ ] **Environment variables**: DJANGO_SETTINGS_MODULE set correctly
- [ ] **Static files**: collectstatic runs without errors
- [ ] **Database**: SQLite file accessible (or external DB connected)

## 🚨 **If Still Failing**

### **Emergency Fallback - Simple Test:**
1. Set startup command to: `python manage.py runserver 0.0.0.0:8000`
2. Set DJANGO_SETTINGS_MODULE to: `chetak.settings` (not production_settings)
3. Check logs immediately after deployment

### **Enable Detailed Logging:**
```bash
# Enable all logging types
az webapp log config \
  --resource-group <your-rg> \
  --name chetak-by-teamv \
  --application-logging filesystem \
  --detailed-error-messages true \
  --failed-request-tracing true \
  --web-server-logging filesystem
```

## 📞 **Next Steps**

1. **Apply Option A fixes** to current deployment
2. **Monitor logs** during startup
3. **Test health endpoint** once deployed
4. **Update Front Door** origin if successful
5. **Switch to container deployment** if App Service continues to fail

The optimized configuration should resolve the startup timeout issue!