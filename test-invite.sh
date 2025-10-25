#!/bin/bash

# Script para testar o sistema de convites
# Execute com: ./test-invite.sh

echo "=== TESTE DO SISTEMA DE CONVITES ==="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuração
SUPABASE_URL="https://frwawmcvrpdhsuljrvlw.supabase.co"
FUNCTION_URL="$SUPABASE_URL/functions/v1/invite-user"

echo -e "${YELLOW}1. Verificando configuração do Supabase...${NC}"
echo "URL: $SUPABASE_URL"
echo ""

# Solicitar dados do teste
read -p "Digite o ANON KEY do Supabase: " ANON_KEY
echo ""
read -p "Digite o ACCESS TOKEN do usuário (copie do DevTools): " ACCESS_TOKEN
echo ""
read -p "Digite o ORG_ID: " ORG_ID
echo ""
read -p "Digite o EMAIL para convidar: " EMAIL
echo ""
read -p "Digite o ROLE (admin/collector/viewer): " ROLE
echo ""
read -p "Digite o NOME (opcional): " NAME
echo ""

echo -e "${YELLOW}2. Testando conexão com a Edge Function...${NC}"

# Fazer requisição
RESPONSE=$(curl -s -w "\n%{http_code}" --location --request POST "$FUNCTION_URL" \
  --header "Authorization: Bearer $ACCESS_TOKEN" \
  --header "apikey: $ANON_KEY" \
  --header "Content-Type: application/json" \
  --data "{
    \"org_id\": \"$ORG_ID\",
    \"email\": \"$EMAIL\",
    \"role\": \"$ROLE\",
    \"name\": \"$NAME\"
  }")

# Separar body e status code
HTTP_BODY=$(echo "$RESPONSE" | head -n -1)
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)

echo ""
echo -e "${YELLOW}3. Resultado:${NC}"
echo "Status Code: $HTTP_CODE"
echo "Response Body:"
echo "$HTTP_BODY" | jq '.' 2>/dev/null || echo "$HTTP_BODY"
echo ""

# Avaliar resultado
if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ Sucesso! Convite enviado.${NC}"
  echo ""
  echo "Próximos passos:"
  echo "1. Verifique o email do destinatário (incluindo pasta de SPAM)"
  echo "2. Verifique os logs no Supabase Dashboard → Edge Functions → invite-user → Logs"
  echo "3. Verifique no Supabase Dashboard → Authentication → Users"
else
  echo -e "${RED}✗ Erro ao enviar convite!${NC}"
  echo ""
  echo "Possíveis causas:"
  echo "- Access token expirado ou inválido"
  echo "- Usuário não tem permissão (deve ser owner ou admin)"
  echo "- Edge Function não está deployed"
  echo "- Email provider não configurado no Supabase"
  echo ""
  echo "Verifique os logs detalhados em:"
  echo "Supabase Dashboard → Edge Functions → invite-user → Logs"
fi

echo ""
echo "=== FIM DO TESTE ==="
