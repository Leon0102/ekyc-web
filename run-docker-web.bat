@echo off
echo ================================================================
echo eKYC Docker - Full Stack (API + Web App)
echo ================================================================
echo.

REM Check if Docker is running
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker not found!
    echo.
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)

echo Docker:
docker --version
echo.

REM Check for model weights
if not exist "verification_models\weights\vggface2_weights.pt" (
    echo.
    echo ================================================================
    echo WARNING: Model weights not found!
    echo ================================================================
    echo.
    echo The API will not work without model weights.
    echo Please download from:
    echo   https://drive.google.com/drive/folders/1-pEMok04-UqpeCi_yscUcIA6ytvxhvkG
    echo.
    echo Place in: verification_models\weights\
    echo.
    set /p continue="Continue anyway? (y/n): "
    if /i not "%continue%"=="y" (
        exit /b 0
    )
)

echo ================================================================
echo Building Docker Images
echo ================================================================
echo.
echo This may take 10-15 minutes on first run...
echo - Building API backend image (Python + PyTorch)
echo - Building Web app image (Node + Nginx)
echo.

docker-compose -f docker-compose-web.yml build

if errorlevel 1 (
    echo.
    echo ERROR: Docker build failed!
    pause
    exit /b 1
)

echo.
echo ================================================================
echo Starting Containers
echo ================================================================
echo.

docker-compose -f docker-compose-web.yml up -d

if errorlevel 1 (
    echo.
    echo ERROR: Failed to start containers!
    pause
    exit /b 1
)

echo.
echo ================================================================
echo SUCCESS! Containers are running
echo ================================================================
echo.
echo Web App: http://localhost:3000
echo API Backend: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
echo To view logs:
echo   docker-compose -f docker-compose-web.yml logs -f
echo.
echo To stop containers:
echo   docker-compose -f docker-compose-web.yml down
echo.
echo Opening web app in browser...
timeout /t 3 /nobreak >nul
start http://localhost:3000
echo.
pause
