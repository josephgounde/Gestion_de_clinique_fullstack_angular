$baseUrl = "http://localhost:8080"
$endpoints = @(
    "/api/actuator/health",
    "/api/medecin/all",
    "/api/patient/all",
    "/api/secretaire/all"
)

Write-Host "Testing API endpoints on $baseUrl" -ForegroundColor Cyan
Write-Host "--------------------------------"

foreach ($endpoint in $endpoints) {
    $url = "${baseUrl}${endpoint}"
    Write-Host "Testing: $url" -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -UseBasicParsing -ErrorAction Stop
        Write-Host " - Status: $($response.StatusCode)" -ForegroundColor Green
        
        if ($response.Content) {
            Write-Host "Response: $($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3)" -ForegroundColor DarkGray
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host " - Error: $statusCode" -ForegroundColor Red
        Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}
