#!/bin/bash

# Script de configuration S3 pour CMPA Podcast Manager
# Ce script configure un bucket S3 avec les bonnes permissions et politiques

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Configuration S3 pour CMPA Podcast Manager${NC}"

# Vérifier que AWS CLI est installé
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI n'est pas installé. Veuillez l'installer d'abord.${NC}"
    echo "Installation: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Vérifier la configuration AWS
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS CLI n'est pas configuré. Veuillez exécuter 'aws configure' d'abord.${NC}"
    exit 1
fi

# Demander le nom du bucket
read -p "Nom du bucket S3 (ex: cmpa-podcast-audio): " BUCKET_NAME

if [ -z "$BUCKET_NAME" ]; then
    echo -e "${RED}❌ Nom de bucket requis${NC}"
    exit 1
fi

# Demander la région
read -p "Région AWS (défaut: us-east-1): " REGION
REGION=${REGION:-us-east-1}

echo -e "${YELLOW}📦 Création du bucket S3...${NC}"

# Créer le bucket
aws s3api create-bucket \
    --bucket "$BUCKET_NAME" \
    --region "$REGION" \
    --create-bucket-configuration LocationConstraint="$REGION" 2>/dev/null || \
aws s3api create-bucket \
    --bucket "$BUCKET_NAME" \
    --region "$REGION" 2>/dev/null

echo -e "${GREEN}✅ Bucket créé: $BUCKET_NAME${NC}"

# Activer le chiffrement par défaut
echo -e "${YELLOW}🔐 Configuration du chiffrement...${NC}"
aws s3api put-bucket-encryption \
    --bucket "$BUCKET_NAME" \
    --server-side-encryption-configuration '{
        "Rules": [
            {
                "ApplyServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                }
            }
        ]
    }'

echo -e "${GREEN}✅ Chiffrement activé${NC}"

# Désactiver l'accès public
echo -e "${YELLOW}🚫 Désactivation de l'accès public...${NC}"
aws s3api put-public-access-block \
    --bucket "$BUCKET_NAME" \
    --public-access-block-configuration \
        BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

echo -e "${GREEN}✅ Accès public désactivé${NC}"

# Créer la politique de bucket
echo -e "${YELLOW}📋 Configuration de la politique de bucket...${NC}"
cat > /tmp/bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "DenyUnencryptedObjectUploads",
            "Effect": "Deny",
            "Principal": "*",
            "Action": "s3:PutObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*",
            "Condition": {
                "StringNotEquals": {
                    "s3:x-amz-server-side-encryption": "AES256"
                }
            }
        },
        {
            "Sid": "DenyIncorrectEncryptionHeader",
            "Effect": "Deny",
            "Principal": "*",
            "Action": "s3:PutObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*",
            "Condition": {
                "StringNotEquals": {
                    "s3:x-amz-server-side-encryption": "AES256"
                }
            }
        },
        {
            "Sid": "DenyUnencryptedObjectUploads",
            "Effect": "Deny",
            "Principal": "*",
            "Action": "s3:PutObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*",
            "Condition": {
                "Null": {
                    "s3:x-amz-server-side-encryption": "true"
                }
            }
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy file:///tmp/bucket-policy.json

echo -e "${GREEN}✅ Politique de bucket configurée${NC}"

# Créer la politique IAM pour l'application
echo -e "${YELLOW}👤 Création de la politique IAM...${NC}"
cat > /tmp/app-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::$BUCKET_NAME",
                "arn:aws:s3:::$BUCKET_NAME/*"
            ]
        }
    ]
}
EOF

POLICY_NAME="CMPAPodcastManagerS3Policy"
aws iam create-policy \
    --policy-name "$POLICY_NAME" \
    --policy-document file:///tmp/app-policy.json \
    --description "Politique S3 pour CMPA Podcast Manager" 2>/dev/null || \
echo -e "${YELLOW}⚠️  La politique existe déjà${NC}"

echo -e "${GREEN}✅ Politique IAM créée: $POLICY_NAME${NC}"

# Nettoyer les fichiers temporaires
rm -f /tmp/bucket-policy.json /tmp/app-policy.json

echo -e "${GREEN}🎉 Configuration S3 terminée avec succès!${NC}"
echo ""
echo -e "${YELLOW}📝 Prochaines étapes:${NC}"
echo "1. Créer un utilisateur IAM avec accès programmatique"
echo "2. Attacher la politique $POLICY_NAME à cet utilisateur"
echo "3. Récupérer les clés d'accès et les ajouter à votre .env.local"
echo ""
echo -e "${YELLOW}🔑 Variables d'environnement à configurer:${NC}"
echo "AWS_ACCESS_KEY_ID=votre_access_key"
echo "AWS_SECRET_ACCESS_KEY=votre_secret_key"
echo "AWS_S3_BUCKET=$BUCKET_NAME"
echo "AWS_REGION=$REGION"
echo ""
echo -e "${GREEN}✅ Votre bucket S3 est prêt à recevoir des fichiers audio!${NC}"
