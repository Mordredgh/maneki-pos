$ErrorActionPreference = 'Stop'
$repo = Split-Path $PSScriptRoot -Parent
$envPath = Join-Path $repo '.env.backup.local'
if (-not (Test-Path -LiteralPath $envPath)) { throw 'Falta .env.backup.local' }
$names = @(Get-Content -LiteralPath $envPath | ForEach-Object { if ($_ -match '^([A-Z0-9_]+)=.+$') { $matches[1] } })
foreach ($name in @('POS_BACKUP_DIR', 'POS_BACKUP_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'R2_ACCOUNT_ID', 'R2_BUCKET', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY')) {
    if ($name -notin $names) { throw "Falta $name en .env.backup.local" }
}
$node = (Get-Command node -ErrorAction Stop).Source
$script = Join-Path $PSScriptRoot 'backup-external.mjs'
$action = New-ScheduledTaskAction -Execute $node -Argument ('--env-file="{0}" "{1}"' -f $envPath, $script) -WorkingDirectory $repo
$triggers = @(
    New-ScheduledTaskTrigger -Daily -At '20:00'
    New-ScheduledTaskTrigger -AtLogOn -User "$env:USERDOMAIN\$env:USERNAME"
)
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 15)
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName 'Bicho POS R2 Backup' -Action $action -Trigger $triggers -Settings $settings -Principal $principal -Force | Out-Null
Write-Output 'Tarea Bicho POS R2 Backup registrada: 20:00 y al iniciar sesion.'
