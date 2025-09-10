@echo off
echo Building Android APK for PlanMe Real Alarms...
echo.

echo Step 1: Building React app...
call npm run build
if %errorlevel% neq 0 (
    echo Error: React build failed
    pause
    exit /b 1
)

echo.
echo Step 2: Syncing with Capacitor...
call npx cap sync android
if %errorlevel% neq 0 (
    echo Error: Capacitor sync failed
    pause
    exit /b 1
)

echo.
echo Step 3: Building Android APK...
call npx cap build android
if %errorlevel% neq 0 (
    echo Error: Android build failed
    echo Make sure Java is installed and JAVA_HOME is set
    pause
    exit /b 1
)

echo.
echo SUCCESS! Android APK built successfully!
echo APK location: android\app\build\outputs\apk\debug\app-debug.apk
echo.
pause
