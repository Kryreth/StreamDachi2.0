param(
  [string]$AppName = "StreamDachi",
  [string]$ShellRel = "shell\TwitchMindShell.exe",
  [string]$BatchRel = "run.cmd",
  [string]$IconRel  = "app.ico"
)
Add-Type -AssemblyName System.Windows.Forms
$dlg = New-Object System.Windows.Forms.FolderBrowserDialog
$dlg.Description = "Select the INSTALLED folder (the one containing run.cmd)"
if ($dlg.ShowDialog() -ne [System.Windows.Forms.DialogResult]::OK) { exit 1 }
$inst = $dlg.SelectedPath
if (-not (Test-Path (Join-Path $inst $BatchRel))) {
  Write-Host "[ERROR] This folder does not contain run.cmd: $inst"
  exit 2
}
$target = Join-Path $inst $ShellRel
if (-not (Test-Path $target)) { $target = Join-Path $inst $BatchRel }
$icon = Join-Path $inst $IconRel
$desktop = [Environment]::GetFolderPath('Desktop')
$startPrograms = Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs'

function New-OrUpdateShortcut([string]$lnkPath, [string]$targetPath, [string]$workingDir, [string]$iconPath) {
  $w = New-Object -ComObject WScript.Shell
  $s = $w.CreateShortcut($lnkPath)
  $s.TargetPath = $targetPath
  $s.WorkingDirectory = $workingDir
  if (Test-Path $iconPath) { $s.IconLocation = $iconPath }
  $s.WindowStyle = 1
  $s.Description = $AppName
  $s.Save()
}

$deskLnk = Join-Path $desktop "$AppName.lnk"
if (Test-Path $deskLnk) { Remove-Item $deskLnk -Force }
New-OrUpdateShortcut -lnkPath $deskLnk -targetPath $target -workingDir $inst -iconPath $icon

$smDir = Join-Path $startPrograms $AppName
if (-not (Test-Path $smDir)) { New-Item -ItemType Directory -Force -Path $smDir | Out-Null }
$smLnk = Join-Path $smDir "$AppName.lnk"
New-OrUpdateShortcut -lnkPath $smLnk -targetPath $target -workingDir $inst -iconPath $icon

$old = Join-Path $desktop "TwitchMind.lnk"
if (Test-Path $old) { Remove-Item $old -Force }
Write-Host "[DONE] Shortcuts updated."
