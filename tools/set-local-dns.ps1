param(
<<<<<<< HEAD
  [Parameter(Position=0)][string]$HostName = "stream.g",
  [Parameter(Position=1)][string]$Address = "127.0.0.1"
)
$principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Write-Host "[ERROR] Run as Administrator."
  exit 2
}
$hosts = "$env:SystemRoot\System32\drivers\etc\hosts"
if (-not (Test-Path $hosts)) { Write-Host "[ERROR] Hosts file not found."; exit 3 }
$backup = "$hosts.bak.streamdachi"
if (-not (Test-Path $backup)) { Copy-Item $hosts $backup -Force }

$entry = "$Address`t$HostName"
$content = Get-Content $hosts -Raw -ErrorAction Stop
$lines = $content -split "`r?`n"
$lines = $lines | Where-Object { $_ -notmatch "(?i)^\s*[^#].*\b$([regex]::Escape($HostName))\b" }
if ($lines.Count -gt 0 -and $lines[-1] -ne "") { $lines += "" }
$lines += $entry
Set-Content -Path $hosts -Value ($lines -join "`r`n") -Encoding ASCII
Write-Host "[OK] Mapped $HostName -> $Address"
=======
  [string]$HostName = "stream.g",
  [string]$Address = "127.0.0.1"
)
$hosts = "$env:SystemRoot\System32\drivers\etc\hosts"
$entry = "$Address`t$HostName"
$backup = "$hosts.bak.twitchmind"
if (-not (Test-Path $backup)) { Copy-Item $hosts $backup -Force }

# Remove existing lines for HostName
$content = Get-Content $hosts -Raw -ErrorAction Stop
$lines = $content -split "`r?`n"
$lines = $lines | Where-Object { $_ -notmatch "^\s*(#.*)?$" -or $_ -notmatch "\b$([regex]::Escape($HostName))\b" }
# Ensure a blank line before append
$lines += ""
$lines += $entry
Set-Content -Path $hosts -Value ($lines -join "`r`n") -Encoding ASCII
Write-Host "Mapped $HostName -> $Address in hosts."
>>>>>>> 31dbe52 (2025-11-09 16:21:47 sync)
