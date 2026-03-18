# fishcodex_setup.ps1 — One-time setup for fishcodex wrapper
# Run this once to set up the environment and PowerShell alias.

$FishDir = "$env:USERPROFILE\fishcodex"
$ScriptPath = "$FishDir\fishcodex.py"
$ProfilePath = $PROFILE.CurrentUserCurrentHost

# Create directory
if (-not (Test-Path $FishDir)) {
    New-Item -ItemType Directory -Path $FishDir -Force | Out-Null
    Write-Host "Created $FishDir"
}

# Copy script if running from repo
$SourceScript = Join-Path $PSScriptRoot "fishcodex.py"
if (Test-Path $SourceScript) {
    Copy-Item $SourceScript $ScriptPath -Force
    Write-Host "Copied fishcodex.py to $FishDir"
}

# Set environment variable for token (prompt user)
$existingToken = [Environment]::GetEnvironmentVariable("FISHBRAIN_TOKEN", "User")
if (-not $existingToken) {
    $token = Read-Host "Enter FISHBRAIN_TOKEN (Bearer token for FishBrain API)"
    if ($token) {
        [Environment]::SetEnvironmentVariable("FISHBRAIN_TOKEN", $token, "User")
        $env:FISHBRAIN_TOKEN = $token
        Write-Host "FISHBRAIN_TOKEN set."
    }
} else {
    Write-Host "FISHBRAIN_TOKEN already set."
}

# Add PowerShell function to profile
$FunctionBlock = @"

# --- FishCodex: Codex with FishBrain memory injection ---
function fish {
    python "$env:USERPROFILE\fishcodex\fishcodex.py" @args
}
function fishresume {
    python "$env:USERPROFILE\fishcodex\fishcodex.py" resume @args
}
# --- End FishCodex ---
"@

if (-not (Test-Path $ProfilePath)) {
    New-Item -ItemType File -Path $ProfilePath -Force | Out-Null
}

$profileContent = Get-Content $ProfilePath -Raw -ErrorAction SilentlyContinue
if ($profileContent -notmatch "FishCodex") {
    Add-Content -Path $ProfilePath -Value $FunctionBlock
    Write-Host "Added 'fish' and 'fishresume' functions to PowerShell profile."
    Write-Host "Reload with: . `$PROFILE"
} else {
    Write-Host "PowerShell profile already has FishCodex functions."
}

Write-Host ""
Write-Host "Setup complete. Usage:"
Write-Host '  fish "what changed with Tom yesterday?"'
Write-Host '  fishresume "ok now patch the live file"'
Write-Host '  echo "fix the bug" | fish'
