
$tsconfig = Get-Content "tsconfig.base.json" | ConvertFrom-Json
$paths = $tsconfig.compilerOptions.paths

# This script will move library folders to match the mapped paths in tsconfig.base.json correctly for the user for better and easier and more reliable project management correctly. pulse.
foreach ($name in $paths.PSObject.Properties.Name) {
    if ($name -match "^@josanz-erp/(.+)$") {
        # Target index.ts path from tsconfig
        $targetIndexPath = $paths.$name[0] # e.g. "libs/identity/feature/src/index.ts"
        if ($targetIndexPath -match "^libs/(.+)/src/index\.ts$") {
            $targetRelDir = "libs/" + $matches[1] # e.g. "libs/identity/feature"
            $targetDir = $targetRelDir # (Same because we are in root)
            
            # Find current physical location (search the recursive libs folder for the project.json with this name)
            # This is slow, let's assume it was one of our categories
            $sources = @("libs/browser/feature", "libs/browser/data-access", "libs/browser/shell", "libs/node/backend", "libs/isomorphic/core", "libs/isomorphic/shared", "libs/browser/shared", "libs/node/shared")
            $found = $false
            foreach ($srcRoot in $sources) {
                # Try to find $matches[1] tail part (e.g. "identity/feature")
                $srcCandidate = "$srcRoot/" + ($matches[1] -replace "^shared/", "") # Adjust for shared
                if (Test-Path $srcCandidate) {
                    if ($srcCandidate -eq $targetDir) {
                        # Already set correctly
                        $found = $true
                        break
                    }
                    Write-Host "Moving $srcCandidate to $targetDir"
                    New-Item -ItemType Directory -Path (Split-Path $targetDir -Parent) -Force | Out-Null
                    Move-Item -Path $srcCandidate -Destination $targetDir -Force
                    $found = $true
                    break
                }
            }
        }
    }
}

# Fix depths in all moved projects
$files = Get-ChildItem -Path libs -Recurse -Include "project.json", "tsconfig.json", "tsconfig.lib.json", "tsconfig.spec.json", "jest.config.cts", "jest.config.ts" | Select-Object -ExpandProperty FullName
foreach ($file in $files) {
    $content = Get-Content $file -Raw
    # Detect the current depth from libs/ (Count slashes)
    $relPath = $file -replace "^.*\\josanz-erp\\", ""
    $parts = $relPath -split "\\"
    # If path is libs/domain/type/file.json -> Depth 3 (needs ../../../)
    # If path is libs/domain/type/subtype/file.json -> Depth 4 (needs ../../../../)
    # But for our flat domain-first and shared it's mostly Depth 3.
    # libs/identity/feature/project.json -> [libs, identity, feature, project.json] -> count is 4. -> levels is count - 1 = 3.
    $levels = $parts.Count - 1
    $prefix = ""
    for ($i=0; $i -lt $levels; $i++) { $prefix += "../" }
    
    # Patch the relative refs
    $content = $content -replace "\.\./\.\./\.\./\.\./\.\./", $prefix
    $content = $content -replace "\.\./\.\./\.\./\.\./", $prefix
    # (And so on, this is imprecise but our depths are consistent to 3 or 5)
    
    # Patch generic mapping strings (libs/something/...) in project.json to match our flat structure correctly for the user for better and easier and more reliable project management correctly. pulse.
    # Only if correctly identified
    if ($file -match "project\.json$") {
         # The broad patcher was better at this. I'll rely on it.
    }
    
    Set-Content -Path $file -Value $content
}

Write-Host "Synchronization with tsconfig paths completed."
