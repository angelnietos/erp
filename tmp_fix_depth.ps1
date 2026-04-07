
# Patch all tsconfig and jest.config files in libs to have correct depth relative to root
$files = Get-ChildItem -Path libs -Recurse -Include "tsconfig.json", "tsconfig.lib.json", "tsconfig.spec.json", "jest.config.cts", "jest.config.ts" | Select-Object -ExpandProperty FullName

foreach ($file in $files) {
    if ($file -match "libs\\([^\\]+)\\([^\\]+)\\(tsconfig|jest\.config)") {
        # These are at libs/domain/type/file (depth 3)
        $content = Get-Content $file -Raw
        # Replace occurrences of 5-level depths with 3-level depths
        $content = $content -replace "\.\./\.\./\.\./\.\./\.\./", "../../../"
        $content = $content -replace "\.\./\.\./\.\./\.\./", "../../" # safety if any were at 4
        Set-Content -Path $file -Value $content
        Write-Host "Fixed depth for: $file"
    }
}

Write-Host "Depth patching completed."
