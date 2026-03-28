$modules = @("clients", "inventory", "delivery", "billing", "fleet", "identity", "rentals", "verifactu")

foreach ($mod in $modules) {
    $srcDir = "apps\backend\src\modules\$mod"
    $destDir = "libs\$mod\backend\src\lib"
    $indexFile = "libs\$mod\backend\src\index.ts"
    $moduleFile = "$destDir\$mod.module.ts"
    $oldNxFile = "$destDir\$mod-backend.module.ts"

    if (Test-Path $srcDir) {
        Write-Host "Migrating $mod..."
        
        # Move all contents
        Move-Item -Path "$srcDir\*" -Destination "$destDir\" -Force

        # Update index.ts to point to the correct module file
        if (Test-Path $indexFile) {
            $indexContent = Get-Content $indexFile -Raw
            $indexContent = $indexContent -replace "\./lib/$mod-backend\.module", "./lib/$mod.module"
            Set-Content -Path $indexFile -Value $indexContent
        }

        # Remove the Nx generated backend module if it exists
        if (Test-Path $oldNxFile) {
            Remove-Item -Path $oldNxFile -Force
        }

        # Fix the relative import of SharedInfrastructureModule
        if (Test-Path $moduleFile) {
            $modContent = Get-Content $moduleFile -Raw
            $modContent = $modContent -replace "\.\./\.\./shared/infrastructure", "@josanz-erp/shared-infrastructure"
            $modContent = $modContent -replace "\.\./\.\./shared.*", "@josanz-erp/shared-infrastructure';"
            Set-Content -Path $moduleFile -Value $modContent
        }
    } else {
        Write-Host "Directory $srcDir not found."
    }
}
