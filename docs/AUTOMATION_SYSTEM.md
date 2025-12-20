# Système d'Automatisation InnovaPort

## Vue d'ensemble

Le système d'automatisation d'InnovaPort gère automatiquement :
1. ✅ **Réponses automatiques aux prospects** - Templates personnalisés envoyés immédiatement après soumission du formulaire
2. ✅ **Notifications de nouveaux devis** - Email au développeur lorsqu'un nouveau devis est reçu
3. ✅ **Rappels de suivi automatiques** - Rappels par email pour les devis en attente
4. ✅ **Notifications de changement de statut** - Emails automatiques aux clients lors des mises à jour de statut

## Architecture

### 1. Réponses Automatiques

**Fichiers concernés :**
- `supabase/schema.sql` - Table `auto_response_templates`
- `app/dashboard/settings/page.tsx` - Interface de configuration
- `app/api/quotes/route.ts` - Logique de matching et envoi
- `utils/resend.ts` - Fonction `sendAutoResponseEmail()`

**Fonctionnement :**
1. Le développeur configure des templates avec conditions (type de projet, budget)
2. Lorsqu'un prospect soumet un devis, le système cherche un template correspondant
3. Si un template correspond, il est envoyé automatiquement au prospect
4. Sinon, un email de confirmation standard est envoyé

**Variables disponibles dans les templates :**
- `{{clientName}}` - Nom du client
- `{{projectType}}` - Type de projet
- `{{budget}}` - Budget estimé
- `{{description}}` - Description du projet
- `{{deadline}}` - Délai souhaité
- `{{developerName}}` - Nom du développeur
- `{{developerEmail}}` - Email du développeur

### 2. Notifications de Nouveaux Devis

**Fichiers concernés :**
- `app/api/quotes/route.ts` - Envoi lors de la création
- `utils/resend.ts` - Fonction `sendQuoteNotificationEmail()`

**Fonctionnement :**
- Envoyé automatiquement au développeur lorsqu'un nouveau devis est reçu
- Contient toutes les informations du devis
- Lien direct vers le dashboard

### 3. Rappels de Suivi Automatiques

**Fichiers concernés :**
- `supabase/schema.sql` - Table `quote_reminder_settings` et colonnes dans `quotes`
- `app/api/quotes/reminders/route.ts` - Route API pour les rappels
- `app/dashboard/settings/page.tsx` - Interface de configuration
- `utils/resend.ts` - Fonction `sendFollowUpReminderEmail()`

**Fonctionnement :**
1. Le développeur configure les jours de rappel (ex: 3, 7, 14 jours)
2. Un cron job ou webhook appelle `/api/quotes/reminders` quotidiennement
3. Le système vérifie tous les devis en attente (`status: 'new'` ou `'discussing'`)
4. Pour chaque devis correspondant aux critères, un rappel est envoyé au développeur
5. Le système enregistre la date du dernier rappel et le nombre de rappels envoyés

**Configuration du cron job :**

Pour Vercel, ajoutez dans `vercel.json` :
```json
{
  "crons": [{
    "path": "/api/quotes/reminders",
    "schedule": "0 9 * * *"
  }]
}
```

Pour un webhook externe (GitHub Actions, etc.), configurez un appel POST quotidien avec le header :
```
Authorization: Bearer YOUR_TOKEN
ou
X-Cron-Secret: YOUR_CRON_SECRET
```

**Variables d'environnement nécessaires :**
```env
CRON_SECRET=your-secret-key-here  # Optionnel, pour sécuriser les appels cron
```

### 4. Notifications de Changement de Statut

**Fichiers concernés :**
- `app/api/quotes/[id]/status/route.ts` - Route API pour les mises à jour
- `app/dashboard/quotes/[id]/page.tsx` - Interface utilisateur
- `utils/resend.ts` - Fonction `sendStatusUpdateEmail()`

**Fonctionnement :**
1. Lorsqu'un développeur change le statut d'un devis, la route API est appelée
2. Le système vérifie si les notifications sont activées dans les paramètres
3. Si activé et si le client a consenti aux communications, un email est envoyé
4. L'email contient l'ancien et le nouveau statut avec un design professionnel

**Statuts disponibles :**
- `new` - Nouvelle demande
- `discussing` - En discussion
- `quoted` - Devis envoyé
- `accepted` - Acceptée
- `rejected` - Refusée

## Configuration

### Interface Utilisateur

Les développeurs peuvent configurer l'automatisation depuis :
**Dashboard → Paramètres → Sections :**
1. **Réponses automatiques** - Créer et gérer les templates
2. **Rappels automatiques** - Configurer les jours de rappel et les notifications

### Base de Données

**Tables créées :**
- `auto_response_templates` - Templates de réponses automatiques
- `quote_reminder_settings` - Paramètres de rappels par utilisateur

**Colonnes ajoutées à `quotes` :**
- `last_reminder_sent_at` - Date du dernier rappel envoyé
- `reminders_count` - Nombre total de rappels envoyés

## Sécurité

- ✅ Authentification requise pour toutes les routes API
- ✅ Vérification de propriété (les développeurs ne peuvent gérer que leurs propres devis)
- ✅ Rate limiting sur les routes publiques
- ✅ RLS (Row Level Security) activé sur toutes les tables
- ✅ Validation des données côté serveur

## Tests

Pour tester le système :

1. **Réponses automatiques :**
   - Créer un template dans Settings
   - Soumettre un devis correspondant aux conditions
   - Vérifier la réception de l'email automatique

2. **Rappels :**
   - Configurer les rappels dans Settings
   - Créer un devis avec status 'new'
   - Appeler manuellement `/api/quotes/reminders` (GET en dev)
   - Vérifier la réception du rappel

3. **Notifications de statut :**
   - Activer les notifications dans Settings
   - Changer le statut d'un devis
   - Vérifier la réception de l'email au client

## Maintenance

### Logs

Tous les envois d'emails sont loggés dans la console en développement. En production, considérez :
- Intégration avec un service de logging (Sentry, LogRocket, etc.)
- Monitoring des taux d'échec d'envoi
- Alertes pour les erreurs critiques

### Performance

- Les emails sont envoyés en parallèle quand possible
- Les erreurs d'envoi n'interrompent pas le flux principal
- Les rappels sont traités par batch pour optimiser les performances

## Prochaines Améliorations Possibles

- [ ] Dashboard analytics pour les taux de réponse
- [ ] Templates de rappels personnalisables
- [ ] Notifications SMS (optionnel)
- [ ] Intégration avec calendrier pour rappels intelligents
- [ ] A/B testing des templates de réponses

