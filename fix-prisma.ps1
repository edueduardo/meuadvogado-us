Set-Location -Path "C:\Users\teste\Desktop\brazillawusa.com\meuadvogado-us"
Write-Host "Current directory: $(Get-Location)"
Write-Host "Files in prisma folder:"
Get-ChildItem -Path "prisma" -Name
npx prisma generate
