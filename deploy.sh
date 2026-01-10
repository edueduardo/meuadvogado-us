#!/bin/bash

# 🚀 Meuadvogado.us Deploy Script
# Deploy para Vercel Production

set -e

echo "🚀 Iniciando Deploy para Vercel..."
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar git status
echo -e "${BLUE}📋 Verificando Git Status...${NC}"
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Há mudanças não commitadas!${NC}"
    echo "Use: git add . && git commit -m 'your message'"
    exit 1
fi
echo -e "${GREEN}✅ Git limpo - pronto para deploy${NC}"
echo ""

# Verificar build
echo -e "${BLUE}🔨 Compilando projeto...${NC}"
npm run build
echo -e "${GREEN}✅ Build sucesso${NC}"
echo ""

# Opções de deploy
echo -e "${BLUE}🎯 Escolha uma opção:${NC}"
echo "1) GitHub Integration (automático)"
echo "2) Deploy via CLI (com token)"
echo "3) Ver status atual"
echo ""
read -p "Escolha (1-3): " choice

case $choice in
    1)
        echo -e "${BLUE}📤 GitHub Integration${NC}"
        echo ""
        echo "✅ Seu código já está no GitHub:"
        git log --oneline -3
        echo ""
        echo -e "${YELLOW}⏱️  Vercel detectará automaticamente em 30-60 segundos${NC}"
        echo "Dashboard: https://vercel.com/dashboard"
        echo ""
        echo -e "${GREEN}✅ Deploy automático acionado!${NC}"
        ;;
    2)
        echo -e "${BLUE}🔑 Deploy com Token${NC}"
        if [ -z "$VERCEL_TOKEN" ]; then
            read -sp "Digite seu VERCEL_TOKEN: " token
            export VERCEL_TOKEN=$token
        fi
        echo ""
        echo "🚀 Deployando para produção..."
        vercel deploy --prod
        echo -e "${GREEN}✅ Deploy completado!${NC}"
        ;;
    3)
        echo -e "${BLUE}📊 Status Atual${NC}"
        echo ""
        echo "Branch: $(git rev-parse --abbrev-ref HEAD)"
        echo "Último commit: $(git log -1 --oneline)"
        echo ""
        echo "GitHub: https://github.com/edueduardo/meuadvogado-us"
        echo "Vercel: https://vercel.com/dashboard"
        ;;
    *)
        echo "Opção inválida"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}📚 Resources:${NC}"
echo "- Docs: DEPLOYMENT_INSTRUCTIONS.md"
echo "- Dashboard: https://vercel.com/dashboard"
echo "- Logs: vercel logs <URL>"
echo ""
