# Configuration Square pour les Abonnements

## ✅ Système de Paiement Implémenté avec Square

Le système de paiement Square est maintenant **complètement fonctionnel**. Les utilisateurs peuvent s'abonner aux plans Pro ($19/mois) et Premium ($39/mois) en cliquant sur les boutons "Choisir Pro" ou "Choisir Premium".

## 📋 Configuration Requise

### 1. Créer un compte Square
- Allez sur [squareup.com](https://squareup.com) et créez un compte
- Activez le mode sandbox pour commencer

### 2. Créer une Application Square

1. **Allez dans Square Developer Dashboard** : [developer.squareup.com](https://developer.squareup.com)
2. **Créez une nouvelle application**
3. **Activez les APIs suivantes :**
   - Payments API
   - Subscriptions API
   - Customers API
4. **Copiez les clés :**
   - **Access Token** (commence par `sq0atp-...`)
   - **Application ID** (commence par `sq0idp-...`)
   - **Location ID** (trouvé dans Square Dashboard > Locations)

### 3. Créer les Plans d'Abonnement dans Square Dashboard

1. **Allez dans Square Dashboard > Subscriptions > Plans**
2. **Créez deux plans avec leurs variations :**

   **Plan 1 : InnovaPort Pro**
   - Créez un plan "InnovaPort Pro"
   - Ajoutez une variation mensuelle avec prix : $19.00 USD / mois
   - Copiez le **Plan Variation ID** (commence par quelque chose comme `6JHXF3B2CW3YKHDV4XEM674H`)

   **Plan 2 : InnovaPort Premium**
   - Créez un plan "InnovaPort Premium"
   - Ajoutez une variation mensuelle avec prix : $39.00 USD / mois
   - Copiez le **Plan Variation ID**

### 4. Configurer les Variables d'Environnement

Ajoutez ces variables dans votre fichier `.env` :

```env
# Square Keys (récupérées dans Square Developer Dashboard)
SQUARE_ACCESS_TOKEN=sq0atp-...
SQUARE_APPLICATION_ID=sq0idp-...
SQUARE_LOCATION_ID=...
SQUARE_ENVIRONMENT=sandbox
# Pour la production, changez en: SQUARE_ENVIRONMENT=production

# Square Plan Variation IDs (copiés depuis les variations de plans créées)
SQUARE_PLAN_VARIATION_ID_PRO=...
SQUARE_PLAN_VARIATION_ID_PREMIUM=...

# Square Webhook Secret (voir section Webhooks ci-dessous)
SQUARE_WEBHOOK_SECRET=...
```

### 5. Configurer les Webhooks Square

Les webhooks permettent à Square de notifier votre application quand un paiement est effectué.

1. **Allez dans Square Developer Dashboard > Webhooks**
2. **Cliquez sur "Add endpoint"**
3. **URL du webhook :** `https://votre-domaine.com/api/webhooks/square`
   - En développement local, utilisez [ngrok](https://ngrok.com) ou similaire pour exposer votre serveur local
4. **Sélectionnez les événements à écouter :**
   - `checkout.updated`
   - `subscription.updated`
   - `subscription.canceled`
5. **Copiez le "Webhook signature key"** et ajoutez-le à `SQUARE_WEBHOOK_SECRET`

## 🚀 Fonctionnalités Implémentées

### ✅ API Routes Créées

1. **`/api/checkout`** (POST)
   - Crée une session de paiement Square Checkout
   - Gère la création des customers Square
   - Redirige l'utilisateur vers Square pour le paiement

2. **`/api/webhooks/square`** (POST)
   - Reçoit les événements Square
   - Met à jour automatiquement les abonnements dans la base de données
   - Met à jour le `subscription_tier` dans le profil utilisateur

### ✅ Interface Utilisateur

- **Page `/dashboard/billing`** :
  - Affiche les 3 plans (Gratuit, Pro, Premium)
  - Boutons "Choisir Pro" et "Choisir Premium" fonctionnels
  - Détection automatique du plan actuel
  - Redirection vers Square Checkout après clic
  - Message de succès après paiement

### ✅ Gestion des Abonnements

- **Création d'abonnement** : Lorsqu'un utilisateur paie, son plan est automatiquement mis à jour
- **Mise à jour d'abonnement** : Si un utilisateur change de plan, l'abonnement Square est mis à jour
- **Annulation** : Si un abonnement est annulé, l'utilisateur revient automatiquement au plan gratuit

## 📝 Table `subscriptions`

La table `subscriptions` stocke :
- `square_customer_id` : ID du customer Square
- `square_subscription_id` : ID de l'abonnement Square
- `plan` : Plan actuel (free, pro, premium)
- `status` : Statut de l'abonnement (active, canceled, etc.)
- `current_period_start` / `current_period_end` : Dates de la période actuelle

## 🔒 Sécurité

- Les webhooks sont vérifiés avec la signature Square (HMAC SHA256)
- Les clés secrètes ne sont jamais exposées côté client
- Utilisation du service role key Supabase pour les mises à jour

## 🧪 Test en Mode Développement

1. Utilisez le mode sandbox Square (`SQUARE_ENVIRONMENT=sandbox`)
2. Utilisez [ngrok](https://ngrok.com) pour exposer votre serveur local :
   ```bash
   ngrok http 3000
   ```
   Puis configurez l'URL ngrok dans Square Webhooks
3. Utilisez les cartes de test Square :
   - Succès : `4111 1111 1111 1111`
   - Échec : `4000 0000 0000 0002`
   - Date d'expiration : n'importe quelle date future
   - CVC : n'importe quel 3 chiffres
   - Code postal : n'importe quel code postal valide

## 📚 Documentation Square

- [Square Payments API](https://developer.squareup.com/docs/payments-api/overview)
- [Square Subscriptions API](https://developer.squareup.com/docs/subscriptions-api/overview)
- [Square Webhooks](https://developer.squareup.com/docs/webhooks/overview)

## 🔄 Migration depuis Stripe

Si vous migrez depuis Stripe :
1. Les colonnes `stripe_customer_id` et `stripe_subscription_id` ont été remplacées par `square_customer_id` et `square_subscription_id`
2. Mettez à jour toutes les variables d'environnement
3. Les webhooks doivent être reconfigurés dans Square Dashboard

