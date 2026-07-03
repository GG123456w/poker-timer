@echo off
chcp 65001 >nul
title 扑克盲注计时器 - 局域网启动

echo ========================================
echo   扑克盲注计时器 (局域网模式)
echo ========================================
echo.

:: 切到脚本所在目录
cd /d "%~dp0"

:: 1. 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
  echo [错误] 未检测到 Node.js，请先安装 Node.js 18+：
  echo   https://nodejs.org/
  echo   下载 LTS 版本，安装时全部默认即可
  echo.
  pause
  start https://nodejs.org/
  exit /b 1
)

:: 2. 检查依赖 - 优先用已打包的 node_modules
if exist "node_modules\.package-lock.json" (
  echo [1/4] 依赖已就绪（无需联网安装）
) else (
  echo [1/4] 首次运行，安装依赖（需要联网，2-3 分钟）...
  call npm install --no-audit --no-fund
  if %errorlevel% neq 0 (
    echo [错误] 依赖安装失败，请检查网络
    pause
    exit /b 1
  )
)

:: 3. 检查 dist - 优先用已打包的
if exist "dist\index.html" (
  echo [2/4] 已构建版本就绪（无需重新编译）
) else (
  echo [2/4] 首次运行，构建版本（1-2 分钟）...
  call npm run build
  if %errorlevel% neq 0 (
    echo [错误] 构建失败
    pause
    exit /b 1
  )
)

:: 4. 开放防火墙端口
echo [3/4] 配置防火墙...
netsh advfirewall firewall show rule name="PokerTimer-LAN" >nul 2>nul
if %errorlevel% neq 0 (
  netsh advfirewall firewall add rule name="PokerTimer-LAN" dir=in action=allow protocol=TCP localport=4173 >nul 2>nul
  if %errorlevel% == 0 (
    echo        防火墙已开放 4173 端口
  ) else (
    echo        [警告] 防火墙配置失败，请以管理员身份运行本脚本
  )
) else (
  echo        防火墙已配置
)

:: 5. 查本机 IP
echo [4/4] 启动服务...
echo.
setlocal enabledelayedexpansion
set FOUND=0
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
  set IP=%%a
  set IP=!IP:~1!
  echo   本机 IP：!IP!
  set FOUND=1
)
if !FOUND! == 0 (
  echo   [警告] 未找到本机 IP，请手动运行 ipconfig 查看
)

echo.
echo ========================================
echo   服务已启动！
echo.
echo   投屏电脑：http://localhost:4173
echo   局域网访问：http://本机IP:4173
echo   后台管理：http://本机IP:4173/#/admin
echo   默认账号：admin / admin888
echo.
echo   按 Ctrl+C 停止服务
echo ========================================
echo.

:: 6. 启动 serve（绑定 0.0.0.0 允许局域网访问）
npx serve dist -l 4173 -n
pause
