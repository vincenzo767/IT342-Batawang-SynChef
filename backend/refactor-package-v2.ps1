# Careful Package Refactoring Script
$ErrorActionPreference = "Stop"

$baseDir = "c:\Users\L24X09W10\Desktop\sync\IT342_G5_-Batawang-_Lab1\backend\src\main\java"
Set-Location $baseDir

Write-Host "`n=== Package Refactoring: com.synchef -> edu.cit.batawang.synchef ===" -ForegroundColor Cyan

# Step 1: Create new directory structure
Write-Host "`n[1/5] Creating new directory structure..." -ForegroundColor Yellow
$newBaseDir = "edu\cit\batawang\synchef"
New-Item -ItemType Directory -Path $newBaseDir -Force | Out-Null
@("config", "controller", "dto", "model", "repository", "security", "service") | ForEach-Object {
    New-Item -ItemType Directory -Path (Join-Path $newBaseDir $_) -Force | Out-Null
}
Write-Host "  ✓ Created directory structure" -ForegroundColor Green

# Step 2: Copy and refactor files
Write-Host "`n[2/5] Copying and refactoring files..." -ForegroundColor Yellow

# Main application file
$file = "com\synchef\SynChefApplication.java"
if (Test-Path $file) {
    $content = Get-Content $file -Raw
    $content = $content -replace 'package com\.synchef;', 'package edu.cit.batawang.synchef;'
    $content = $content -replace 'import com\.synchef\.', 'import edu.cit.batawang.synchef.'
    Set-Content -Path "$newBaseDir\SynChefApplication.java" -Value $content -NoNewline
    Write-Host "  ✓ SynChefApplication.java" -ForegroundColor Green
}

# Process each subdirectory
$subdirs = @("config", "controller", "dto", "model", "repository", "security", "service")
foreach ($subdir in $subdirs) {
    $sourceDir = "com\synchef\$subdir"
    $targetDir = "$newBaseDir\$subdir"
    
    if (Test-Path $sourceDir) {
        Get-ChildItem -Path $sourceDir -Filter "*.java" | ForEach-Object {
            $content = Get-Content $_.FullName -Raw
            $content = $content -replace 'package com\.synchef\.', 'package edu.cit.batawang.synchef.'
            $content = $content -replace 'import com\.synchef\.', 'import edu.cit.batawang.synchef.'
            $targetFile = Join-Path $targetDir $_.Name
            Set-Content -Path $targetFile -Value $content -NoNewline
            Write-Host "  ✓ $subdir\$($_.Name)" -ForegroundColor Green
        }
    }
}

# Step 3: Verify file count
Write-Host "`n[3/5] Verifying file count..." -ForegroundColor Yellow
$originalCount = (Get-ChildItem -Path "com\synchef" -Recurse -Filter "*.java").Count
$newCount = (Get-ChildItem -Path $newBaseDir -Recurse -Filter "*.java").Count
Write-Host "  Original: $originalCount files" -ForegroundColor White
Write-Host "  New: $newCount files" -ForegroundColor White

if ($originalCount -eq $newCount) {
    Write-Host "  ✓ File count matches!" -ForegroundColor Green
} else {
    Write-Host "  ✗ File count mismatch!" -ForegroundColor Red
    exit 1
}

# Step 4: Remove old directory
Write-Host "`n[4/5] Removing old package directory..." -ForegroundColor Yellow
Remove-Item -Path "com" -Recurse -Force
Write-Host "  ✓ Removed com.synchef directory" -ForegroundColor Green

# Step 5: Final verification
Write-Host "`n[5/5] Final verification..." -ForegroundColor Yellow
$finalCount = (Get-ChildItem -Path $newBaseDir -Recurse -Filter "*.java").Count
Write-Host "  Final count: $finalCount Java files" -ForegroundColor White
Write-Host "  ✓ Refactoring complete!" -ForegroundColor Green

Write-Host "`n=== SUCCESS: Package refactored to edu.cit.batawang.synchef ===" -ForegroundColor Green
Write-Host ""
