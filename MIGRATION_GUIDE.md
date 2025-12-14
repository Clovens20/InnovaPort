# Guide de Migration - Génération Automatique d'URL de Portfolio

Ce guide explique comment appliquer la migration pour le système de génération automatique d'URL de portfolio.

## 📋 Prérequis

- Accès à votre projet Supabase
- Accès à l'éditeur SQL de Supabase

## 🚀 Étapes d'Installation

### 1. Appliquer la Migration SQL

1. Connectez-vous à votre projet Supabase
2. Allez dans **SQL Editor**
3. Créez une nouvelle requête
4. Copiez-collez le contenu du fichier `supabase/migrations/001_auto_create_profile_trigger.sql`
5. Exécutez la requête

### 2. Vérifier la Migration

Exécutez cette requête pour vérifier que tout fonctionne :

```sql
-- Vérifier que la colonne subscription_tier existe
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'subscription_tier';

-- Vérifier que la fonction existe
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'generate_username_from_email';

-- Vérifier que le trigger existe
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

### 3. Tester avec un Nouvel Utilisateur

1. Créez un nouveau compte de test
2. Vérifiez que :
   - Un profil est créé automatiquement
   - Le username est généré depuis l'email
   - Le username est unique (si plusieurs utilisateurs avec le même email local)

## 📝 Fonctionnalités Implémentées

### ✅ Génération Automatique de Username

- **Format** : `john.doe@example.com` → `john-doe`
- **Gestion des doublons** : `john-doe-2`, `john-doe-3`, etc.
- **Validation** : 3-30 caractères, lettres/chiffres/tirets uniquement
- **Nettoyage automatique** : Suppression des caractères spéciaux

### ✅ Affichage dans le Dashboard

- URL complète du portfolio affichée
- Bouton de copie pour partager facilement
- Lien direct vers le portfolio
- Indication pour les plans payants

### ✅ Personnalisation (Plans Payants)

- Page de paramètres pour personnaliser l'URL
- Validation en temps réel
- Vérification d'unicité
- Disponible uniquement pour les plans Pro/Business

## 🔧 Structure des Fichiers

```
supabase/
├── migrations/
│   └── 001_auto_create_profile_trigger.sql  # Migration SQL
└── schema.sql                                 # Schéma complet

app/dashboard/
├── _components/
│   └── portfolio-url-card.tsx                # Composant d'affichage URL
├── settings/
│   └── page.tsx                              # Page de paramètres
└── page.tsx                                  # Dashboard (mis à jour)
```

## 🎯 Règles Métier

### Plan Gratuit (Free)
- ✅ Username généré automatiquement depuis l'email
- ❌ Pas de personnalisation possible
- ✅ URL : `https://innovaport.com/john-doe`

### Plan Payant (Pro/Business)
- ✅ Username généré automatiquement (par défaut)
- ✅ Personnalisation possible dans les paramètres
- ✅ Validation stricte (3-30 caractères, format valide)
- ✅ URL personnalisée : `https://innovaport.com/nom-personnalise`

## 🐛 Dépannage

### Le profil n'est pas créé automatiquement

1. Vérifiez que le trigger existe :
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

2. Vérifiez les logs Supabase pour les erreurs

3. Testez manuellement la fonction :
```sql
SELECT generate_username_from_email('test@example.com');
```

### Le username généré contient des caractères invalides

La fonction `generate_username_from_email` nettoie automatiquement les caractères spéciaux. Si vous avez des problèmes, vérifiez que la fonction est bien créée.

### Erreur "username already exists"

C'est normal ! La fonction gère automatiquement les doublons en ajoutant un suffixe numérique.

## 📚 Documentation Supplémentaire

- [Documentation Supabase Triggers](https://supabase.com/docs/guides/database/triggers)
- [Documentation Next.js](https://nextjs.org/docs)

