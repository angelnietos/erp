# Copia capturas Figma ya generadas (Antigravity / Playwright) al repo.
param(
  [string]$SourceDir = "$env:USERPROFILE\.gemini\antigravity\brain\d01463ea-2c6b-4745-80ee-eff86887a9f2",
  [string]$DestDir = "$PSScriptRoot\..\docs\figma-reference\screenshots"
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $SourceDir)) {
  Write-Error "No existe la carpeta origen: $SourceDir"
}

New-Item -ItemType Directory -Force -Path $DestDir | Out-Null

$patterns = @('figma_*.png', 'login_aftermath.png')
$copied = 0

foreach ($pattern in $patterns) {
  Get-ChildItem -Path $SourceDir -Filter $pattern -File -ErrorAction SilentlyContinue | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination (Join-Path $DestDir $_.Name) -Force
    $copied++
    Write-Host "Copied $($_.Name)"
  }
}

if ($copied -eq 0) {
  Write-Warning "No se encontraron PNG en $SourceDir"
} else {
  Write-Host "Listo: $copied archivo(s) en $DestDir"
}
