@echo off
echo ================================================================
echo Rebuilding eKYC Docker Images
echo ================================================================
echo.

echo Stopping existing containers...
docker-compose -f docker-compose-web.yml down

echo.
echo Rebuilding images (no cache)...
docker-compose -f docker-compose-web.yml build --no-cache

echo.
echo Starting containers...
docker-compose -f docker-compose-web.yml up -d

echo.
echo ================================================================
echo Rebuild complete!
echo ================================================================
echo.
echo Web App: http://localhost:3000
echo API Backend: http://localhost:8000
echo.
pause
