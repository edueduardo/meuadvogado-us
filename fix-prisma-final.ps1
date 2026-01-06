Set-Location "C:\Users\teste\Desktop\brazillawusa.com\meuadvogado-us"

Write-Host "🔧 Corrigindo problemas do Prisma..."

# Remover lock file corrompido
if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json" -Force
    Write-Host "✅ package-lock.json removido"
}

# Limpar node_modules
if (Test-Path "node_modules") {
    Remove-Item "node_modules" -Recurse -Force
    Write-Host "✅ node_modules removido"
}

# Limpar cache npm
npm cache clean --force
Write-Host "✅ Cache npm limpo"

# Reinstalar dependências
npm install
Write-Host "✅ Dependências reinstaladas"

# Gerar Prisma client
npx prisma generate
Write-Host "✅ Prisma client gerado"

# Fazer push do schema
npx prisma db push
Write-Host "✅ Schema enviado para o banco"

# Rodar seed
npx prisma db seed
Write-Host "✅ Seed executado"

Write-Host "🎉 Prisma corrigido com sucesso!"
