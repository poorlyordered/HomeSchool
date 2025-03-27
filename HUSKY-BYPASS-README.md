# Bypassing Husky Hooks

This document explains how to temporarily bypass Husky hooks when committing and pushing changes to the GitHub repository until testing issues are resolved.

## Why Bypass Husky?

Husky is configured to run tests and other checks before allowing commits and pushes. If there are failing tests due to recent changes, it can block your ability to commit and push your code. In some situations, you may need to bypass these checks temporarily to push your changes.

## Option 1: Temporarily Disable Husky

This approach completely disables Husky hooks by modifying package.json, allowing you to commit and push normally without hooks running.

### For PowerShell Users

1. Open PowerShell in the project directory
2. Run the script:
   ```powershell
   .\toggle-husky.ps1
   ```
3. The script will disable Husky hooks
4. Commit and push your changes normally (without --no-verify)
5. Run the script again to re-enable Husky when you're done

### For Command Prompt Users

1. Open Command Prompt in the project directory
2. Run the batch file:
   ```cmd
   toggle-husky.bat
   ```
3. The script will disable Husky hooks
4. Commit and push your changes normally (without --no-verify)
5. Run the script again to re-enable Husky when you're done

## Option 2: Bypass Hooks for Individual Commands

This approach keeps Husky enabled but bypasses it for specific commits and pushes.

### For PowerShell Users

1. Open PowerShell in the project directory
2. Run the script with your commit message:
   ```powershell
   .\bypass-husky.ps1 "Your commit message here"
   ```
3. When prompted, type 'y' to push changes or 'n' to only commit locally

### For Command Prompt Users

1. Open Command Prompt in the project directory
2. Run the batch file with your commit message:
   ```cmd
   bypass-husky.bat "Your commit message here"
   ```
3. When prompted, type 'y' to push changes or 'n' to only commit locally

## Option 3: Manual Git Commands

If you prefer to use Git commands directly:

1. Stage your changes:
   ```
   git add .
   ```

2. Commit with the `--no-verify` flag:
   ```
   git commit --no-verify -m "Your commit message"
   ```

3. Push with the `--no-verify` flag:
   ```
   git push --no-verify
   ```

## Important Notes

1. This is a temporary solution. The proper approach is to fix the failing tests.
2. Remember to document that you've bypassed hooks in your commit message.
3. Re-enable and fix the tests as soon as possible to maintain code quality.
4. The `--no-verify` flag skips all Git hooks, not just the test-related ones.

## Restoring Normal Workflow

Once testing issues are resolved, simply use the standard Git commands without the `--no-verify` flag to restore the normal workflow with all checks enabled.
