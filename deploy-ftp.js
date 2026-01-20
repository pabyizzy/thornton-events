#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting FTP deployment to Hostinger...');

// Configuration - Update these with your Hostinger FTP details
const config = {
  host: 'your-domain.com', // or FTP host provided by Hostinger
  user: 'your-username',   // your Hostinger FTP username
  password: 'your-password', // your Hostinger FTP password
  remotePath: '/public_html/', // remote directory on Hostinger
  localPath: './out' // local build output directory
};

// Check if FTP client is available
try {
  execSync('which ftp', { stdio: 'ignore' });
} catch (error) {
  console.log('💡 FTP client not found. Installing lftp...');
  try {
    execSync('npm install -g lftp', { stdio: 'inherit' });
  } catch (installError) {
    console.log('⚠️  Could not install lftp automatically.');
    console.log('📋 Manual FTP Upload Instructions:');
    console.log('1. Run: npm run build');
    console.log('2. Use your preferred FTP client (FileZilla, WinSCP, etc.)');
    console.log('3. Connect to your Hostinger FTP server');
    console.log('4. Upload all contents from the "out" folder to public_html');
    process.exit(0);
  }
}

// Step 1: Build the project
console.log('📦 Building project...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 2: Create FTP script
const ftpScript = `
open ${config.host}
user ${config.user} ${config.password}
cd ${config.remotePath}
lcd ${config.localPath}
mirror -R --delete --verbose .
quit
`;

fs.writeFileSync('ftp-script.txt', ftpScript);

console.log('📤 Uploading files via FTP...');
console.log('⚠️  Make sure to update the FTP credentials in deploy-ftp.js first!');

try {
  execSync('lftp -f ftp-script.txt', { stdio: 'inherit' });
  console.log('✅ Upload completed successfully');
  
  // Clean up
  fs.unlinkSync('ftp-script.txt');
} catch (error) {
  console.error('❌ Upload failed:', error.message);
  console.log('📋 Manual upload instructions:');
  console.log('1. Upload all contents from the "out" folder to public_html');
  console.log('2. Make sure the .htaccess file is included');
  process.exit(1);
}
