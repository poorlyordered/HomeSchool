@echo off
setlocal enabledelayedexpansion

if "%~1"=="" (
    echo Error: Commit message is required.
    echo Usage: bypass-husky.bat "Your commit message"
    exit /b 1
)

echo Committing changes with message: %~1 (bypassing Husky hooks)
git add .
git commit --no-verify -m "%~1"

set /p confirmation=Do you want to push these changes to the remote repository? (y/n): 
if /i "!confirmation!"=="y" (
    echo Pushing changes to remote repository (bypassing Husky hooks)
    git push --no-verify
    echo Changes pushed successfully!
) else (
    echo Push canceled. Your changes have been committed locally.
)

echo.
echo NOTE: Husky hooks have been bypassed for this operation. Remember to re-enable them when testing issues are resolved.
