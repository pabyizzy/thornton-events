#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Auto-deploying to Hostinger (Windows)...');

// Configuration - Hostinger FTP details
const config = {
  host: 'ftp.lightcoral-dragonfly-511011.hostingersite.com',
  user: 'u623471226.thorntonevents',
  password: 'WrH&~hcy!>!fQt5@', // Your FTP password
  remotePath: '/home/u623471226/domains/lightcoral-dragonfly-511011.hostingersite.com/public_html/',
  localPath: './out'
};

async function deploy() {
  try {
    // Step 1: Build
    console.log('📦 Building project...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completed');

    // Check if password is configured
    if (config.password === 'YOUR_FTP_PASSWORD') {
      console.log('⚠️  FTP password not configured yet!');
      console.log('📋 Please update the password in deploy-windows.js');
      console.log('📁 Files ready for manual upload in: ./out');
      console.log('\n💡 Manual upload instructions:');
      console.log('1. Open Hostinger File Manager');
      console.log('2. Navigate to public_html');
      console.log('3. Upload ALL contents from the "out" folder');
      console.log('4. Make sure the .htaccess file is included');
      return;
    }

    // Step 2: Create PowerShell FTP script for Windows
    console.log('📤 Creating FTP upload script...');
    
    const ftpScript = `open ${config.host}
${config.user}
${config.password}
binary
cd ${config.remotePath}
lcd ${config.localPath}
prompt off
mput *
mput .htaccess
bye
`;

    // Write FTP script
    fs.writeFileSync('ftp-upload.txt', ftpScript);
    
    console.log('📤 Uploading to Hostinger via FTP...');
    
    // Use Windows built-in FTP client
    try {
      execSync('ftp -s:ftp-upload.txt', { stdio: 'inherit' });
      console.log('✅ Upload completed successfully!');
      console.log('🌐 Your site is live at: https://lightcoral-dragonfly-511011.hostingersite.com');
    } catch (ftpError) {
      console.log('⚠️  FTP upload failed. Trying alternative method...');
      
      // Alternative: Create a batch file for manual execution
      const batchScript = `@echo off
echo Uploading to Hostinger...
ftp -s:ftp-upload.txt
pause`;
      
      fs.writeFileSync('upload.bat', batchScript);
      console.log('📁 Created upload.bat - double-click to run FTP upload');
      console.log('📋 Or manually upload from the "out" folder to Hostinger');
    }
    
    // Clean up
    if (fs.existsSync('ftp-upload.txt')) {
      fs.unlinkSync('ftp-upload.txt');
    }

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    console.log('📋 Manual upload instructions:');
    console.log('1. Upload all contents from the "out" folder to public_html');
    console.log('2. Make sure the .htaccess file is included');
  }
}

// Run deployment
deploy();
