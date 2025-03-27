@echo off
setlocal enabledelayedexpansion

echo Checking Husky status...

:: Create a temporary file for jq processing
set "tempFile=%TEMP%\package.json.tmp"

:: Check if Husky is currently enabled
type package.json | findstr /C:"\"prepare\": \"husky\"" > nul
if %ERRORLEVEL% == 0 (
    echo Disabling Husky hooks...
    
    :: Use PowerShell to modify the JSON (more reliable than batch)
    powershell -Command "$json = Get-Content -Raw -Path 'package.json' | ConvertFrom-Json; $prepare = $json.scripts.prepare; $json.scripts.PSObject.Properties.Remove('prepare'); $json.scripts | Add-Member -NotePropertyName '_prepare' -NotePropertyValue $prepare; $json | ConvertTo-Json -Depth 10 | Set-Content 'package.json'"
    
    echo Husky hooks have been disabled. You can now commit and push without running hooks.
    echo To re-enable Husky hooks, run this script again.
) else (
    echo Re-enabling Husky hooks...
    
    :: Check if _prepare exists
    type package.json | findstr /C:"\"_prepare\": \"husky\"" > nul
    if %ERRORLEVEL% == 0 (
        :: Use PowerShell to modify the JSON
        powershell -Command "$json = Get-Content -Raw -Path 'package.json' | ConvertFrom-Json; $prepare = $json.scripts._prepare; $json.scripts.PSObject.Properties.Remove('_prepare'); $json.scripts | Add-Member -NotePropertyName 'prepare' -NotePropertyValue $prepare; $json | ConvertTo-Json -Depth 10 | Set-Content 'package.json'"
        
        echo Husky hooks have been re-enabled.
    ) else (
        echo Could not find _prepare script in package.json. Husky may not be properly configured.
    )
)

echo.
echo NOTE: This change only affects your local repository. Remember to re-enable Husky hooks when testing issues are resolved.
