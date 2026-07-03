param([string]$msg = "chore: update")

$COOLIFY_URL = "http://195.26.247.101:8000"
$APP_UUID    = "nksnfeo7jfkc62kg51t79oab"
$TOKEN       = $env:COOLIFY_BICHOPOS_TOKEN

if (-not $TOKEN) {
    Write-Error "Falta COOLIFY_BICHOPOS_TOKEN. Corre: [System.Environment]::SetEnvironmentVariable('COOLIFY_BICHOPOS_TOKEN','<token>','User')"
    exit 1
}

# 1. Git add / commit / push (Coolify ya tiene webhook de auto-deploy en push,
#    pero disparamos el deploy explícito por la API para no depender de él)
git -C $PSScriptRoot add -A
git -C $PSScriptRoot commit -m $msg
git -C $PSScriptRoot push github fresh-start:master
if ($LASTEXITCODE -ne 0) { Write-Error "git push fallo"; exit 1 }

# 2. Coolify deploy (Build Pack = Dockerfile: el build corre en el servidor)
$headers = @{ "Authorization" = "Bearer $TOKEN"; "Content-Type" = "application/json" }
Write-Host "Triggering Coolify deploy..."
try {
    $res = Invoke-RestMethod -Method POST -Uri "$COOLIFY_URL/api/v1/deploy?uuid=$APP_UUID&force=false" -Headers $headers
    Write-Host "Deploy triggered: $($res | ConvertTo-Json -Compress)"
} catch {
    Write-Warning "Deploy call fallo: $_"
    exit 1
}

# 3. Esperar el build (tests + lint + compile + bundle corre dentro del container)
Write-Host "Esperando 60s para que termine el build..."
Start-Sleep -Seconds 60

# 4. Verificar que el sitio responde (PowerShell 5.1 no tiene -SkipHttpErrorCheck,
#    por eso el try/catch: un 401 de Basic Auth cuenta como "responde bien")
try {
    $r = Invoke-WebRequest -Uri "https://pos.manekistore.com.mx/" -Method Head -TimeoutSec 15
    Write-Host "pos.manekistore.com.mx respondio HTTP $($r.StatusCode)"
} catch {
    if ($_.Exception.Response) {
        $code = [int]$_.Exception.Response.StatusCode
        Write-Host "pos.manekistore.com.mx respondio HTTP $code (401 es normal, esta detras de Basic Auth)"
    } else {
        Write-Warning "No se pudo verificar el sitio: $_"
    }
}

Write-Host "Deploy completo."
