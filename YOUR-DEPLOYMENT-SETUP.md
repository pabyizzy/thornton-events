# Your Hostinger Deployment Setup

## 🎯 What I've Configured For You

✅ **FTP Host**: `ftp.lightcoral-dragonfly-511011.hostingersite.com`  
✅ **FTP Username**: `u623471226.thorntonevents`  
✅ **Remote Path**: `/home/u623471226/domains/lightcoral-dragonfly-511011.hostingersite.com/public_html/`  
✅ **Your Domain**: `https://lightcoral-dragonfly-511011.hostingersite.com`  

## 🔑 What You Need To Do (One-Time Setup)

### Step 1: Add Your FTP Password
You need to add your FTP password to these files:

**File 1: `deploy-windows.js`**
```javascript
// Find this line and replace YOUR_FTP_PASSWORD with your actual password:
password: 'YOUR_FTP_PASSWORD', // ← Replace this with your actual password
```

**File 2: `auto-deploy.js`**
```javascript
// Find this line and replace YOUR_FTP_PASSWORD with your actual password:
password: 'YOUR_FTP_PASSWORD', // ← Replace this with your actual password
```

**File 3: `auto-deploy-simple.js`**
```javascript
// Find this line and replace YOUR_FTP_PASSWORD with your actual password:
password: 'YOUR_FTP_PASSWORD', // ← Replace this with your actual password
```

### Step 2: Find Your FTP Password
Your FTP password should be in one of these places:
- Hostinger control panel → FTP Accounts
- Email from Hostinger with FTP credentials
- Hostinger File Manager → FTP settings

## 🚀 How To Deploy (After Setup)

### Option 1: One-Command Deploy (Easiest)
```bash
npm run deploy-windows
```

### Option 2: Batch File (Windows)
Double-click `auto-deploy.bat`

### Option 3: File Watcher (Auto-deploy on changes)
```bash
node auto-deploy.js
```
This will watch for file changes and automatically deploy!

## 🧪 Test Your Setup

1. **Add your FTP password** to the files above
2. **Run**: `npm run deploy-windows`
3. **Check**: Visit `https://lightcoral-dragonfly-511011.hostingersite.com`

## 📋 Your FTP Details (For Reference)

```
Host: ftp.lightcoral-dragonfly-511011.hostingersite.com
Username: u623471226.thorntonevents
Port: 21
Remote Directory: /home/u623471226/domains/lightcoral-dragonfly-511011.hostingersite.com/public_html/
Your Website: https://lightcoral-dragonfly-511011.hostingersite.com
```

## 🔄 Daily Workflow (After Setup)

### For Development:
```bash
# Start auto-deploy watcher
node auto-deploy.js

# Make changes to your code
# Changes automatically deploy to Hostinger!

# Stop when done (Ctrl+C)
```

### For Quick Deployments:
```bash
# Make changes, then:
npm run deploy-windows

# Or double-click:
auto-deploy.bat
```

## 🛠️ Troubleshooting

### If FTP upload fails:
1. **Check password**: Make sure you replaced `YOUR_FTP_PASSWORD` correctly
2. **Test connection**: Try connecting with FileZilla first
3. **Check Hostinger**: Ensure FTP is enabled in your hosting settings

### If build fails:
1. **Run linting**: `npm run lint`
2. **Check dependencies**: `npm install`
3. **Check environment**: Verify `.env.local` has correct Supabase credentials

### Manual upload (if automated fails):
1. Run `npm run build`
2. Upload all contents from `out` folder to Hostinger `public_html`
3. Make sure `.htaccess` file is included

## 🎉 Once Setup Complete

You'll have **hands-off deployment**:
- ✅ One command deploys everything
- ✅ File watcher auto-deploys on changes
- ✅ Batch file for easy Windows deployment
- ✅ All files automatically uploaded to correct location
- ✅ Your site updates instantly on Hostinger

**Your workflow will be**: Make changes → Auto-deploy → Live site! 🚀
