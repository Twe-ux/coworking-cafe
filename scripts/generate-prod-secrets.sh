#!/bin/bash
# generate-prod-secrets.sh
# Génération des secrets de production pour Coworking Café

echo "🔐 Génération des secrets de production..."
echo "⚠️  Ce fichier sera supprimé après copie dans Northflank"
echo ""

OUTPUT_FILE=".secrets-prod.txt"

# Vider le fichier s'il existe
> $OUTPUT_FILE

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> $OUTPUT_FILE
echo "🔐 SECRETS DE PRODUCTION - COWORKING CAFÉ" >> $OUTPUT_FILE
echo "Date: $(date '+%Y-%m-%d %H:%M:%S')" >> $OUTPUT_FILE
echo "⚠️  À SUPPRIMER après copie dans Northflank : rm $OUTPUT_FILE" >> $OUTPUT_FILE
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# NextAuth Secrets (DIFFÉRENTS pour site et admin)
echo "═══════════════════════════════════════════════════════════════" >> $OUTPUT_FILE
echo "1️⃣  NEXTAUTH SECRETS (différents pour site et admin)" >> $OUTPUT_FILE
echo "═══════════════════════════════════════════════════════════════" >> $OUTPUT_FILE
NEXTAUTH_SITE=$(openssl rand -base64 32)
NEXTAUTH_ADMIN=$(openssl rand -base64 32)
echo "" >> $OUTPUT_FILE
echo "Service SITE:" >> $OUTPUT_FILE
echo "NEXTAUTH_SECRET=$NEXTAUTH_SITE" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
echo "Service ADMIN:" >> $OUTPUT_FILE
echo "NEXTAUTH_SECRET=$NEXTAUTH_ADMIN" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# Secrets Inter-Services (IDENTIQUES pour site et admin)
echo "═══════════════════════════════════════════════════════════════" >> $OUTPUT_FILE
echo "2️⃣  SECRETS INTER-SERVICES (IDENTIQUES site + admin)" >> $OUTPUT_FILE
echo "═══════════════════════════════════════════════════════════════" >> $OUTPUT_FILE
NOTIF_SECRET=$(openssl rand -hex 32)
REVAL_SECRET=$(openssl rand -hex 32)
echo "" >> $OUTPUT_FILE
echo "Service SITE + ADMIN (même valeur):" >> $OUTPUT_FILE
echo "NOTIFICATIONS_SECRET=$NOTIF_SECRET" >> $OUTPUT_FILE
echo "REVALIDATE_SECRET=$REVAL_SECRET" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# VAPID Keys (pour notifications push)
echo "═══════════════════════════════════════════════════════════════" >> $OUTPUT_FILE
echo "3️⃣  VAPID KEYS (notifications push - admin uniquement)" >> $OUTPUT_FILE
echo "═══════════════════════════════════════════════════════════════" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
echo "Service ADMIN:" >> $OUTPUT_FILE
npx -y web-push generate-vapid-keys 2>/dev/null | while IFS= read -r line; do
    if [[ $line == *"Public Key"* ]]; then
        echo "NEXT_PUBLIC_VAPID_PUBLIC_KEY=${line#*: }" >> $OUTPUT_FILE
    elif [[ $line == *"Private Key"* ]]; then
        echo "VAPID_PRIVATE_KEY=${line#*: }" >> $OUTPUT_FILE
    fi
done
echo "" >> $OUTPUT_FILE

# Instructions pour les secrets à créer manuellement
echo "═══════════════════════════════════════════════════════════════" >> $OUTPUT_FILE
echo "4️⃣  SECRETS À CRÉER MANUELLEMENT (interfaces web)" >> $OUTPUT_FILE
echo "═══════════════════════════════════════════════════════════════" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
echo "📋 MongoDB (MongoDB Atlas > Database Access):" >> $OUTPUT_FILE
echo "   1. Créer user 'prod-site' avec password fort (32+ chars)" >> $OUTPUT_FILE
echo "   2. Créer user 'prod-admin' avec password fort (32+ chars)" >> $OUTPUT_FILE
echo "   3. Permissions: readWrite sur database uniquement" >> $OUTPUT_FILE
echo "   4. Mettre à jour MONGODB_URI dans Northflank avec les passwords" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
echo "🔷 Stripe (dashboard.stripe.com/webhooks):" >> $OUTPUT_FILE
echo "   1. Créer webhook site: https://[domaine].com/api/payments/webhook" >> $OUTPUT_FILE
echo "      → Copier STRIPE_WEBHOOK_SECRET pour service SITE" >> $OUTPUT_FILE
echo "   2. Créer webhook admin: https://admin.[domaine].com/api/stripe/webhook" >> $OUTPUT_FILE
echo "      → Copier STRIPE_WEBHOOK_SECRET pour service ADMIN" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
echo "📧 Resend (resend.com/api-keys):" >> $OUTPUT_FILE
echo "   1. Régénérer API Key" >> $OUTPUT_FILE
echo "   2. Copier RESEND_API_KEY dans Northflank (site + admin)" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
echo "☁️  Cloudinary (console.cloudinary.com/settings):" >> $OUTPUT_FILE
echo "   1. Reset API Secret" >> $OUTPUT_FILE
echo "   2. Copier CLOUDINARY_API_SECRET dans Northflank (site uniquement)" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# Résumé des variables Northflank
echo "═══════════════════════════════════════════════════════════════" >> $OUTPUT_FILE
echo "5️⃣  RÉSUMÉ - VARIABLES À CONFIGURER DANS NORTHFLANK" >> $OUTPUT_FILE
echo "═══════════════════════════════════════════════════════════════" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
echo "Service SITE (14 variables):" >> $OUTPUT_FILE
echo "  ✅ NEXTAUTH_SECRET (généré ci-dessus)" >> $OUTPUT_FILE
echo "  ⏳ NEXTAUTH_URL (https://[votre-domaine].com)" >> $OUTPUT_FILE
echo "  ⏳ MONGODB_URI (avec password créé sur MongoDB Atlas)" >> $OUTPUT_FILE
echo "  ⏳ RESEND_API_KEY (régénéré sur Resend)" >> $OUTPUT_FILE
echo "  ⏳ RESEND_FROM_EMAIL (noreply@[votre-domaine].com)" >> $OUTPUT_FILE
echo "  ⏳ CLOUDINARY_CLOUD_NAME (votre cloud)" >> $OUTPUT_FILE
echo "  ⏳ CLOUDINARY_API_KEY (votre clé)" >> $OUTPUT_FILE
echo "  ⏳ CLOUDINARY_API_SECRET (reset sur Cloudinary)" >> $OUTPUT_FILE
echo "  ⏳ NEXT_PUBLIC_ADMIN_API_URL (https://admin.[votre-domaine].com)" >> $OUTPUT_FILE
echo "  ⏳ STRIPE_SECRET_KEY (sk_live_...)" >> $OUTPUT_FILE
echo "  ⏳ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (pk_live_...)" >> $OUTPUT_FILE
echo "  ⏳ STRIPE_WEBHOOK_SECRET (créé sur Stripe Dashboard)" >> $OUTPUT_FILE
echo "  ✅ NOTIFICATIONS_SECRET (généré ci-dessus)" >> $OUTPUT_FILE
echo "  ✅ REVALIDATE_SECRET (généré ci-dessus)" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
echo "Service ADMIN (20+ variables):" >> $OUTPUT_FILE
echo "  → Toutes les variables du SITE" >> $OUTPUT_FILE
echo "  + ✅ NEXT_PUBLIC_VAPID_PUBLIC_KEY (généré ci-dessus)" >> $OUTPUT_FILE
echo "  + ✅ VAPID_PRIVATE_KEY (généré ci-dessus)" >> $OUTPUT_FILE
echo "  + ⏳ Autres variables spécifiques admin (voir apps/admin/.env.example)" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# Instructions finales
echo "═══════════════════════════════════════════════════════════════" >> $OUTPUT_FILE
echo "6️⃣  PROCHAINES ÉTAPES" >> $OUTPUT_FILE
echo "═══════════════════════════════════════════════════════════════" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
echo "1. 📖 Lire ce fichier: cat $OUTPUT_FILE" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
echo "2. 📋 Copier les secrets dans Northflank:" >> $OUTPUT_FILE
echo "   → Aller sur northflank.com" >> $OUTPUT_FILE
echo "   → Services > site/admin > Environment Variables" >> $OUTPUT_FILE
echo "   → Copier-coller les secrets depuis ce fichier" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
echo "3. 🗄️  Créer les users MongoDB:" >> $OUTPUT_FILE
echo "   → MongoDB Atlas > Database Access > Add New User" >> $OUTPUT_FILE
echo "   → Créer prod-site et prod-admin" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
echo "4. 🔷 Créer les webhooks Stripe:" >> $OUTPUT_FILE
echo "   → dashboard.stripe.com/webhooks" >> $OUTPUT_FILE
echo "   → Créer 2 webhooks (site + admin)" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
echo "5. 🗑️  SUPPRIMER CE FICHIER:" >> $OUTPUT_FILE
echo "   rm $OUTPUT_FILE" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
echo "⚠️  NE JAMAIS commit ce fichier dans git !" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> $OUTPUT_FILE

echo "✅ Secrets générés avec succès !"
echo ""
echo "📄 Fichier créé : $OUTPUT_FILE"
echo ""
echo "📋 Prochaines étapes :"
echo "  1. cat $OUTPUT_FILE  # Lire les secrets"
echo "  2. Copier dans Northflank (interface web)"
echo "  3. Créer users MongoDB + webhooks Stripe"
echo "  4. rm $OUTPUT_FILE  # Supprimer le fichier"
echo ""
echo "⚠️  NE PAS commit ce fichier dans git !"
