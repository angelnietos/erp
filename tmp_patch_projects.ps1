
$files = Get-ChildItem -Path libs -Filter project.json -Recurse | Select-Object -ExpandProperty FullName
$files += "C:\Users\amuni\Desktop\josanz-proyect\josanz-erp\tsconfig.base.json"

foreach ($file in $files) {
    Write-Host "Patching file: $file"
    $content = Get-Content $file -Raw

    # 1. Broad path segments (folders that were moved/merged)
    # Feature
    $content = $content -replace "libs/browser/feature/", "libs/"
    # Data-Access
    $content = $content -replace "libs/browser/data-access/", "libs/"
    # Shell
    $content = $content -replace "libs/browser/shell/", "libs/"
    # Backend
    $content = $content -replace "libs/node/backend/", "libs/"
    # Core to Domain
    $content = $content -replace "libs/isomorphic/core/([^/]+)/core", "libs/`$1/domain"
    
    # Shared Paths
    $content = $content -replace "libs/browser/shared/", "libs/shared/"
    $content = $content -replace "libs/isomorphic/shared/", "libs/shared/"
    $content = $content -replace "libs/node/shared/", "libs/shared/"

    # 2. Cleanup double libs (if any accidentally caused by -replace)
    $content = $content -replace "libs/libs/", "libs/"

    Set-Content -Path $file -Value $content
}

Write-Host "Project patching completed. Please perform nx reset next."
