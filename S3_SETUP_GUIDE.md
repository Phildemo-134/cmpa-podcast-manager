# Guide de Configuration S3 pour l'Upload Audio

## Vue d'ensemble

Ce guide vous aide à configurer Amazon S3 pour permettre l'upload de fichiers audio dans l'application CMPA Podcast Manager.

## Prérequis

- Compte AWS avec accès à S3
- Permissions pour créer des buckets et des utilisateurs IAM
- Application Next.js configurée avec les variables d'environnement

## Étape 1 : Créer un Bucket S3

1. Connectez-vous à la [Console AWS S3](https://console.aws.amazon.com/s3/)
2. Cliquez sur "Create bucket"
3. Choisissez un nom unique pour votre bucket (ex: `cmpa-podcast-audio-2024`)
4. Sélectionnez la région de votre choix (recommandé: `us-east-1`)
5. **Important** : Décochez "Block all public access" pour permettre l'accès privé
6. Cliquez sur "Create bucket"

## Étape 2 : Configurer les Permissions du Bucket

1. Sélectionnez votre bucket créé
2. Allez dans l'onglet "Permissions"
3. Dans "Bucket policy", ajoutez la politique suivante :

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PrivateAccess",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::VOTRE_BUCKET_NAME/*",
      "Condition": {
        "StringNotEquals": {
          "aws:PrincipalArn": "arn:aws:iam::VOTRE_ACCOUNT_ID:user/VOTRE_IAM_USER"
        }
      }
    }
  ]
}
```

**Remplacez** :
- `VOTRE_BUCKET_NAME` par le nom de votre bucket
- `VOTRE_ACCOUNT_ID` par votre ID de compte AWS
- `VOTRE_IAM_USER` par le nom de l'utilisateur IAM que vous allez créer

## Étape 3 : Créer un Utilisateur IAM

1. Allez dans la [Console IAM](https://console.aws.amazon.com/iam/)
2. Cliquez sur "Users" puis "Create user"
3. Nommez l'utilisateur (ex: `cmpa-podcast-s3-user`)
4. Attachez la politique `AmazonS3FullAccess` (ou créez une politique personnalisée plus restrictive)
5. Créez l'utilisateur

## Étape 4 : Générer les Clés d'Accès

1. Sélectionnez l'utilisateur IAM créé
2. Allez dans l'onglet "Security credentials"
3. Cliquez sur "Create access key"
4. Choisissez "Application running outside AWS"
5. Copiez l'`Access key ID` et la `Secret access key`

## Étape 5 : Configurer les Variables d'Environnement

Créez ou mettez à jour votre fichier `.env.local` :

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=votre_access_key_id
AWS_SECRET_ACCESS_KEY=votre_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=votre_bucket_name

# Autres variables existantes...
NEXT_PUBLIC_SUPABASE_URL=votre_supabase_url
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

## Étape 6 : Tester la Configuration

1. Redémarrez votre serveur de développement
2. Naviguez vers `/upload` dans votre application
3. Essayez d'uploader un petit fichier audio de test
4. Vérifiez dans la console S3 que le fichier apparaît

## Politique IAM Personnalisée (Optionnel)

Pour plus de sécurité, créez une politique IAM personnalisée :

```json
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
        "arn:aws:s3:::VOTRE_BUCKET_NAME",
        "arn:aws:s3:::VOTRE_BUCKET_NAME/*"
      ]
    }
  ]
}
```

## Dépannage

### Erreur "Access Denied"
- Vérifiez que les clés d'accès sont correctes
- Vérifiez que l'utilisateur IAM a les bonnes permissions
- Vérifiez que le nom du bucket est correct

### Erreur "Bucket not found"
- Vérifiez que le bucket existe dans la bonne région
- Vérifiez la variable `AWS_REGION`

### Fichiers non visibles
- Vérifiez que le bucket n'a pas de politique de blocage public
- Vérifiez que l'utilisateur IAM peut lister le contenu du bucket

## Sécurité

- Ne partagez jamais vos clés d'accès
- Utilisez des politiques IAM restrictives
- Activez la journalisation CloudTrail pour auditer l'accès
- Considérez l'utilisation de rôles IAM temporaires pour la production

## Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs de la console Next.js
2. Vérifiez les logs CloudWatch d'AWS
3. Testez avec le script : `npm run test:upload`
