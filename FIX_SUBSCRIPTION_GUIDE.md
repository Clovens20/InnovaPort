# Guide de correction des abonnements

## Problème
Un utilisateur a payé pour un plan (Pro ou Premium) mais son `subscription_tier` dans la table `profiles` reste sur `free`.

## Solutions

### Solution 1: Script SQL (Rapide)
Si l'abonnement existe déjà dans la table `subscriptions` mais que le profil n'est pas à jour :

1. Ouvrez Supabase SQL Editor
2. Exécutez le script `scripts/fix-subscription-sql.sql`
3. Vérifiez le résultat avec la requête de vérification

### Solution 2: API Admin (Recommandé)
Si vous avez besoin de synchroniser avec Stripe :

1. Assurez-vous que le serveur Next.js est en cours d'exécution
2. Connectez-vous en tant qu'admin
3. Appelez l'API :

```bash
curl -X POST http://localhost:3000/api/admin/fix-subscription \
  -H "Content-Type: application/json" \
  -H "Cookie: votre-session-cookie" \
  -d '{"userId": "a2899617-429d-4e52-8862-ea0ab3d035f7"}'
```

Ou depuis le navigateur (console JavaScript) :

```javascript
const response = await fetch('/api/admin/fix-subscription', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    userId: 'a2899617-429d-4e52-8862-ea0ab3d035f7' 
  })
});
const result = await response.json();
console.log(result);
```

### Solution 3: Script TypeScript (Si variables d'environnement disponibles)
```bash
# Assurez-vous que les variables d'environnement sont définies
npx tsx scripts/fix-subscription-direct.ts a2899617-429d-4e52-8862-ea0ab3d035f7
```

## Vérification
Après correction, vérifiez que :
1. `profiles.subscription_tier` = `pro` ou `premium`
2. `subscriptions.plan` correspond au plan dans Stripe
3. `subscriptions.status` = `active`

## Prévention
Les améliorations apportées au webhook Stripe (`app/api/webhooks/stripe/route.ts`) devraient empêcher ce problème à l'avenir :
- Récupération du `user_id` depuis plusieurs sources
- Mise à jour automatique du plan depuis le Price ID Stripe
- Meilleure gestion des erreurs avec logs détaillés

