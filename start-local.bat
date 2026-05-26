@echo off
setlocal
cd /d "%~dp0"

call :ensure_node
if errorlevel 1 goto :end

call npm run setup
if errorlevel 1 goto :fail

call npm run dev
goto :end

:ensure_node
set "MIN_NODE_MAJOR=20"
set "NODE_MAJOR="

where node >nul 2>nul
if errorlevel 1 goto :install_node

for /f %%V in ('node -p "parseInt(process.versions.node.split('.')[0], 10)" 2^>nul') do set "NODE_MAJOR=%%V"
if not defined NODE_MAJOR goto :install_node

if %NODE_MAJOR% GEQ %MIN_NODE_MAJOR% exit /b 0

echo Node.js %MIN_NODE_MAJOR% or newer is required. Current major version: %NODE_MAJOR%
goto :install_node

:install_node
echo.
echo Installing Node.js LTS with Windows Package Manager...
where winget >nul 2>nul
if errorlevel 1 goto :manual_node_install

winget install --id OpenJS.NodeJS.LTS --exact --source winget
if errorlevel 1 goto :manual_node_install

call :refresh_path

set "NODE_MAJOR="
where node >nul 2>nul
if errorlevel 1 goto :restart_needed

for /f %%V in ('node -p "parseInt(process.versions.node.split('.')[0], 10)" 2^>nul') do set "NODE_MAJOR=%%V"
if not defined NODE_MAJOR goto :restart_needed
if %NODE_MAJOR% GEQ %MIN_NODE_MAJOR% exit /b 0

:restart_needed
echo.
echo Node.js was installed, but this window cannot see it yet.
echo Close this window and double-click start-local.bat again.
pause
exit /b 1

:manual_node_install
echo.
echo Could not install Node.js automatically.
echo A browser window will open. Install the LTS version of Node.js, then run this file again.
start "" "https://nodejs.org/en/download"
pause
exit /b 1

:refresh_path
set "MachinePath="
set "UserPath="
for /f "tokens=2,*" %%A in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v Path 2^>nul ^| find /i "Path"') do set "MachinePath=%%B"
for /f "tokens=2,*" %%A in ('reg query "HKCU\Environment" /v Path 2^>nul ^| find /i "Path"') do set "UserPath=%%B"
set "PATH=%MachinePath%;%UserPath%"
exit /b 0

:fail
echo.
echo Setup failed. Check the messages above.
pause
exit /b 1

:end
