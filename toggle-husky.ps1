# PowerShell script to toggle Husky hooks on/off

# Function to check if Husky is currently enabled
function IsHuskyEnabled {
    $packageJson = Get-Content -Path "package.json" -Raw | ConvertFrom-Json
    return ($packageJson.scripts.prepare -eq "husky")
}

# Function to disable Husky
function DisableHusky {
    Write-Host "Disabling Husky hooks..."
    
    # Read package.json
    $packageJsonPath = "package.json"
    $packageJson = Get-Content -Path $packageJsonPath -Raw | ConvertFrom-Json
    
    # Rename the prepare script to _prepare to disable Husky
    $packageJson.scripts | Add-Member -NotePropertyName "_prepare" -NotePropertyValue $packageJson.scripts.prepare -Force
    $packageJson.scripts.PSObject.Properties.Remove("prepare")
    
    # Save the modified package.json
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content -Path $packageJsonPath
    
    Write-Host "Husky hooks have been disabled. You can now commit and push without running hooks."
    Write-Host "To re-enable Husky hooks, run this script again."
}

# Function to enable Husky
function EnableHusky {
    Write-Host "Re-enabling Husky hooks..."
    
    # Read package.json
    $packageJsonPath = "package.json"
    $packageJson = Get-Content -Path $packageJsonPath -Raw | ConvertFrom-Json
    
    # Restore the prepare script from _prepare
    $packageJson.scripts | Add-Member -NotePropertyName "prepare" -NotePropertyValue $packageJson.scripts._prepare -Force
    $packageJson.scripts.PSObject.Properties.Remove("_prepare")
    
    # Save the modified package.json
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content -Path $packageJsonPath
    
    Write-Host "Husky hooks have been re-enabled."
}

# Main script logic
if (IsHuskyEnabled) {
    DisableHusky
} else {
    EnableHusky
}

Write-Host "`nNOTE: This change only affects your local repository. Remember to re-enable Husky hooks when testing issues are resolved."
