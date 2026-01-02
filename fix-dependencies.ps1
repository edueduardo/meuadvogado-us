Set-Location -Path "C:\Users\teste\Desktop\brazillawusa.com\meuadvogado-us"
Write-Host "Current directory: $(Get-Location)"
Write-Host "Deleting package-lock.json..."
Remove-Item -Path "package-lock.json" -Force
Write-Host "Installing dependencies..."
npm install
Write-Host "Generating Prisma client..."
npx prisma generate
