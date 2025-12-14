# 🔧 Guide de Dépannage - InnovaPort

## Problème: "Je n'arrive pas à visualiser le projet"

### ✅ Solution 1: Vérifier que le serveur tourne

1. **Lancer le serveur de développement:**
   ```bash
   npm run dev
   ```

2. **Vérifier que le serveur démarre correctement:**
   - Vous devriez voir: `✓ Ready in Xms`
   - URL locale: `http://localhost:3000` (ou 3001 si 3000 est occupé)

3. **Ouvrir dans le navigateur:**
   - Accédez à `http://localhost:3000`
   - Vous devriez voir la page d'accueil

---

### ✅ Solution 2: Vérifier les erreurs de build

Si le serveur ne démarre pas, vérifiez les erreurs:

```bash
npm run build
```

**Erreurs courantes:**
- Variables d'environnement manquantes → Vérifiez `.env`
- Erreurs TypeScript → Vérifiez la console
- Port déjà utilisé → Changez le port ou tuez le processus

---

### ✅ Solution 3: Routes disponibles

**Pages publiques:**
- `/` - Page d'accueil
- `/[username]` - Portfolio public (ex: `/johndoe`)
- `/[username]/contact` - Formulaire de devis
- `/preview/[subdomain]` - Preview portfolio (ancienne route, compatible)
- `/preview/[subdomain]/contact` - Formulaire de devis (ancienne route)

**Pages authentifiées:**
- `/auth/login` - Connexion
- `/auth/register` - Inscription
- `/dashboard` - Dashboard (redirige vers `/dashboard/projects`)
- `/dashboard/projects` - Liste des projets
- `/dashboard/projects/new` - Créer un projet
- `/dashboard/quotes` - Liste des devis
- `/dashboard/appearance` - Personnalisation
- `/dashboard/billing` - Abonnement

**API Routes:**
- `POST /api/quotes` - Enregistrer un devis
- `POST /api/analytics` - Tracker un événement

---

### ✅ Solution 4: Vérifier la configuration Supabase

**Important:** Pour que les portfolios fonctionnent, vous devez:

1. **Exécuter le schéma SQL:**
   - Ouvrez Supabase Dashboard
   - Allez dans SQL Editor
   - Copiez/collez le contenu de `supabase/schema.sql`
   - Exécutez le script

2. **Vérifier les variables d'environnement dans `.env`:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
   SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
   ```

3. **Créer un profil de test:**
   - Inscrivez-vous via `/auth/register`
   - Le profil sera créé automatiquement
   - Mettez à jour votre profil avec un `username` ou `subdomain`

---

### ✅ Solution 5: Tester le flux complet

1. **Créer un compte:**
   - Allez sur `/auth/register`
   - Créez un compte

2. **Configurer votre profil:**
   - Allez dans le dashboard
   - Configurez votre `username` (ex: "johndoe")
   - Ajoutez une bio, titre, etc.

3. **Créer un projet:**
   - Allez sur `/dashboard/projects/new`
   - Créez un projet
   - **Important:** Cochez "Publié" pour qu'il apparaisse sur votre portfolio

4. **Voir votre portfolio:**
   - Visitez `/[votre-username]` (ex: `/johndoe`)
   - Vous devriez voir votre portfolio avec vos projets

5. **Tester le formulaire de devis:**
   - Visitez `/[votre-username]/contact`
   - Remplissez le formulaire
   - Soumettez-le
   - Vérifiez dans `/dashboard/quotes`

---

### ❌ Erreurs courantes

**"Portfolio non trouvé" (404):**
- Vérifiez que le profil existe dans Supabase
- Vérifiez que le `username` ou `subdomain` correspond
- Vérifiez que RLS permet la lecture publique

**"Erreur lors de l'enregistrement du devis":**
- Vérifiez que `SUPABASE_SERVICE_ROLE_KEY` est configuré
- Vérifiez que la table `quotes` existe
- Vérifiez les logs dans la console serveur

**"Email non envoyé":**
- Vérifiez que `RESEND_API_KEY` est configuré
- Vérifiez que le domaine est configuré dans Resend
- Les emails peuvent échouer silencieusement (vérifiez les logs)

**Page blanche:**
- Ouvrez la console du navigateur (F12)
- Vérifiez les erreurs JavaScript
- Vérifiez les erreurs réseau (onglet Network)

---

### 🔍 Debug

**Vérifier les logs:**
```bash
# Terminal où tourne npm run dev
# Regardez les erreurs affichées
```

**Vérifier la console navigateur:**
- F12 → Console
- Cherchez les erreurs en rouge

**Vérifier Supabase:**
- Dashboard → Table Editor
- Vérifiez que les tables existent
- Vérifiez que les données sont présentes

---

### 📞 Support

Si le problème persiste:
1. Vérifiez les logs du serveur (`npm run dev`)
2. Vérifiez la console du navigateur (F12)
3. Vérifiez que toutes les variables d'environnement sont configurées
4. Vérifiez que le schéma SQL a été exécuté

---

**Dernière mise à jour:** 9 décembre 2024

