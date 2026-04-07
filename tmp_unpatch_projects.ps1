
$files = Get-ChildItem -Path libs -Filter project.json -Recurse | Select-Object -ExpandProperty FullName
$files += "C:\Users\amuni\Desktop\josanz-proyect\josanz-erp\tsconfig.base.json"

foreach ($file in $files) {
    Write-Host "Un-Patching file: $file"
    $content = Get-Content $file -Raw
    
    # Identify which domain we are in if it's a project.json
    if ($file -match "libs\\browser\\feature\\([^\\]+)") {
        $dom = $matches[1]
        # Feature: libs/$dom/feature -> libs/browser/feature/$dom/feature
        $content = $content -replace "libs/$dom/feature", "libs/browser/feature/$dom/feature"
    } elseif ($file -match "libs\\browser\\data-access\\([^\\]+)") {
        $dom = $matches[1]
        # Data-access: libs/$dom/data-access -> libs/browser/data-access/$dom/data-access
        $content = $content -replace "libs/$dom/data-access", "libs/browser/data-access/$dom/data-access"
    } elseif ($file -match "libs\\browser\\shell\\([^\\]+)") {
        $dom = $matches[1]
        # Shell: libs/$dom/shell -> libs/browser/shell/$dom/shell
        $content = $content -replace "libs/$dom/shell", "libs/browser/shell/$dom/shell"
    } elseif ($file -match "libs\\node\\backend\\([^\\]+)") {
        $dom = $matches[1]
        # Backend: libs/$dom/backend -> libs/node/backend/$dom/backend
        $content = $content -replace "libs/$dom/backend", "libs/node/backend/$dom/backend"
    } elseif ($file -match "libs\\isomorphic\\core\\([^\\]+)") {
        $dom = $matches[1]
        # Core: libs/$dom/domain -> libs/isomorphic/core/$dom/core
        $content = $content -replace "libs/$dom/domain", "libs/isomorphic/core/$dom/core"
    }
    
    # Process tsconfig.base.json path mappings (Broadly)
    if ($file -match "tsconfig.base.json") {
        # This is more complex, let's use the patterns we know
        $content = $content -replace "libs/audit/feature", "libs/browser/feature/audit/feature"
        $content = $content -replace "libs/billing/feature", "libs/browser/feature/billing/feature"
        $content = $content -replace "libs/budget/feature", "libs/browser/feature/budget/feature"
        $content = $content -replace "libs/clients/feature", "libs/browser/feature/clients/feature"
        $content = $content -replace "libs/dashboard/feature", "libs/browser/feature/dashboard/feature"
        $content = $content -replace "libs/delivery/feature", "libs/browser/feature/delivery/feature"
        $content = $content -replace "libs/events/feature", "libs/browser/feature/events/feature"
        $content = $content -replace "libs/fleet/feature", "libs/browser/feature/fleet/feature"
        $content = $content -replace "libs/identity/feature", "libs/browser/feature/identity/feature"
        $content = $content -replace "libs/inventory/feature", "libs/browser/feature/inventory/feature"
        $content = $content -replace "libs/projects/feature", "libs/browser/feature/projects/feature"
        $content = $content -replace "libs/receipts/feature", "libs/browser/feature/receipts/feature"
        $content = $content -replace "libs/rentals/feature", "libs/browser/feature/rentals/feature"
        $content = $content -replace "libs/reports/feature", "libs/browser/feature/reports/feature"
        $content = $content -replace "libs/services/feature", "libs/browser/feature/services/feature"
        $content = $content -replace "libs/settings/feature", "libs/browser/feature/settings/feature"
        $content = $content -replace "libs/verifactu/feature", "libs/browser/feature/verifactu/feature"
        
        $content = $content -replace "@josanz-erp/shared-utils"": \[ ""libs/shared/utils", "@josanz-erp/shared-utils"": [ ""libs/isomorphic/shared/utils"
        # ... Other shared mappings ...
    }

    Set-Content -Path $file -Value $content
}

# Fix depths back
$files = Get-ChildItem -Path libs -Recurse -Include "tsconfig.json", "tsconfig.lib.json", "tsconfig.spec.json", "jest.config.cts", "jest.config.ts" | Select-Object -ExpandProperty FullName
foreach ($file in $files) {
  $content = Get-Content $file -Raw
  # Identity Feature etc. (Depth 5)
  if ($file -match "libs\\browser\\(feature|data-access|shell)\\([^\\]+)\\(feature|data-access|shell)\\(tsconfig|jest\.config)") {
    # It has libs/browser/feature/identity/feature/tsconfig.json (5 levels)
    $content = $content -replace "\.\./\.\./\.\./", "../../../../../"
    Set-Content -Path $file -Value $content
  }
}

Write-Host "Un-patching completed."
