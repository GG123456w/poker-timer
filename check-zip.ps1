Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = 'c:\Users\Administrator\Desktop\poker-timer\poker-timer-v20260703_123330.zip'
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)

Write-Host '=== Top 20 entries ===' -ForegroundColor Cyan
$zip.Entries |
  Select-Object -First 20 |
  ForEach-Object {
    [PSCustomObject]@{
      'SizeKB' = [math]::Round($_.Length / 1KB, 1)
      Name = $_.FullName
    }
  } | Format-Table -AutoSize

$totalEntries = $zip.Entries.Count
$totalUncompressed = ($zip.Entries | Measure-Object -Property Length -Sum).Sum / 1MB
$totalCompressed = (Get-Item $zipPath).Length / 1MB

Write-Host ''
Write-Host '=== Summary ===' -ForegroundColor Green
Write-Host ("Total files: " + $totalEntries)
Write-Host ("Compressed: " + [math]::Round($totalCompressed, 2) + " MB")
Write-Host ("Uncompressed: " + [math]::Round($totalUncompressed, 2) + " MB")

$zip.Dispose()
