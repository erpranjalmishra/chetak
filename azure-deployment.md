# Azure Front Door Deployment Guide for Django App

## Current Configuration
- Front Door Profile: `teamv`
- Endpoint: `teamv-hudvbrdpb0geeacx.z01.azurefd.net`
- Origin Group: `chetak-by-teamv`

## Step-by-Step Azure Front Door Setup

### 1. Backend/Origin Configuration
Configure your origin group `chetak-by-teamv` with these settings:

**Origin Details:**
- Origin Type: Custom
- Host Name: Your Django app server (e.g., your VM IP or App Service URL)
- Origin Host Header: Same as host name
- HTTP Port: 80
- HTTPS Port: 443
- Priority: 1
- Weight: 1000

**Health Probe Settings:**
- Protocol: HTTPS (or HTTP if no SSL)
- Method: GET
- Path: `/` (or create a health check endpoint like `/health/`)
- Interval: 30 seconds

### 2. Routing Rules
Create routing rules for your application:

**Default Route:**
- Name: `default-route`
- Domains: `teamv-hudvbrdpb0geeacx.z01.azurefd.net`
- Patterns to match: `/*`
- Accepted protocols: HTTP and HTTPS
- Redirect: Redirect HTTP to HTTPS
- Origin group: `chetak-by-teamv`
- Forwarding protocol: HTTPS only
- URL rewrite: Disabled

**Static Files Route (Optional):**
- Name: `static-route`
- Patterns to match: `/static/*`
- Origin group: `chetak-by-teamv`
- Caching: Enabled
- Query string caching behavior: Use query string
- Compression: Enabled

### 3. Security Rules (WAF - Optional but Recommended)
Configure Web Application Firewall:
- DDoS protection: Enabled
- Rate limiting: Configure based on your needs
- Geo-filtering: Configure allowed/blocked regions
- Custom rules: Add as needed

### 4. SSL Certificate
- Use Azure managed certificate for `*.azurefd.net` domain
- For custom domains, upload your certificate or use Azure managed

## Django Application Deployment

### Option 1: Azure App Service
```bash
# Deploy to Azure App Service
az webapp up --sku B1 --name chetak-app --resource-group myResourceGroup
```

### Option 2: Azure Container Instances
Create a Dockerfile:
```dockerfile
FROM python:3.13-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

### Option 3: Azure Virtual Machine
Deploy your Django app on a VM and configure nginx as reverse proxy.

## Testing Your Setup

1. Test direct access to your backend
2. Test through Front Door endpoint: `https://teamv-hudvbrdpb0geeacx.z01.azurefd.net`
3. Verify static files are served correctly
4. Test from different geographical locations

## Monitoring and Optimization

1. Enable Azure Monitor for Front Door
2. Set up alerts for health probe failures
3. Monitor cache hit ratio for static content
4. Review access logs for performance optimization

## Environment Variables for Production

Set these in your deployment environment:
```
DEBUG=False
ALLOWED_HOSTS=teamv-hudvbrdpb0geeacx.z01.azurefd.net,.azurefd.net
SECRET_KEY=your-production-secret-key
DATABASE_URL=your-production-database-url
```