$ErrorActionPreference = 'Stop'
Set-Location 'c:\Users\Administrator\Desktop\poker-timer'

$ts = Get-Date -Format 'yyyyMMdd_HHmmss'
$pub = "poker-timer-v$ts"

if (Test-Path $pub) { Remove-Item $pub -Recurse -Force }
New-Item -ItemType Directory -Path $pub | Out-Null

Write-Host '[1/4] 复制 dist...' -ForegroundColor Cyan
Copy-Item 'dist' -Destination (Join-Path $pub 'dist') -Recurse

Write-Host '[2/4] 复制 node_modules (这步较慢)...' -ForegroundColor Cyan
Copy-Item 'node_modules' -Destination (Join-Path $pub 'node_modules') -Recurse

Write-Host '[3/4] 复制脚本和文档...' -ForegroundColor Cyan
Copy-Item 'start-server.bat' -Destination $pub
Copy-Item 'build-release.bat' -Destination $pub
Copy-Item 'package.json' -Destination $pub
Copy-Item 'LAN-USAGE.md' -Destination $pub

Write-Host '[4/4] 压缩成 zip...' -ForegroundColor Cyan
$zip = "$pub.zip"
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path $pub -DestinationPath $zip -CompressionLevel Optimal

$zipInfo = Get-Item $zip
$sizeMB = [math]::Round($zipInfo.Length / 1MB, 2)

Write-Host ''
Write-Host '======== 打包完成 ========' -ForegroundColor Green
Write-Host "发布目录: $pub"
Write-Host "压缩包:   $zip"
Write-Host "大小:     $sizeMB MB"
Write-Host ''
Write-Host '复制 zip 到使用电脑，解压后双击 start-server.bat 即可' -ForegroundColor Cyan
