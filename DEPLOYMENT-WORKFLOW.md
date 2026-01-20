# Deployment Workflow Guide

## Quick Deploy (Recommended for beginners)

```bash
npm run deploy
```

This will build your project and show you exactly what files to upload to Hostinger.

## Automated Deployment Options

### Option 1: Simple Script Deployment
```bash
npm run deploy
```
- Builds the project
- Shows you which files to upload
- Provides step-by-step instructions

### Option 2: FTP Deployment (Advanced)
```bash
node deploy-ftp.js
```
**Setup required:**
1. Install FTP client: `npm install -g lftp`
2. Edit `deploy-ftp.js` with your Hostinger FTP credentials:
   ```javascript
   const config = {
     host: 'your-domain.com',
     user: 'your-ftp-username',
     password: 'your-ftp-password',
     remotePath: '/public_html/',
     localPath: './out'
   };
   ```

### Option 3: GitHub Actions (Most Professional)
**Setup required:**
1. Push your code to GitHub
2. Add these secrets to your GitHub repository:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `FTP_SERVER` (your Hostinger FTP server)
   - `FTP_USERNAME` (your FTP username)
   - `FTP_PASSWORD` (your FTP password)
3. Push to main branch to trigger deployment

## Manual Upload Process

If you prefer manual control:

1. **Build locally:**
   ```bash
   npm run build
   ```

2. **Upload to Hostinger:**
   - Open Hostinger File Manager
   - Navigate to `public_html`
   - Delete old files (backup first if needed)
   - Upload ALL contents from the `out` folder
   - **Important:** Make sure `.htaccess` is uploaded

## Development Workflow

### Making Changes
1. Edit your code locally
2. Test with `npm run dev`
3. Build with `npm run build`
4. Deploy using your preferred method

### Environment Variables
Your `.env.local` file should contain:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Troubleshooting

### Site not loading after upload
- ✅ Check that `.htaccess` file was uploaded
- ✅ Verify all files from `out` folder are in `public_html`
- ✅ Check browser console for errors
- ✅ Verify Supabase environment variables are correct

### FTP connection issues
- Check Hostinger FTP credentials
- Verify FTP server address
- Ensure FTP is enabled in Hostinger control panel

### Build errors
- Run `npm run lint` to check for code issues
- Make sure all dependencies are installed: `npm install`
- Check that environment variables are set correctly
