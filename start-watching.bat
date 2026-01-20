@echo off
echo 🚀 Starting Auto-Release Watcher...
echo.
echo This will automatically run "npm run release" whenever you make changes.
echo Press Ctrl+C to stop watching.
echo.

call npm run watch
