
# Restore all tsconfig and project.json depths back to 5 for deeply nested tech groups
$files = Get-ChildItem -Path libs -Recurse -Include "project.json", "tsconfig.json", "tsconfig.lib.json", "tsconfig.spec.json", "jest.config.cts", "jest.config.ts" | Select-Object -ExpandProperty FullName

foreach ($file in $files) {
    if ($file -match "libs\\(browser|node|isomorphic)\\(feature|data-access|shell|backend|core)\\([^\\]+)\\(feature|data-access|shell|backend|core)") {
        # Depth 5 identified
        $content = Get-Content $file -Raw
        # From 3 levels back to 5 levels (Or fix 3 to 5 if my unpatch didn't get it all)
        $content = $content -replace "\.\./\.\./\.\./", "../../../../../"
        Set-Content -Path $file -Value $content
        Write-Host "Restored depth for: $file"
    }
}

Write-Host "Depth restore completed."
