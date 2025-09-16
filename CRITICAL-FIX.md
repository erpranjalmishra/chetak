# 🚨 CRITICAL AZURE FIX - STARTUP COMMAND ISSUE

## **Problem Identified:**
Azure is using: `python manage.py runserver` 
❌ This only binds to localhost (127.0.0.1)
❌ Azure health checks can't reach the app

## **IMMEDIATE FIX REQUIRED:**

### **Option 1: Fix Current Command (Quick)**
Change startup command to:
```bash
python manage.py runserver 0.0.0.0:8000
```

### **Option 2: Use Production Server (Recommended)**
Change startup command to:
```bash
gunicorn --bind 0.0.0.0:8000 --workers 1 --timeout 120 chetak.wsgi:application
```

## **Azure Portal Steps:**

1. **Go to Azure Portal**
2. **Navigate to:** App Services → `chetak-by-teamv`
3. **Go to:** Configuration → General Settings
4. **Find:** "Startup Command" field
5. **Replace with:** `python manage.py runserver 0.0.0.0:8000`
6. **Click:** Save
7. **Restart** the App Service

## **CLI Commands:**
```bash
# Option 1: Development server with correct binding
az webapp config set \
  --resource-group <your-rg> \
  --name chetak-by-teamv \
  --startup-file "python manage.py runserver 0.0.0.0:8000"

# Option 2: Production server (recommended)
az webapp config set \
  --resource-group <your-rg> \
  --name chetak-by-teamv \
  --startup-file "gunicorn --bind 0.0.0.0:8000 --workers 1 --timeout 120 chetak.wsgi:application"
```

## **Why This Fixes It:**
- ✅ `0.0.0.0:8000` binds to all network interfaces
- ✅ Azure health checks can reach the app
- ✅ Container will respond to HTTP pings
- ✅ No more 230-second timeout

## **Apply This Fix NOW to resolve the startup timeout!**