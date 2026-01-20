#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Auto-deploying to Hostinger (PowerShell)...');

async function deploy() {
  try {
    // Step 1: Build
    console.log('📦 Building project...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completed');

    // Step 2: Upload via PowerShell
    console.log('📤 Uploading to Hostinger via PowerShell...');
    
    try {
      // Run PowerShell script
      execSync('powershell -ExecutionPolicy Bypass -File upload.ps1', { 
        stdio: 'inherit',
        cwd: __dirname 
      });
      
      console.log('✅ Deployment completed successfully!');
      console.log('🌐 Your site is live at: https://lightcoral-dragonfly-511011.hostingersite.com');
      
    } catch (psError) {
      console.log('⚠️  PowerShell upload failed. Trying alternative method...');
      
      // Fallback: Create manual upload instructions
      console.log('📋 Manual upload required:');
      console.log('1. Open Hostinger File Manager');
      console.log('2. Navigate to public_html');
      console.log('3. Upload ALL contents from the "out" folder');
      console.log('4. Make sure the .htaccess file is included');
      console.log('\n📁 Files ready for upload in: ./out');
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
