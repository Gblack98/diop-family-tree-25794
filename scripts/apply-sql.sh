#!/bin/bash
# ============================================================================
# Script d'exécution automatique de SQL dans Supabase
# Usage: ./scripts/apply-sql.sh <fichier.sql> <access_token>
# ============================================================================

SQL_FILE="${1:-supabase/security-hardening.sql}"
ACCESS_TOKEN="${2:-}"
PROJECT_REF="qshlsdjmzpoabribaemo"

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Erreur: access token manquant"
  echo ""
  echo "Usage: ./scripts/apply-sql.sh $SQL_FILE TON_TOKEN"
  echo ""
  echo "👉 Obtenir ton token:"
  echo "   1. Va sur https://supabase.com/dashboard/account/tokens"
  echo "   2. Clique 'Generate new token'"
  echo "   3. Copie le token et relance ce script"
  exit 1
fi

if [ ! -f "$SQL_FILE" ]; then
  echo "❌ Fichier SQL introuvable: $SQL_FILE"
  exit 1
fi

echo "🚀 Exécution de $SQL_FILE sur le projet $PROJECT_REF..."

SQL_CONTENT=$(cat "$SQL_FILE")

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "https://api.supabase.com/v1/projects/$PROJECT_REF/database/query" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$SQL_CONTENT" | jq -Rs .)}")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  echo "✅ SQL exécuté avec succès !"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
  echo "❌ Erreur HTTP $HTTP_CODE:"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
  exit 1
fi
