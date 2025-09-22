@echo off
REM XAMPP Deployment Script for Anoud Job Website
REM This script deploys the website to XAMPP on Windows

echo ========================================
echo    XAMPP Deployment Script
echo    Anoud Job Website
echo ========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Running as Administrator
) else (
    echo ❌ Please run as Administrator
    pause
    exit /b 1
)

REM Set XAMPP paths
set XAMPP_PATH=C:\xampp
set BACKEND_PATH=%XAMPP_PATH%\nodejs\anoudjob-backend
set FRONTEND_PATH=%XAMPP_PATH%\htdocs\anoudjob
set LOGS_PATH=%XAMPP_PATH%\logs\anoudjob

echo 📁 XAMPP Path: %XAMPP_PATH%
echo 📁 Backend Path: %BACKEND_PATH%
echo 📁 Frontend Path: %FRONTEND_PATH%
echo 📁 Logs Path: %LOGS_PATH%
echo.

REM Check if XAMPP is installed
if not exist "%XAMPP_PATH%" (
    echo ❌ XAMPP not found at %XAMPP_PATH%
    echo Please install XAMPP first
    pause
    exit /b 1
)

echo ✅ XAMPP found
echo.

REM Create directories
echo 📁 Creating directories...
if not exist "%BACKEND_PATH%" mkdir "%BACKEND_PATH%"
if not exist "%FRONTEND_PATH%" mkdir "%FRONTEND_PATH%"
if not exist "%LOGS_PATH%" mkdir "%LOGS_PATH%"
echo ✅ Directories created
echo.

REM Stop existing services
echo 🛑 Stopping existing services...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im httpd.exe >nul 2>&1
echo ✅ Services stopped
echo.

REM Copy backend files
echo 📋 Copying backend files...
xcopy /E /I /Y "backend\*" "%BACKEND_PATH%\"
echo ✅ Backend files copied
echo.

REM Copy XAMPP-specific server file
echo 🔧 Configuring XAMPP server...
copy /Y "xampp-server.js" "%BACKEND_PATH%\server.js"
echo ✅ XAMPP server configured
echo.

REM Copy environment file
echo 🔐 Setting up environment...
if exist ".env" (
    copy /Y ".env" "%BACKEND_PATH%\.env"
    echo ✅ Environment file copied
) else (
    copy /Y "xampp-env.example" "%BACKEND_PATH%\.env"
    echo ✅ Environment template copied
    echo ⚠️  Please edit %BACKEND_PATH%\.env with your settings
)
echo.

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd /d "%BACKEND_PATH%"
call npm install
if %errorLevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed
echo.

REM Build frontend
echo 🏗️  Building frontend...
cd /d "%~dp0frontend"
call npm install
if %errorLevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

call npm run build
if %errorLevel% neq 0 (
    echo ❌ Failed to build frontend
    pause
    exit /b 1
)
echo ✅ Frontend built
echo.

REM Copy frontend build
echo 📋 Copying frontend build...
xcopy /E /I /Y "frontend\build\*" "%FRONTEND_PATH%\"
echo ✅ Frontend build copied
echo.

REM Configure Apache
echo 🔧 Configuring Apache...
copy /Y "xampp-httpd-vhosts.conf" "%XAMPP_PATH%\apache\conf\extra\httpd-vhosts.conf"
echo ✅ Apache configured
echo.

REM Add hosts file entry
echo 🌐 Configuring hosts file...
echo 127.0.0.1 anoudjob.local >> C:\Windows\System32\drivers\etc\hosts
echo 127.0.0.1 www.anoudjob.local >> C:\Windows\System32\drivers\etc\hosts
echo ✅ Hosts file updated
echo.

REM Start XAMPP services
echo 🚀 Starting XAMPP services...
net start "Apache2.4" >nul 2>&1
if %errorLevel% neq 0 (
    echo ⚠️  Apache service not found, trying to start manually...
    "%XAMPP_PATH%\apache\bin\httpd.exe" -k start
)
echo ✅ Apache started
echo.

REM Start Node.js backend
echo 🚀 Starting Node.js backend...
cd /d "%BACKEND_PATH%"
start "Anoud Job Backend" cmd /k "npm start"
echo ✅ Node.js backend started
echo.

REM Wait for services to start
echo ⏳ Waiting for services to start...
timeout /t 5 /nobreak >nul
echo.

REM Test deployment
echo 🧪 Testing deployment...
echo Testing health endpoint...
curl -s http://localhost:3234/health >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Backend health check passed
) else (
    echo ⚠️  Backend health check failed
)

echo Testing frontend...
curl -s http://anoudjob.local >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Frontend accessible
) else (
    echo ⚠️  Frontend not accessible
)
echo.

REM Display results
echo ========================================
echo    DEPLOYMENT COMPLETE
echo ========================================
echo.
echo 🌐 Frontend: http://anoudjob.local
echo 🔌 Backend API: http://localhost:3234/api
echo 📊 Health Check: http://localhost:3234/health
echo.
echo 📁 Files Location:
echo    Backend: %BACKEND_PATH%
echo    Frontend: %FRONTEND_PATH%
echo    Logs: %LOGS_PATH%
echo.
echo 🔧 Configuration Files:
echo    Apache: %XAMPP_PATH%\apache\conf\extra\httpd-vhosts.conf
echo    Environment: %BACKEND_PATH%\.env
echo.
echo 📋 Next Steps:
echo 1. Edit %BACKEND_PATH%\.env with your database settings
echo 2. Start MongoDB service
echo 3. Test the website at http://anoudjob.local
echo 4. Check logs in %LOGS_PATH%
echo.
echo ⚠️  Important Notes:
echo - Make sure MongoDB is running
echo - Check firewall settings for port 3234
echo - Monitor logs for any errors
echo.
pause
