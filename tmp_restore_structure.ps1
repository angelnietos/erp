
$domains = @("audit", "billing", "budget", "clients", "dashboard", "delivery", "events", "fleet", "identity", "inventory", "projects", "receipts", "rentals", "reports", "services", "settings", "verifactu")

# 1. Re-create tech categories
@("libs/browser/feature", "libs/browser/data-access", "libs/browser/shell", "libs/node/backend", "libs/isomorphic/core") | ForEach-Object {
    if (!(Test-Path $_)) { New-Item -ItemType Directory -Path $_ -Force | Out-Null }
}

# 2. Re-migrate domains back
foreach ($dom in $domains) {
    # Move Feature back
    if (Test-Path "libs/$dom/feature") {
        New-Item -ItemType Directory -Path "libs/browser/feature/$dom" -Force | Out-Null
        Move-Item -Path "libs/$dom/feature" -Destination "libs/browser/feature/$dom/" -Force
    }
    # Move Data-Access back
    if (Test-Path "libs/$dom/data-access") {
        New-Item -ItemType Directory -Path "libs/browser/data-access/$dom" -Force | Out-Null
        Move-Item -Path "libs/$dom/data-access" -Destination "libs/browser/data-access/$dom/" -Force
    }
    # Move Shell back
    if (Test-Path "libs/$dom/shell") {
        New-Item -ItemType Directory -Path "libs/browser/shell/$dom" -Force | Out-Null
        Move-Item -Path "libs/$dom/shell" -Destination "libs/browser/shell/$dom/" -Force
    }
    # Move Backend back
    if (Test-Path "libs/$dom/backend") {
        New-Item -ItemType Directory -Path "libs/node/backend/$dom" -Force | Out-Null
        Move-Item -Path "libs/$dom/backend" -Destination "libs/node/backend/$dom/" -Force
    }
    # Move Domain back to Core
    if (Test-Path "libs/$dom/domain") {
        New-Item -ItemType Directory -Path "libs/isomorphic/core/$dom" -Force | Out-Null
        Move-Item -Path "libs/$dom/domain" -Destination "libs/isomorphic/core/$dom/core" -Force
    }
    
    # Cleanup domain folder if empty
    if (Test-Path "libs/$dom") {
        $files = Get-ChildItem -Path "libs/$dom"
        if ($files.Count -eq 0) {
            Remove-Item -Path "libs/$dom" -Force
        }
    }
}

# 3. Restore Shared (This is a bit more complex, let's try to identify where they came from)
if (Test-Path "libs/shared") {
    # We moved from browser/shared, isomorphic/shared, node/shared to libs/shared
    # Let's put common ones back where they usually go
    $sharedFolders = Get-ChildItem -Path "libs/shared"
    foreach ($sf in $sharedFolders) {
        if ($sf.Name -match "ui-kit|ui-shell|data-access") {
            if (!(Test-Path "libs/browser/shared")) { New-Item -ItemType Directory -Path "libs/browser/shared" -Force | Out-Null }
            Move-Item -Path $sf.FullName -Destination "libs/browser/shared/" -Force
        } elseif ($sf.Name -match "utils|model|config|events") {
            if (!(Test-Path "libs/isomorphic/shared")) { New-Item -ItemType Directory -Path "libs/isomorphic/shared" -Force | Out-Null }
            Move-Item -Path $sf.FullName -Destination "libs/isomorphic/shared/" -Force
        } else {
            if (!(Test-Path "libs/node/shared")) { New-Item -ItemType Directory -Path "libs/node/shared" -Force | Out-Null }
            Move-Item -Path $sf.FullName -Destination "libs/node/shared/" -Force
        }
    }
    Remove-Item -Path "libs/shared" -Force
}

Write-Host "Restoration of original structure completed."
