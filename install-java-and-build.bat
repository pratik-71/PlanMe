@echo off
echo Installing Java and building Android APK...
echo.

echo Step 1: Downloading and installing OpenJDK 17...
echo This will install Java automatically using Chocolatey package manager
echo.

REM Check if Chocolatey is installed
where choco >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing Chocolatey package manager...
    powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
    if %errorlevel% neq 0 (
        echo Error: Failed to install Chocolatey
        echo Please install Java manually from https://adoptium.net/
        pause
        exit /b 1
    )
)

echo.
echo Step 2: Installing OpenJDK 17...
choco install openjdk17 -y
if %errorlevel% neq 0 (
    echo Error: Failed to install OpenJDK
    echo Please install Java manually from https://adoptium.net/
    pause
    exit /b 1
)

echo.
echo Step 3: Setting JAVA_HOME...
for /f "tokens=*" %%i in ('where java') do set JAVA_PATH=%%i
for /f "tokens=*" %%i in ('dir /b "C:\Program Files\Eclipse Adoptium\jdk-17*"') do set JAVA_HOME=C:\Program Files\Eclipse Adoptium\%%i
setx JAVA_HOME "%JAVA_HOME%" /M
setx PATH "%PATH%;%JAVA_HOME%\bin" /M

echo.
echo Step 4: Refreshing environment variables...
call refreshenv

echo.
echo Step 5: Building React app...
call npm run build
if %errorlevel% neq 0 (
    echo Error: React build failed
    pause
    exit /b 1
)

echo.
echo Step 6: Syncing with Capacitor...
call npx cap sync android
if %errorlevel% neq 0 (
    echo Error: Capacitor sync failed
    pause
    exit /b 1
)

echo.
echo Step 7: Building Android APK...
call npx cap build android
if %errorlevel% neq 0 (
    echo Error: Android build failed
    pause
    exit /b 1
)

echo.
echo SUCCESS! Android APK built successfully!
echo APK location: android\app\build\outputs\apk\debug\app-debug.apk
echo.
pause
