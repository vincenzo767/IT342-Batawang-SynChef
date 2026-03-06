# Package Refactoring Script
# Changes package from com.synchef to edu.cit.batawang.synchef

$baseDir = "c:\Users\L24X09W10\Desktop\sync\IT342_G5_-Batawang-_Lab1\backend\src\main\java"
$oldPackage = "com\synchef"
$newPackage = "edu\cit\batawang\synchef"
$oldPackageDot = "com.synchef"
$newPackageDot = "edu.cit.batawang.synchef"

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  PACKAGE REFACTORING: com.synchef → edu.cit.batawang.synchef ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Step 1: Create new directory structure
Write-Host "Step 1: Creating new package structure..." -ForegroundColor Yellow
$newDir = Join-Path $baseDir $newPackage
New-Item -ItemType Directory -Path $newDir -Force | Out-Null

# Create subdirectories
$subdirs = @("config", "controller", "dto", "model", "repository", "security", "service")
foreach ($subdir in $subdirs) {
    $newSubDir = Join-Path $newDir $subdir
    New-Item -ItemType Directory -Path $newSubDir -Force | Out-Null
}
Write-Host "  ✓ Created directory structure" -ForegroundColor Green

# Step 2: Copy files to new location
Write-Host "`nStep 2: Copying Java files to new location..." -ForegroundColor Yellow
$oldDir = Join-Path $baseDir $oldPackage
$javaFiles = Get-ChildItem -Path $oldDir -Recurse -Filter "*.java"
$fileCount = 0

foreach ($file in $javaFiles) {
    $relativePath = $file.FullName.Substring($oldDir.Length + 1)
    $newFilePath = Join-Path $newDir $relativePath
    $newFileDir = Split-Path $newFilePath -Parent
    
    if (-not (Test-Path $newFileDir)) {
        New-Item -ItemType Directory -Path $newFileDir -Force | Out-Null
    }
    
    Copy-Item -Path $file.FullName -Destination $newFilePath -Force
    $fileCount++
}
Write-Host "  ✓ Copied $fileCount Java files" -ForegroundColor Green

# Step 3: Update package declarations
Write-Host "`nStep 3: Updating package declarations..." -ForegroundColor Yellow
$newJavaFiles = Get-ChildItem -Path $newDir -Recurse -Filter "*.java"
$packageCount = 0

foreach ($file in $newJavaFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    
    # Update package declaration
    $content = $content -replace "^package $oldPackageDot", "package $newPackageDot"
    $content = $content -replace "^package $oldPackageDot\.config", "package $newPackageDot.config"
    $content = $content -replace "^package $oldPackageDot\.controller", "package $newPackageDot.controller"
    $content = $content -replace "^package $oldPackageDot\.dto", "package $newPackageDot.dto"
    $content = $content -replace "^package $oldPackageDot\.model", "package $newPackageDot.model"
    $content = $content -replace "^package $oldPackageDot\.repository", "package $newPackageDot.repository"
    $content = $content -replace "^package $oldPackageDot\.security", "package $newPackageDot.security"
    $content = $content -replace "^package $oldPackageDot\.service", "package $newPackageDot.service"
    
    if ($content -ne $originalContent) {
        $packageCount++
    }
    
    Set-Content -Path $file.FullName -Value $content -NoNewline
}
Write-Host "  ✓ Updated $packageCount package declarations" -ForegroundColor Green

# Step 4: Update imports
Write-Host "`nStep 4: Updating import statements..." -ForegroundColor Yellow
$importCount = 0

foreach ($file in $newJavaFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    
    # Update all imports
    $content = $content -replace "import $oldPackageDot\.", "import $newPackageDot."
    
    if ($content -ne $originalContent) {
        $importCount++
    }
    
    Set-Content -Path $file.FullName -Value $content -NoNewline
}
Write-Host "  ✓ Updated imports in $importCount files" -ForegroundColor Green

# Step 5: Remove old directory
Write-Host "`nStep 5: Removing old package directory..." -ForegroundColor Yellow
Remove-Item -Path (Join-Path $baseDir "com") -Recurse -Force
Write-Host "  ✓ Removed old com.synchef directory" -ForegroundColor Green

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  REFACTORING COMPLETE ✓                                    ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host "`nPackage structure changed from:" -ForegroundColor White
Write-Host "  com.synchef → edu.cit.batawang.synchef`n" -ForegroundColor Yellow
