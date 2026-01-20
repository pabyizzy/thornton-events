# Automatic Deployment Setup Guide

## 🚀 Quick Setup (Recommended)

### Step 1: Configure FTP Credentials
Edit `auto-deploy-simple.js` and update these lines:
```javascript
const config = {
  host: 'your-domain.com',        // Your Hostinger FTP server
  user: 'your-ftp-username',      // Your FTP username
  password: 'your-ftp-password',  // Your FTP password
  remotePath: '/public_html/',    // Usually correct as-is
  localPath: './out'              // Usually correct as-is
};
```

### Step 2: Install FTP Client
```bash
npm install -g lftp
```

### Step 3: Deploy Automatically
```bash
npm run auto-deploy
```

## 📋 Deployment Methods

### Method 1: One-Command Deploy
```bash
npm run auto-deploy
```
- Builds your project
- Automatically uploads to Hostinger
- Shows progress and results

### Method 2: File Watcher (Advanced)
```bash
node auto-deploy.js
```
- Watches for file changes
- Automatically rebuilds and deploys
- Runs continuously until stopped

### Method 3: VS Code Integration
1. Open VS Code
2. Press `Ctrl+Shift+P`
3. Type "Tasks: Run Task"
4. Select "Deploy to Hostinger"

### Method 4: Git Hook (Automatic on Commit)
```bash
git commit -m "Your changes"
```
- Automatically deploys after each commit
- No manual intervention needed

## 🔧 Setup Instructions

### For Hostinger FTP:
1. **Get FTP credentials** from Hostinger control panel:
   - FTP Host: Usually `ftp.yourdomain.com` or `yourdomain.com`
   - Username: Your hosting username
   - Password: Your hosting password

2. **Update configuration** in `auto-deploy-simple.js`:
   ```javascript
   const config = {
     host: 'ftp.yourdomain.com',  // Replace with your FTP host
     user: 'yourusername',        // Replace with your username
     password: 'yourpassword',    // Replace with your password
     remotePath: '/public_html/',
     localPath: './out'
   };
   ```

3. **Test the connection**:
   ```bash
   npm run auto-deploy
   ```

### For File Watching:
1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure FTP credentials** in `auto-deploy.js`

3. **Start watching**:
   ```bash
   node auto-deploy.js
   ```

4. **Make changes** to any file in your project
5. **Watch automatic deployment** happen!

## 🎯 Workflow Examples

### Daily Development:
```bash
# Start file watcher
node auto-deploy.js

# Make changes to your code
# Changes automatically deploy to Hostinger!

# Stop when done (Ctrl+C)
```

### Quick Deployments:
```bash
# Make changes, then:
npm run auto-deploy

# Or use VS Code:
# Ctrl+Shift+P -> "Deploy to Hostinger"
```

### Git-Based Workflow:
```bash
# Make changes
git add .
git commit -m "Update events page"
# Automatically deploys to Hostinger!
```

## 🛠️ Troubleshooting

### FTP Connection Issues:
- Verify FTP credentials in Hostinger control panel
- Check if FTP is enabled in hosting settings
- Try connecting with FileZilla first to test credentials

### Build Errors:
- Run `npm run lint` to check for code issues
- Make sure all dependencies are installed: `npm install`
- Check environment variables in `.env.local`

### Upload Failures:
- Ensure `lftp` is installed: `npm install -g lftp`
- Check file permissions on Hostinger
- Verify the `public_html` directory exists

## 🔐 Security Notes

- Never commit FTP passwords to Git
- Use environment variables for production
- Consider using SSH keys instead of passwords
- Regularly rotate FTP credentials

## 📞 Support

If you encounter issues:
1. Check the console output for error messages
2. Verify your Hostinger FTP settings
3. Test manual upload first
4. Check Hostinger support documentation
