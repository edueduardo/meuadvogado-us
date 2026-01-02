#!/bin/bash

# Script de Deploy - Meu Advogado
# Para rodar: ./deploy.sh

echo "🚀 Iniciando deploy do Meu Advogado..."

# 1. Verificar se está no branch main
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
    echo "❌ Você não está no branch main. Branch atual: $BRANCH"
    echo "Mude para o branch main com: git checkout main"
    exit 1
fi

echo "✅ Branch main confirmado"

# 2. Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Existem mudanças não commitadas:"
    git status --short
    echo ""
    read -p "Deseja fazer commit das mudanças? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📝 Fazendo commit..."
        git add .
        git commit -m "Deploy automático - $(date)"
        echo "✅ Commit realizado"
    fi
fi

# 3. Fazer push para o GitHub
echo "📤 Enviando para o GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Push realizado com sucesso"
else
    echo "❌ Erro ao fazer push"
    exit 1
fi

# 4. Deploy no Vercel (se tiver CLI instalado)
if command -v vercel &> /dev/null; then
    echo "🚀 Fazendo deploy no Vercel..."
    vercel --prod
    echo "✅ Deploy no Vercel concluído"
else
    echo "📝 Vercel CLI não encontrado. Deploy será automático via GitHub."
    echo "   Acompanhe em: https://vercel.com/dashboard"
fi

echo ""
echo "🎉 Deploy concluído com sucesso!"
echo "🌐 Site: https://meuadvogado.us"
echo "📊 Dashboard: https://vercel.com/meuadvogado-us"
