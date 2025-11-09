param(
  [string]$AppName = "StreamDachi"
)
Add-Type -AssemblyName System.Windows.Forms
$dlg = New-Object System.Windows.Forms.FolderBrowserDialog
$dlg.Description = "Select the INSTALLED folder (the one containing run.cmd)"
if ($dlg.ShowDialog() -ne [System.Windows.Forms.DialogResult]::OK) { exit 1 }
$inst = $dlg.SelectedPath
$src = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "favicon.ico"
$dst = Join-Path $inst "client\dist\favicon.ico"
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $dst) | Out-Null
Copy-Item $src $dst -Force
Write-Host "[OK] Deployed favicon to:" $dst
