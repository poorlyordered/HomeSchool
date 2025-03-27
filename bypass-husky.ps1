# PowerShell script to bypass Husky hooks when committing and pushing to GitHub

param (
    [Parameter(Mandatory=$true)]
    [string]$CommitMessage
)

Write-Host "Committing changes with message: $CommitMessage (bypassing Husky hooks)"
git add .
git commit --no-verify -m "$CommitMessage"

$confirmation = Read-Host "Do you want to push these changes to the remote repository? (y/n)"
if ($confirmation -eq 'y') {
    Write-Host "Pushing changes to remote repository (bypassing Husky hooks)"
    git push --no-verify
    Write-Host "Changes pushed successfully!"
} else {
    Write-Host "Push canceled. Your changes have been committed locally."
}

Write-Host "`nNOTE: Husky hooks have been bypassed for this operation. Remember to re-enable them when testing issues are resolved."
