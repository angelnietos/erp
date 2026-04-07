
$domains = @("audit", "billing", "budget", "clients", "dashboard", "delivery", "events", "fleet", "identity", "inventory", "projects", "receipts", "rentals", "reports", "services", "settings", "verifactu")

# 1. Domain-specific migrations
foreach ($dom in $domains) {
    Write-Host "Migrating Domain: $dom"
    $targetDomainDir = "libs/$dom"
    if (!(Test-Path $targetDomainDir)) {
        New-Item -ItemType Directory -Path $targetDomainDir -Force | Out-Null
    }

    # Move Feature
    if (Test-Path "libs/browser/feature/$dom/feature") {
        Move-Item -Path "libs/browser/feature/$dom/feature" -Destination "libs/$dom/" -Force
    }
    # Move Data-Access
    if (Test-Path "libs/browser/data-access/$dom/data-access") {
        Move-Item -Path "libs/browser/data-access/$dom/data-access" -Destination "libs/$dom/" -Force
    }
    # Move Shell
    if (Test-Path "libs/browser/shell/$dom/shell") {
        Move-Item -Path "libs/browser/shell/$dom/shell" -Destination "libs/$dom/" -Force
    }
    # Move Backend (if exists in node/backend)
    if (Test-Path "libs/node/backend/$dom/backend") {
        Move-Item -Path "libs/node/backend/$dom/backend" -Destination "libs/$dom/" -Force
    }
    # Move Core to Domain (if exists in isomorphic/core)
    if (Test-Path "libs/isomorphic/core/$dom/core") {
        if (Test-Path "libs/$dom/domain") {
            Remove-Item -Path "libs/$dom/domain" -Recurse -Force
        }
        Move-Item -Path "libs/isomorphic/core/$dom/core" -Destination "libs/$dom/domain" -Force
    }
}

# 2. Shared migrations
if (!(Test-Path "libs/shared")) { New-Item -ItemType Directory -Path "libs/shared" -Force | Out-Null }

# Move browser/shared/* to libs/shared/*
if (Test-Path "libs/browser/shared") {
    Get-ChildItem -Path "libs/browser/shared" | ForEach-Object {
        Move-Item -Path $_.FullName -Destination "libs/shared/" -Force
    }
}
# Move isomorphic/shared/* to libs/shared/* (Merging folders if needed)
if (Test-Path "libs/isomorphic/shared") {
    Get-ChildItem -Path "libs/isomorphic/shared" | ForEach-Object {
        Move-Item -Path $_.FullName -Destination "libs/shared/" -Force
    }
}
# Move node/shared/* to libs/shared/*
if (Test-Path "libs/node/shared") {
    Get-ChildItem -Path "libs/node/shared" | ForEach-Object {
        Move-Item -Path $_.FullName -Destination "libs/shared/" -Force
    }
}

# 3. Cleanup empty category folders
@("libs/browser", "libs/isomorphic", "libs/node") | ForEach-Object {
    if (Test-Path $_) {
        Remove-Item -Path $_ -Recurse -Force
    }
}

Write-Host "Migration folders completed. Please update project.json and tsconfig.base.json next."
