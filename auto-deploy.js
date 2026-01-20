#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

console.log('🚀 Starting auto-deployment to Hostinger...');

// Configuration - Hostinger FTP details
const config = {
  host: 'ftp.lightcoral-dragonfly-511011.hostingersite.com', // Your FTP hostname
  user: 'u623471226.thorntonevents', // Your FTP username
  password: 'WrH&~hcy!>!fQt5@', // ⚠️ YOU NEED TO ADD YOUR FTP PASSWORD HERE
  remotePath: '/home/u623471226/domains/lightcoral-dragonfly-511011.hostingersite.com/public_html/', // Remote directory on Hostinger
  localPath: './out', // Local build output directory
  watchPaths: [
    './app/**/*',
    './lib/**/*',
    './public/**/*',
    './*.js',
    './*.json',
    './*.md'
  ],
  ignorePaths: [
    './out/**/*',
    './node_modules/**/*',
    './.next/**/*',
    './.git/**/*'
  ]
};

// Function to build and deploy
async function buildAndDeploy() {
  console.log('\n📦 Building project...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completed successfully');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    return;
  }

  console.log('📤 Uploading to Hostinger...');
  try {
    // Create FTP script
    const ftpScript = `
open ${config.host}
user ${config.user} ${config.password}
cd ${config.remotePath}
lcd ${config.localPath}
mirror -R --delete --verbose .
quit
`;

    fs.writeFileSync('temp-ftp-script.txt', ftpScript);
    
    // Upload via FTP
    execSync('lftp -f temp-ftp-script.txt', { stdio: 'inherit' });
    
    // Clean up
    fs.unlinkSync('temp-ftp-script.txt');
    
    console.log('✅ Upload completed successfully');
    console.log(`🌐 Your site is now live at: https://${config.host}`);
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    console.log('📋 Manual upload instructions:');
    console.log('1. Upload all contents from the "out" folder to public_html');
    console.log('2. Make sure the .htaccess file is included');
  }
}

// Function to check if FTP client is available
function checkFTPClient() {
  try {
    execSync('which lftp', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Main function
async function main() {
  // Check if FTP client is available
  if (!checkFTPClient()) {
    console.log('💡 Installing lftp for automatic uploads...');
    try {
      execSync('npm install -g lftp', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️  Could not install lftp automatically.');
      console.log('📋 Manual setup required:');
      console.log('1. Install lftp: npm install -g lftp');
      console.log('2. Update FTP credentials in auto-deploy.js');
      console.log('3. Run this script again');
      process.exit(1);
    }
  }

  // Check if credentials are configured
  if (config.host === 'your-domain.com') {
    console.log('⚠️  Please configure your Hostinger FTP credentials in auto-deploy.js:');
    console.log('   - host: your FTP server address');
    console.log('   - user: your FTP username');
    console.log('   - password: your FTP password');
    console.log('\n📋 For now, running in build-only mode...');
    
    // Just build without uploading
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log('✅ Build completed. Configure FTP credentials for auto-upload.');
    } catch (error) {
      console.error('❌ Build failed:', error.message);
    }
    return;
  }

  // Initial build and deploy
  await buildAndDeploy();

  // Set up file watcher
  console.log('\n👀 Watching for file changes...');
  console.log('Press Ctrl+C to stop watching');
  
  const watcher = chokidar.watch(config.watchPaths, {
    ignored: config.ignorePaths,
    persistent: true,
    ignoreInitial: true
  });

  let timeout;
  watcher.on('change', (path) => {
    console.log(`\n📝 File changed: ${path}`);
    
    // Debounce multiple changes
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
      console.log('🔄 Changes detected, rebuilding and deploying...');
      await buildAndDeploy();
    }, 2000); // Wait 2 seconds after last change
  });

  watcher.on('add', (path) => {
    console.log(`\n➕ File added: ${path}`);
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
      console.log('🔄 New file detected, rebuilding and deploying...');
      await buildAndDeploy();
    }, 2000);
  });

  watcher.on('unlink', (path) => {
    console.log(`\n🗑️  File removed: ${path}`);
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
      console.log('🔄 File removal detected, rebuilding and deploying...');
      await buildAndDeploy();
    }, 2000);
  });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Stopping auto-deployment...');
  process.exit(0);
});

main().catch(console.error);
