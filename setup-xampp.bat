@echo off
REM XAMPP Setup Script for Anoud Job Website
REM This script sets up the complete XAMPP environment

echo ========================================
echo    XAMPP Setup Script
echo    Anoud Job Website
echo ========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Running as Administrator
) else (
    echo ❌ Please run as Administrator
    echo Right-click and select "Run as administrator"
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
    echo.
    echo Please install XAMPP first:
    echo 1. Download from https://www.apachefriends.org/
    echo 2. Install with Apache, MySQL, PHP, and phpMyAdmin
    echo 3. Run this script again
    pause
    exit /b 1
)

echo ✅ XAMPP found
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ Node.js not found
    echo.
    echo Please install Node.js first:
    echo 1. Download from https://nodejs.org/
    echo 2. Install with npm package manager
    echo 3. Run this script again
    pause
    exit /b 1
)

echo ✅ Node.js found
node --version
echo.

REM Check if MongoDB is installed
mongo --version >nul 2>&1
if %errorLevel% neq 0 (
    echo ⚠️  MongoDB not found
    echo.
    echo MongoDB is required for the database.
    echo Please install MongoDB Community Server:
    echo 1. Download from https://www.mongodb.com/try/download/community
    echo 2. Install and configure as a Windows Service
    echo 3. Run this script again
    echo.
    echo Or use MongoDB Atlas (cloud) and update the .env file
    pause
    exit /b 1
)

echo ✅ MongoDB found
mongo --version
echo.

REM Create directories
echo 📁 Creating directories...
if not exist "%BACKEND_PATH%" mkdir "%BACKEND_PATH%"
if not exist "%FRONTEND_PATH%" mkdir "%FRONTEND_PATH%"
if not exist "%LOGS_PATH%" mkdir "%LOGS_PATH%"
if not exist "%XAMPP_PATH%\nodejs" mkdir "%XAMPP_PATH%\nodejs"
echo ✅ Directories created
echo.

REM Stop existing services
echo 🛑 Stopping existing services...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im httpd.exe >nul 2>&1
net stop "Apache2.4" >nul 2>&1
echo ✅ Services stopped
echo.

REM Copy backend files
echo 📋 Copying backend files...
xcopy /E /I /Y "backend\*" "%BACKEND_PATH%\"
echo ✅ Backend files copied
echo.

REM Copy XAMPP-specific files
echo 🔧 Configuring XAMPP-specific files...
copy /Y "xampp-server.js" "%BACKEND_PATH%\server.js"
copy /Y "xampp-package.json" "%BACKEND_PATH%\package.json"
echo ✅ XAMPP files configured
echo.

REM Setup environment file
echo 🔐 Setting up environment...
if exist ".env" (
    copy /Y ".env" "%BACKEND_PATH%\.env"
    echo ✅ Environment file copied
) else (
    copy /Y "xampp-env.example" "%BACKEND_PATH%\.env"
    echo ✅ Environment template copied
    echo.
    echo ⚠️  IMPORTANT: Please edit %BACKEND_PATH%\.env
    echo    - Set your MongoDB connection string
    echo    - Change JWT secrets
    echo    - Configure other settings as needed
    echo.
)
echo.

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd /d "%BACKEND_PATH%"
call npm install
if %errorLevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    echo Please check the error messages above
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
    echo Please check the error messages above
    pause
    exit /b 1
)

call npm run build
if %errorLevel% neq 0 (
    echo ❌ Failed to build frontend
    echo Please check the error messages above
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
echo ✅ Apache virtual hosts configured
echo.

REM Backup original httpd.conf
if not exist "%XAMPP_PATH%\apache\conf\httpd.conf.backup" (
    copy /Y "%XAMPP_PATH%\apache\conf\httpd.conf" "%XAMPP_PATH%\apache\conf\httpd.conf.backup"
    echo ✅ Apache httpd.conf backed up
)

REM Enable required Apache modules
echo 🔧 Enabling Apache modules...
findstr /C:"LoadModule rewrite_module" "%XAMPP_PATH%\apache\conf\httpd.conf" >nul
if %errorLevel% neq 0 (
    echo LoadModule rewrite_module modules/mod_rewrite.so >> "%XAMPP_PATH%\apache\conf\httpd.conf"
    echo ✅ mod_rewrite enabled
)

findstr /C:"LoadModule headers_module" "%XAMPP_PATH%\apache\conf\httpd.conf" >nul
if %errorLevel% neq 0 (
    echo LoadModule headers_module modules/mod_headers.so >> "%XAMPP_PATH%\apache\conf\httpd.conf"
    echo ✅ mod_headers enabled
)

findstr /C:"LoadModule proxy_module" "%XAMPP_PATH%\apache\conf\httpd.conf" >nul
if %errorLevel% neq 0 (
    echo LoadModule proxy_module modules/mod_proxy.so >> "%XAMPP_PATH%\apache\conf\httpd.conf"
    echo ✅ mod_proxy enabled
)

findstr /C:"LoadModule proxy_http_module" "%XAMPP_PATH%\apache\conf\httpd.conf" >nul
if %errorLevel% neq 0 (
    echo LoadModule proxy_http_module modules/mod_proxy_http.so >> "%XAMPP_PATH%\apache\conf\httpd.conf"
    echo ✅ mod_proxy_http enabled
)

REM Include virtual hosts
findstr /C:"Include conf/extra/httpd-vhosts.conf" "%XAMPP_PATH%\apache\conf\httpd.conf" >nul
if %errorLevel% neq 0 (
    echo Include conf/extra/httpd-vhosts.conf >> "%XAMPP_PATH%\apache\conf\httpd.conf"
    echo ✅ Virtual hosts included
)
echo ✅ Apache modules configured
echo.

REM Configure hosts file
echo 🌐 Configuring hosts file...
findstr /C:"anoudjob.local" C:\Windows\System32\drivers\etc\hosts >nul
if %errorLevel% neq 0 (
    echo 127.0.0.1 anoudjob.local >> C:\Windows\System32\drivers\etc\hosts
    echo 127.0.0.1 www.anoudjob.local >> C:\Windows\System32\drivers\etc\hosts
    echo ✅ Hosts file updated
) else (
    echo ✅ Hosts file already configured
)
echo.

REM Start MongoDB service
echo 🚀 Starting MongoDB service...
net start MongoDB >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ MongoDB service started
) else (
    echo ⚠️  MongoDB service not found or already running
    echo Please make sure MongoDB is running manually
)
echo.

REM Start XAMPP services
echo 🚀 Starting XAMPP services...
net start "Apache2.4" >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Apache service started
) else (
    echo ⚠️  Apache service not found, trying to start manually...
    "%XAMPP_PATH%\apache\bin\httpd.exe" -k start
    if %errorLevel% == 0 (
        echo ✅ Apache started manually
    ) else (
        echo ❌ Failed to start Apache
    )
)
echo.

REM Wait for services to start
echo ⏳ Waiting for services to start...
timeout /t 5 /nobreak >nul
echo.

REM Test deployment
echo 🧪 Testing deployment...
echo Testing backend health endpoint...
curl -s http://localhost:3234/health >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Backend health check passed
) else (
    echo ⚠️  Backend health check failed (this is normal if backend is not running yet)
)

echo Testing Apache...
curl -s http://localhost >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Apache is running
) else (
    echo ❌ Apache is not responding
)
echo.

REM Display results
echo ========================================
echo    XAMPP SETUP COMPLETE
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
echo 2. Start the Node.js backend: cd %BACKEND_PATH% && npm start
echo 3. Test the website at http://anoudjob.local
echo 4. Check logs in %LOGS_PATH%
echo.
echo 🚀 To start the backend server:
echo    cd %BACKEND_PATH%
echo    npm start
echo.
echo ⚠️  Important Notes:
echo - Make sure MongoDB is running
echo - Check firewall settings for port 3234
echo - Monitor logs for any errors
echo - The backend server needs to be started manually
echo.
echo Press any key to exit...
pause >nul
