@echo off
echo 🚀 Deploying to Hostinger...
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

REM Show manual upload instructions
echo 📋 Upload Instructions:
echo 1. Open your Hostinger File Manager
echo 2. Navigate to public_html directory
echo 3. Upload ALL contents from the "out" folder
echo 4. Make sure the .htaccess file is included
echo.
echo 📁 Files ready in: %CD%\out
echo.

REM Optionally open the out folder
set /p openFolder="Open out folder? (y/n): "
if /i "%openFolder%"=="y" (
    start explorer "out"
)

echo ✨ Ready for upload!
pause
