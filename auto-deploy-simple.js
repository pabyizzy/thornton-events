#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Auto-deploying to Hostinger...');

// Configuration - Hostinger FTP details
const config = {
  host: 'ftp.lightcoral-dragonfly-511011.hostingersite.com', // Your FTP hostname
  user: 'u623471226.thorntonevents', // Your FTP username
  password: 'WrH&~hcy!>!fQt5@', // ⚠️ YOU NEED TO ADD YOUR FTP PASSWORD HERE
  remotePath: '/home/u623471226/domains/lightcoral-dragonfly-511011.hostingersite.com/public_html/',
  localPath: './out'
};

async function deploy() {
  try {
    // Step 1: Build
    console.log('📦 Building project...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completed');

    // Step 2: Check if FTP client is available
    let ftpAvailable = false;
    try {
      execSync('lftp --version', { stdio: 'ignore' });
      ftpAvailable = true;
    } catch (error) {
      console.log('💡 Installing lftp for automatic uploads...');
      try {
        execSync('npm install -g lftp', { stdio: 'inherit' });
        ftpAvailable = true;
      } catch (installError) {
        console.log('⚠️  Could not install lftp automatically');
      }
    }

    if (!ftpAvailable) {
      console.log('📋 Manual upload required:');
      console.log('1. Upload all contents from the "out" folder to public_html');
      console.log('2. Make sure the .htaccess file is included');
      return;
    }

    // Step 3: Upload via FTP
    console.log('📤 Uploading to Hostinger...');
    
    const ftpScript = `
open ${config.host}
user ${config.user} ${config.password}
cd ${config.remotePath}
lcd ${config.localPath}
mirror -R --delete --verbose .
quit
`;

    fs.writeFileSync('temp-ftp-script.txt', ftpScript);
    
    execSync('lftp -f temp-ftp-script.txt', { stdio: 'inherit' });
    
    // Clean up
    fs.unlinkSync('temp-ftp-script.txt');
    
    console.log('✅ Deployment completed successfully!');
    console.log(`🌐 Your site is live at: https://${config.host}`);

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    console.log('📋 Manual upload instructions:');
    console.log('1. Upload all contents from the "out" folder to public_html');
    console.log('2. Make sure the .htaccess file is included');
  }
}

// Run deployment
deploy();
