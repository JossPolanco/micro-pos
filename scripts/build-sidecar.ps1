$ErrorActionPreference = "Stop"

Write-Host "[Micro-POS] Creando directorio de binarios..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "src-tauri/binaries" | Out-Null

Write-Host "[Micro-POS] Publicando Sidecar .NET 10 (Single-File Self-Contained win-x64)..." -ForegroundColor Cyan
dotnet publish src-dotnet/MicroPos.Api/MicroPos.Api.csproj -c Release -o src-dotnet/MicroPos.Api/publish

Write-Host "[Micro-POS] Copiando binario con Target Triple x86_64-pc-windows-msvc..." -ForegroundColor Cyan
Copy-Item "src-dotnet/MicroPos.Api/publish/micro-pos-api.exe" `
          "src-tauri/binaries/micro-pos-api-x86_64-pc-windows-msvc.exe" -Force

Write-Host "[Micro-POS] Sidecar listo en src-tauri/binaries/" -ForegroundColor Green

