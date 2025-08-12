#!/bin/bash

echo "🚀 Initialisation de la base de données CMPA Podcast Manager"
echo "=================================================="

# 1. Vérifier si Supabase est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI n'est pas installé"
    echo "Installez-le avec: npm install -g supabase"
    exit 1
fi

# 2. Arrêter Supabase s'il est déjà en cours
echo "🛑 Arrêt de Supabase s'il est en cours..."
supabase stop 2>/dev/null || true

# 3. Démarrer Supabase
echo "▶️  Démarrage de Supabase..."
supabase start

# 4. Attendre que les services soient prêts
echo "⏳ Attente que les services soient prêts..."
sleep 10

# 5. Appliquer les migrations
echo "📦 Application des migrations..."
supabase db push

# 6. Initialiser le stockage
echo "🗄️  Initialisation du stockage..."
supabase db reset --linked

# 7. Vérifier le statut
echo "✅ Vérification du statut..."
supabase status

echo ""
echo "🎉 Base de données initialisée avec succès !"
echo "🌐 Studio Supabase: http://localhost:54323"
echo "🔗 API URL: http://127.0.0.1:54321"
echo "📊 Base de données: postgresql://postgres:postgres@127.0.0.1:54322/postgres"
