#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting deployment to Hostinger...');

// Step 1: Build the project
console.log('📦 Building project...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 2: Check if out directory exists
const outDir = path.join(__dirname, 'out');
if (!fs.existsSync(outDir)) {
  console.error('❌ Build output directory not found');
  process.exit(1);
}

// Step 3: Display deployment instructions
console.log('\n📋 Manual Upload Instructions:');
console.log('1. Open your Hostinger File Manager or FTP client');
console.log('2. Navigate to your public_html directory');
console.log('3. Delete all existing files (or backup first)');
console.log('4. Upload ALL contents from the "out" folder');
console.log('5. Make sure the .htaccess file is uploaded');
console.log('\n📁 Files ready for upload in:', outDir);
console.log('\n💡 Pro tip: You can zip the "out" folder contents and upload the zip file, then extract it on Hostinger');

// Step 4: List files that will be uploaded
console.log('\n📄 Files to upload:');
const files = fs.readdirSync(outDir, { recursive: true });
files.forEach(file => {
  if (typeof file === 'string') {
    console.log(`   - ${file}`);
  }
});

console.log('\n✨ Deployment package ready! Upload the files above to complete deployment.');
