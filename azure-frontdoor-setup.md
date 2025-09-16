# Azure Front Door Configuration Steps

## Current Setup Summary
✅ **Django App Configured for Azure Front Door**
- Profile: `teamv`
- Endpoint: `teamv-hudvbrdpb0geeacx.z01.azurefd.net`
- Origin Group: `chetak-by-teamv`

## Next Steps in Azure Portal

### 1. Configure Origin Group `chetak-by-teamv`

**Step 1: Add Origin**
1. Go to Azure Portal → Front Door → Your profile `teamv`
2. Click on "Origin groups" → `chetak-by-teamv`
3. Click "Add an origin"
4. Configure:
   ```
   Name: chetak-origin
   Origin Type: Custom
   Host name: [Your Django app server IP/domain]
   Origin host header: [Same as host name]
   HTTP port: 80
   HTTPS port: 443
   Priority: 1
   Weight: 1000
   ```

**Step 2: Health Probe Settings**
```
Protocol: HTTP (or HTTPS if SSL configured)
Method: GET
Path: /health/
Interval: 30 seconds
```

### 2. Configure Routing Rules

**Step 1: Default Route**
1. Go to "Routes" → Add route
2. Configure:
   ```
   Name: default-route
   Domains: teamv-hudvbrdpb0geeacx.z01.azurefd.net
   Patterns to match: /*
   Accepted protocols: HTTP and HTTPS
   Redirect: Redirect HTTP to HTTPS
   Origin group: chetak-by-teamv
   Forwarding protocol: HTTPS only
   URL rewrite: Disabled
   ```

**Step 2: Static Files Route (Optional)**
```
Name: static-route
Patterns to match: /static/*
Origin group: chetak-by-teamv
Caching: Enabled
Query string caching: Use query string
Compression: Enabled
```

### 3. SSL Configuration
1. Go to "Domains" in Front Door
2. Azure provides free SSL for *.azurefd.net domains
3. For custom domains, add your domain and certificate

### 4. Security (WAF) Configuration
1. Go to "Web Application Firewall"
2. Create a new policy or use existing
3. Configure rules:
   ```
   DDoS protection: Enabled
   Rate limiting: 100 requests per minute per IP
   Geo-filtering: Configure based on your needs
   ```

## Django Deployment Options

### Option A: Azure App Service (Recommended)
```bash
# Install Azure CLI
# az login
# az webapp create --resource-group myResourceGroup --plan myAppServicePlan --name chetak-app --runtime "PYTHON|3.13"
# az webapp config appsettings set --resource-group myResourceGroup --name chetak-app --settings DJANGO_SETTINGS_MODULE=chetak.production_settings
```

### Option B: Azure Container Instances
Create `Dockerfile`:
```dockerfile
FROM python:3.13-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

# Run migrations and collect static files
RUN python manage.py collectstatic --noinput

# Start the application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "chetak.wsgi:application"]
```

### Option C: Azure Virtual Machine
1. Create VM with Python 3.13
2. Install nginx as reverse proxy
3. Configure nginx to serve static files
4. Use gunicorn to run Django app

## Environment Variables for Production

Set these in your Azure deployment:
```
DJANGO_SETTINGS_MODULE=chetak.production_settings
SECRET_KEY=your-production-secret-key
DEBUG=False
ALLOWED_HOSTS=teamv-hudvbrdpb0geeacx.z01.azurefd.net
```

## Testing Your Setup

1. **Health Check**: Visit `https://teamv-hudvbrdpb0geeacx.z01.azurefd.net/health/`
2. **Main App**: Visit `https://teamv-hudvbrdpb0geeacx.z01.azurefd.net/`
3. **Admin**: Visit `https://teamv-hudvbrdpb0geeacx.z01.azurefd.net/admin/`

## Monitoring

1. Enable "Insights" in Front Door for analytics
2. Set up alerts for:
   - Origin health failures
   - High error rates
   - Unusual traffic patterns

## Performance Optimization

1. **Caching Rules**:
   - Static files: Cache for 30 days
   - API responses: Cache for 5 minutes
   - HTML pages: No cache or very short cache

2. **Compression**: Enable for text-based content

3. **Geographic Distribution**: Front Door automatically routes to nearest PoP

## Security Best Practices

1. Enable WAF with OWASP Core Rule Set
2. Configure rate limiting
3. Use HTTPS only
4. Enable security headers
5. Regular security reviews

## Troubleshooting

**Common Issues:**
1. **502 Bad Gateway**: Check origin health and connectivity
2. **CORS Errors**: Verify CORS_ALLOWED_ORIGINS in Django settings
3. **Static Files Not Loading**: Check STATIC_ROOT and WhiteNoise configuration
4. **SSL Issues**: Verify certificate configuration in Front Door

**Debugging:**
- Check Front Door logs in Azure Monitor
- Test direct access to origin
- Verify DNS resolution
- Check security group rules