# Guide de dépannage Analytics

## Problème : Les statistiques analytics restent à zéro

### Vérifications à faire :

#### 1. Vérifier que la migration SQL a été exécutée

La migration `019_enable_anonymous_analytics.sql` doit être exécutée dans Supabase pour permettre le tracking des visiteurs anonymes.

**Étapes :**
1. Aller dans Supabase Dashboard → SQL Editor
2. Exécuter le contenu du fichier `supabase/migrations/019_enable_anonymous_analytics.sql`
3. Vérifier que la colonne `user_id` peut être NULL :
   ```sql
   SELECT column_name, is_nullable 
   FROM information_schema.columns 
   WHERE table_name = 'analytics' AND column_name = 'user_id';
   ```
   Le résultat doit montrer `is_nullable = 'YES'`

4. Vérifier que `page_view` est dans les types d'événements valides :
   ```sql
   SELECT constraint_name, check_clause 
   FROM information_schema.check_constraints 
   WHERE constraint_name = 'analytics_event_type_check';
   ```
   Le résultat doit inclure `'page_view'` dans la liste

#### 2. Tester le système de tracking

**En développement :**
1. Ouvrir la console du navigateur (F12)
2. Visiter une page publique (ex: `/`, `/blog`, `/contact`)
3. Vérifier dans la console qu'il y a un message `✅ Page view tracked: /path`
4. Si vous voyez une erreur, noter le message

**En production :**
1. Visiter une page publique
2. Vérifier dans les logs serveur que l'API `/api/analytics` est appelée
3. Vérifier qu'il n'y a pas d'erreurs 400 ou 500

#### 3. Vérifier les données dans la base

**Via Supabase Dashboard :**
1. Aller dans Table Editor → `analytics`
2. Vérifier qu'il y a des enregistrements avec :
   - `user_id` = NULL
   - `event_type` = 'page_view'
   - `path` = '/', '/blog', etc.

**Via l'API de test :**
1. Aller sur `/api/admin/analytics/test` (en étant connecté en tant qu'admin)
2. Vérifier les diagnostics retournés

#### 4. Vérifier le filtrage dans l'API admin

L'API `/api/admin/analytics` filtre les événements pour ne garder que ceux du site principal.

**Vérifications :**
- Les événements avec `user_id = NULL` sont toujours inclus
- Les événements avec `event_type = 'page_view'` sont inclus
- Les paths commençant par `/admin`, `/dashboard`, `/auth` sont exclus

#### 5. Problèmes courants et solutions

**Problème : "Aucune donnée disponible"**
- ✅ Vérifier que la migration a été exécutée
- ✅ Vérifier qu'il y a des événements dans la table `analytics`
- ✅ Vérifier que la période sélectionnée correspond aux dates des événements

**Problème : "Les visites ne sont pas trackées"**
- ✅ Vérifier que le composant `PageTracker` est bien dans `app/layout.tsx`
- ✅ Vérifier la console du navigateur pour les erreurs
- ✅ Vérifier que les pages visitées ne sont pas dans `EXCLUDED_PATHS`

**Problème : "Erreur 400 lors du tracking"**
- ✅ Vérifier que `eventType: 'page_view'` est bien envoyé
- ✅ Vérifier que le schéma de validation accepte `userId` optionnel
- ✅ Vérifier les logs serveur pour plus de détails

**Problème : "Erreur 500 lors du tracking"**
- ✅ Vérifier que `SUPABASE_SERVICE_ROLE_KEY` est défini dans les variables d'environnement
- ✅ Vérifier que la table `analytics` existe et a la bonne structure
- ✅ Vérifier les logs serveur pour plus de détails

### Commandes SQL utiles

**Vérifier la structure de la table :**
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'analytics'
ORDER BY ordinal_position;
```

**Voir les derniers événements :**
```sql
SELECT id, user_id, event_type, path, created_at
FROM analytics
ORDER BY created_at DESC
LIMIT 10;
```

**Compter les événements par type :**
```sql
SELECT event_type, COUNT(*) as count
FROM analytics
GROUP BY event_type;
```

**Compter les événements avec user_id NULL :**
```sql
SELECT COUNT(*) as count
FROM analytics
WHERE user_id IS NULL;
```

### Test manuel du tracking

Pour tester manuellement le tracking, vous pouvez appeler l'API directement :

```bash
curl -X POST http://localhost:3000/api/analytics \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "page_view",
    "path": "/test",
    "referrer": null
  }'
```

En production, remplacez `localhost:3000` par votre domaine.

### Support

Si le problème persiste après avoir suivi ce guide :
1. Vérifier les logs serveur (Vercel, etc.)
2. Vérifier les logs Supabase
3. Vérifier la console du navigateur
4. Contacter le support avec les informations collectées

