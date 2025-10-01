@echo off
echo ================================================================
echo Stopping eKYC Docker Containers
echo ================================================================
echo.

docker-compose -f docker-compose-web.yml down

echo.
echo Containers stopped successfully!
echo.
pause
