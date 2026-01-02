Set-Location -Path "C:\Users\teste\Desktop\brazillawusa.com\meuadvogado-us"
Write-Host "Current directory: $(Get-Location)"
Write-Host "Using local Prisma..."
node_modules\.bin\prisma generate
