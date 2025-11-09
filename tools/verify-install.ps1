param([string]$AppName="StreamDachi")
$desktop = [Environment]::GetFolderPath('Desktop')
$lnk = Join-Path $desktop "$AppName.lnk"
if (Test-Path $lnk) {
  $w = New-Object -ComObject WScript.Shell
  $s = $w.CreateShortcut($lnk)
  $wd = $s.WorkingDirectory
  Write-Host "[OK] Found shortcut working dir:" $wd
  foreach ($p in "run.cmd","run-hidden.vbs","app.ico","node\node.exe","server\dist\index.js","client\dist\index.html") {
    $full = Join-Path $wd $p
    Write-Host ("{0} {1}" -f ((Test-Path $full) ? "[OK]" : "[MISSING]"), $p)
  }
} else {
  Write-Host "[WARN] Desktop shortcut not found; run tools\desktop-shortcut-fix.ps1"
}
