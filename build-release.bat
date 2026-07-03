@echo off
chcp 65001 >nul
title 打包发布版本

echo ========================================
echo   打包发布版本 (含 node_modules)
echo ========================================
echo.

:: 切到脚本所在目录
cd /d "%~dp0"

:: 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
  echo [错误] 未检测到 Node.js
  pause
  exit /b 1
)

:: 1. 安装依赖
if not exist "node_modules\.package-lock.json" (
  echo [1/4] 安装依赖...
  call npm install --no-audit --no-fund
  if %errorlevel% neq 0 (
    echo [错误] 依赖安装失败
    pause
    exit /b 1
  )
) else (
  echo [1/4] 依赖已安装
)

:: 2. 构建最新版本
echo [2/4] 构建最新版本...
call npm run build
if %errorlevel% neq 0 (
  echo [错误] 构建失败
  pause
  exit /b 1
)

:: 3. 创建临时发布目录
echo [3/4] 准备发布包...
set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set PUB_DIR=poker-timer-v%TIMESTAMP%

if exist "%PUB_DIR%" rmdir /s /q "%PUB_DIR%"
mkdir "%PUB_DIR%"

:: 复制必要文件
xcopy /e /i /q "dist" "%PUB_DIR%\dist" >nul
xcopy /e /i /q "node_modules" "%PUB_DIR%\node_modules" >nul
copy "start-server.bat" "%PUB_DIR%\" >nul
copy "package.json" "%PUB_DIR%\" >nul
copy "LAN-USAGE.md" "%PUB_DIR%\" >nul

:: 4. 打包成 zip
echo [4/4] 压缩...
where powershell >nul 2>nul
if %errorlevel% == 0 (
  powershell -Command "Compress-Archive -Path '%PUB_DIR%' -DestinationPath '%PUB_DIR%.zip' -Force"
  if %errorlevel% == 0 (
    echo.
    echo ========================================
    echo   打包完成！
    echo.
    echo   发布目录：%PUB_DIR%
    echo   压缩包：  %PUB_DIR%.zip
    echo.
    echo   复制 %PUB_DIR%.zip 到 U 盘/网盘
    echo   在使用电脑解压后双击 start-server.bat 即可
    echo ========================================
  ) else (
    echo   压缩失败，请手动压缩 %PUB_DIR% 目录
  )
) else (
  echo   PowerShell 不可用，请手动压缩 %PUB_DIR% 目录
)

echo.
pause
