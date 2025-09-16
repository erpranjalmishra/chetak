# 🎯 EXACT SOLUTION - Azure App Service Startup Fix

## **🚨 ROOT CAUSE CONFIRMED:**
**Azure is using:** `python manage.py runserver`
**Problem:** This only binds to `127.0.0.1` (localhost), but Azure needs `0.0.0.0` for health checks

## **✅ EXACT STEPS TO FIX:**

### **Step 1: Azure Portal Fix (5 minutes)**

1. **Open Azure Portal** → https://portal.azure.com
2. **Navigate:** App Services → `chetak-by-teamv`
3. **Click:** Configuration (left sidebar)
4. **Click:** General Settings tab
5. **Find:** "Startup Command" field
6. **Replace current command with:**
   ```
   python manage.py runserver 0.0.0.0:8000
   ```
7. **Click:** Save (top of page)
8. **Click:** Restart (top of page)

### **Step 2: Monitor Deployment**
- Watch the logs for: "Starting development server at http://0.0.0.0:8000/"
- Should start successfully in ~30-60 seconds
- Health check should pass

### **Step 3: Verify Success**
```bash
# Test the endpoint
curl https://chetak-by-teamv.azurewebsites.net/health/

# Should return:
# {"status": "healthy", "service": "chetak-django-app", "version": "1.0.0"}
```

## **🔄 ALTERNATIVE COMMANDS (if needed):**

### **Option A: Production Server (Recommended for production)**
```
gunicorn --bind 0.0.0.0:8000 --workers 1 --timeout 120 chetak.wsgi:application
```

### **Option B: Django with environment variable**
```
python manage.py runserver 0.0.0.0:$PORT
```

## **📝 CLI Alternative (if you prefer command line):**

```bash
# Replace with your resource group name
RESOURCE_GROUP="your-resource-group-name"

# Fix with development server
az webapp config set \
  --resource-group $RESOURCE_GROUP \
  --name chetak-by-teamv \
  --startup-file "python manage.py runserver 0.0.0.0:8000"

# Restart the app
az webapp restart \
  --resource-group $RESOURCE_GROUP \
  --name chetak-by-teamv
```

## **📊 EXPECTED RESULTS:**

**Before Fix:**
- ❌ `Watching for file changes with StatReloader`
- ❌ `Container didn't respond to HTTP pings on port: 8000`
- ❌ 230-second timeout

**After Fix:**
- ✅ `Starting development server at http://0.0.0.0:8000/`
- ✅ Health checks pass
- ✅ App starts in ~30-60 seconds
- ✅ `https://chetak-by-teamv.azurewebsites.net/` accessible

## **🔍 VERIFICATION CHECKLIST:**

- [ ] Startup command changed to include `0.0.0.0:8000`
- [ ] App Service restarted
- [ ] Logs show server starting on `0.0.0.0:8000`
- [ ] Health endpoint responds: `/health/`
- [ ] Main site accessible
- [ ] No 230-second timeout
- [ ] Ready to update Front Door origin

## **🚀 NEXT STEPS AFTER SUCCESS:**

1. **Update Front Door Origin:**
   - Host name: `chetak-by-teamv.azurewebsites.net`
   - Health probe path: `/health/`

2. **Test Full Flow:**
   - Front Door URL: `https://teamv-hudvbrdpb0geeacx.z01.azurefd.net/`
   - Direct URL: `https://chetak-by-teamv.azurewebsites.net/`

**This fix should resolve the startup timeout immediately!**