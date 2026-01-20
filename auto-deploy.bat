@echo off
echo 🚀 Auto-deploying to Hostinger...
echo.

REM Build the project
echo 📦 Building project...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo ✅ Build completed successfully
echo.

REM Check if password is configured
findstr /C:"YOUR_FTP_PASSWORD" deploy-windows.js >nul
if not errorlevel 1 (
    echo ⚠️  FTP password not configured yet!
    echo.
    echo 📋 To enable automatic upload:
    echo 1. Edit deploy-windows.js
    echo 2. Replace 'YOUR_FTP_PASSWORD' with your actual FTP password
    echo 3. Run this script again
    echo.
    echo 📁 Files ready for manual upload in: out
    echo.
    set /p openFolder="Open out folder for manual upload? (y/n): "
    if /i "!openFolder!"=="y" (
        start explorer "out"
    )
    pause
    exit /b 0
)

REM Run the Windows deployment script
echo 📤 Uploading to Hostinger...
node deploy-windows.js

echo.
echo ✨ Deployment complete!
pause
