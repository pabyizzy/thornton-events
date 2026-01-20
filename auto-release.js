#!/usr/bin/env node

const { execSync } = require('child_process');
const chokidar = require('chokidar');
const fs = require('fs');

console.log('🚀 Auto-release watcher started...');
console.log('📝 Watching for file changes...');
console.log('🔄 Will automatically run "npm run release" on changes');
console.log('⏹️  Press Ctrl+C to stop watching');
console.log('');

// Configuration
const watchPaths = [
  './app/**/*',
  './lib/**/*',
  './public/**/*',
  './*.js',
  './*.json',
  './*.md',
  './next.config.*'
];

const ignorePaths = [
  './out/**/*',
  './node_modules/**/*',
  './.next/**/*',
  './.git/**/*',
  './*.log'
];

// Track if we're currently deploying
let isDeploying = false;
let timeout;

// Function to run release
async function runRelease() {
  if (isDeploying) {
    console.log('⏳ Deployment already in progress, skipping...');
    return;
  }

  isDeploying = true;
  console.log('\n🔄 Changes detected, running npm run release...');
  console.log('⏰ ' + new Date().toLocaleTimeString());
  
  try {
    // Run the release command
    execSync('npm run release', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    console.log('✅ Release completed successfully!');
    console.log('🌐 Your site should be live at: https://lightcoral-dragonfly-511011.hostingersite.com');
    
  } catch (error) {
    console.error('❌ Release failed:', error.message);
    console.log('📋 You may need to manually upload files from the "out" folder');
  } finally {
    isDeploying = false;
    console.log('\n👀 Watching for more changes...');
  }
}

// Set up file watcher
const watcher = chokidar.watch(watchPaths, {
  ignored: ignorePaths,
  persistent: true,
  ignoreInitial: true
});

// Handle file changes
watcher.on('change', (path) => {
  console.log(`📝 File changed: ${path}`);
  
  // Debounce multiple changes - wait 3 seconds after last change
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    runRelease();
  }, 3000);
});

watcher.on('add', (path) => {
  console.log(`➕ File added: ${path}`);
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    runRelease();
  }, 3000);
});

watcher.on('unlink', (path) => {
  console.log(`🗑️  File removed: ${path}`);
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    runRelease();
  }, 3000);
});

// Handle errors
watcher.on('error', (error) => {
  console.error('❌ File watcher error:', error);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Stopping auto-release watcher...');
  watcher.close();
  process.exit(0);
});

console.log('✅ Auto-release watcher is running!');
console.log('📁 Watching paths:', watchPaths);
console.log('🚫 Ignoring paths:', ignorePaths);
console.log('');
