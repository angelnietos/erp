# Script to update paths in project.json and jest.config.cts for moved libs

# Define the mapping of old to new paths
$pathMappings = @{
    "libs/clients/api" = "libs/isomorphic/api/clients/api"
    "libs/inventory/api" = "libs/isomorphic/api/inventory/api"
    "libs/rentals/api" = "libs/isomorphic/api/rentals/api"
    "libs/fleet/api" = "libs/isomorphic/api/fleet/api"
    "libs/budget/api" = "libs/isomorphic/api/budget/api"
    "libs/billing/backend" = "libs/node/backend/billing/backend"
    "libs/budget/backend" = "libs/node/backend/budget/backend"
    "libs/clients/backend" = "libs/node/backend/clients/backend"
    "libs/delivery/backend" = "libs/node/backend/delivery/backend"
    "libs/fleet/backend" = "libs/node/backend/fleet/backend"
    "libs/inventory/backend" = "libs/node/backend/inventory/backend"
    "libs/rentals/backend" = "libs/node/backend/rentals/backend"
    "libs/billing/data-access" = "libs/browser/data-access/billing/data-access"
    "libs/billing/feature" = "libs/browser/feature/billing/feature"
    "libs/billing/shell" = "libs/browser/shell/billing/shell"
    "libs/budget/data-access" = "libs/browser/data-access/budget/data-access"
    "libs/budget/feature" = "libs/browser/feature/budget/feature"
    "libs/budget/shell" = "libs/browser/shell/budget/shell"
    "libs/clients/data-access" = "libs/browser/data-access/clients/data-access"
    "libs/clients/feature" = "libs/browser/feature/clients/feature"
    "libs/clients/shell" = "libs/browser/shell/clients/shell"
    "libs/delivery/data-access" = "libs/browser/data-access/delivery/data-access"
    "libs/delivery/feature" = "libs/browser/feature/delivery/feature"
    "libs/delivery/shell" = "libs/browser/shell/delivery/shell"
    "libs/fleet/data-access" = "libs/browser/data-access/fleet/data-access"
    "libs/fleet/feature" = "libs/browser/feature/fleet/feature"
    "libs/fleet/shell" = "libs/browser/shell/fleet/shell"
    "libs/inventory/data-access" = "libs/browser/data-access/inventory/data-access"
    "libs/inventory/feature" = "libs/browser/feature/inventory/feature"
    "libs/inventory/shell" = "libs/browser/shell/inventory/shell"
    "libs/rentals/data-access" = "libs/browser/data-access/rentals/data-access"
    "libs/rentals/feature" = "libs/browser/feature/rentals/feature"
    "libs/rentals/shell" = "libs/browser/shell/rentals/shell"
    "libs/budget/core" = "libs/isomorphic/core/budget/core"
    "libs/clients/core" = "libs/isomorphic/core/clients/core"
    "libs/delivery/core" = "libs/isomorphic/core/delivery/core"
    "libs/fleet/core" = "libs/isomorphic/core/fleet/core"
    "libs/inventory/core" = "libs/isomorphic/core/inventory/core"
    "libs/rentals/core" = "libs/isomorphic/core/rentals/core"
}

foreach ($oldPath in $pathMappings.Keys) {
    $newPath = $pathMappings[$oldPath]
    $projectJsonPath = "$newPath/project.json"
    $jestConfigPath = "$newPath/jest.config.cts"

    if (Test-Path $projectJsonPath) {
        Write-Host "Updating $projectJsonPath"

        $content = Get-Content $projectJsonPath -Raw

        # Update sourceRoot
        $content = $content -replace [regex]::Escape("sourceRoot"": ""$oldPath/src"), "sourceRoot"": ""$newPath/src"

        # Update outputPath
        $content = $content -replace [regex]::Escape("outputPath"": ""dist/$oldPath"), "outputPath"": ""dist/$newPath"

        # Update main
        $content = $content -replace [regex]::Escape("main"": ""$oldPath/src/index.ts"), "main"": ""$newPath/src/index.ts"

        # Update tsConfig
        $content = $content -replace [regex]::Escape("tsConfig"": ""$oldPath/tsconfig.lib.json"), "tsConfig"": ""$newPath/tsconfig.lib.json"

        # Update assets
        $content = $content -replace [regex]::Escape("assets"": [\s]*""$oldPath/\*\.md"), "assets"": [`r`n          ""$newPath/*.md"

        # Update jestConfig
        $content = $content -replace [regex]::Escape("jestConfig"": ""$oldPath/jest.config.cts"), "jestConfig"": ""$newPath/jest.config.cts"

        Set-Content -Path $projectJsonPath -Value $content
    }

    if (Test-Path $jestConfigPath) {
        Write-Host "Updating $jestConfigPath"

        $content = Get-Content $jestConfigPath -Raw

        # Update coverageDirectory
        $content = $content -replace [regex]::Escape("coverageDirectory: '../../../coverage/$oldPath'"), "coverageDirectory: '../../../coverage/$newPath'"

        Set-Content -Path $jestConfigPath -Value $content
    }
}

Write-Host "Path updates completed."