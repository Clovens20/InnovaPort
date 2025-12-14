# 🚀 Guide de Configuration - InnovaPort

## Problème: "Je n'arrive pas à créer un compte"

### ✅ Solution 1: Vérifier la configuration Supabase

**Étape 1: Exécuter le schéma SQL**

1. Ouvrez votre projet Supabase
2. Allez dans **SQL Editor** (menu de gauche)
3. Cliquez sur **New Query**
4. Copiez **TOUT** le contenu du fichier `supabase/schema.sql`
5. Collez-le dans l'éditeur SQL
6. Cliquez sur **Run** (ou F5)

**Important:** Vous devez voir "Success. No rows returned" ou un message de succès.

---

**Étape 2: Vérifier les variables d'environnement**

Vérifiez que votre fichier `.env` contient :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
```

**Où trouver ces clés:**
- Supabase Dashboard → Settings → API
- `NEXT_PUBLIC_SUPABASE_URL` = Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon public key
- `SUPABASE_SERVICE_ROLE_KEY` = service_role key (⚠️ SECRET, ne pas exposer côté client)

---

**Étape 3: Configurer l'authentification Supabase**

1. Allez dans **Authentication** → **Settings**
2. **Email Auth:**
   - ✅ Activez "Enable Email Signup"
   - Pour le développement, vous pouvez désactiver "Confirm email" (Settings → Email Auth → Confirm email = OFF)
   - Pour la production, gardez la confirmation activée

3. **Site URL:**
   - Définissez `http://localhost:3000` pour le développement
   - Ajoutez `http://localhost:3000/**` dans "Redirect URLs"

---

**Étape 4: Vérifier que le trigger fonctionne**

1. Allez dans **Table Editor** → `profiles`
2. Créez un compte via `/auth/register`
3. Vérifiez que :
   - Un utilisateur apparaît dans **Authentication** → **Users**
   - Un profil apparaît automatiquement dans **Table Editor** → `profiles`

Si le profil n'est pas créé automatiquement :
- Vérifiez que le trigger `on_auth_user_created` existe dans SQL Editor
- Vérifiez les logs dans Supabase Dashboard → Logs

---

### ✅ Solution 2: Tester la création de compte

**Test manuel:**

1. Allez sur `http://localhost:3000/auth/register`
2. Remplissez le formulaire :
   - Nom complet
   - Email valide
   - Mot de passe (min 8 caractères)
3. Cliquez sur "Commencer gratuitement"

**Résultats possibles:**

✅ **Succès avec session:**
- Message: "Compte créé avec succès ! Redirection..."
- Redirection automatique vers `/dashboard`
- ✅ Le compte fonctionne immédiatement

✅ **Succès avec confirmation email:**
- Message: "Compte créé ! Vérifiez votre email..."
- Redirection vers `/auth/login`
- 📧 Vérifiez votre boîte email (et spam)
- Cliquez sur le lien de confirmation
- Connectez-vous ensuite

❌ **Erreur:**
- Vérifiez le message d'erreur affiché
- Ouvrez la console du navigateur (F12) pour plus de détails
- Vérifiez les logs Supabase

---

### ✅ Solution 3: Erreurs courantes

**"User already registered"**
- L'email est déjà utilisé
- Essayez avec un autre email ou connectez-vous

**"Password should be at least 6 characters"**
- Le mot de passe doit faire au moins 8 caractères (configuré dans le code)
- Utilisez un mot de passe plus long

**"Email rate limit exceeded"**
- Trop de tentatives d'inscription
- Attendez quelques minutes

**"Invalid API key"**
- Vérifiez que `NEXT_PUBLIC_SUPABASE_ANON_KEY` est correct
- Vérifiez qu'il n'y a pas d'espaces dans le `.env`

**"Profile not created"**
- Le trigger SQL n'a pas été exécuté
- Vérifiez que `supabase/schema.sql` a été exécuté complètement
- Vérifiez que la fonction `handle_new_user()` existe

**"RLS policy violation"**
- Vérifiez que les politiques RLS sont correctement configurées
- Le schéma SQL devrait avoir configuré tout cela

---

### ✅ Solution 4: Créer un profil manuellement (si le trigger ne fonctionne pas)

Si le trigger ne fonctionne pas, vous pouvez créer le profil manuellement :

1. Créez un compte via `/auth/register`
2. Notez l'ID de l'utilisateur (dans Authentication → Users)
3. Allez dans SQL Editor et exécutez :

```sql
INSERT INTO public.profiles (id, username, full_name, email)
VALUES (
    'VOTRE_USER_ID_ICI',
    'username_test',
    'Nom Test',
    'test@example.com'
);
```

Remplacez `VOTRE_USER_ID_ICI` par l'ID réel de l'utilisateur.

---

### ✅ Solution 5: Vérifier les logs

**Console navigateur (F12):**
- Onglet Console → Cherchez les erreurs en rouge
- Onglet Network → Vérifiez les requêtes vers Supabase

**Logs Supabase:**
- Dashboard → Logs → API Logs
- Cherchez les erreurs lors de l'inscription

**Logs serveur:**
- Terminal où tourne `npm run dev`
- Regardez les erreurs affichées

---

### 🔍 Debug avancé

**Tester la connexion Supabase:**

Créez un fichier de test temporaire `test-supabase.js` :

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Test signup
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'testpassword123',
  options: {
    data: {
      full_name: 'Test User'
    }
  }
});

console.log('Data:', data);
console.log('Error:', error);
```

---

### 📞 Checklist de vérification

Avant de créer un compte, vérifiez :

- [ ] Le schéma SQL a été exécuté dans Supabase
- [ ] Les variables `.env` sont correctement configurées
- [ ] Le serveur Next.js tourne (`npm run dev`)
- [ ] Email Auth est activé dans Supabase
- [ ] Le trigger `on_auth_user_created` existe
- [ ] Les politiques RLS sont configurées
- [ ] Pas d'erreurs dans la console navigateur
- [ ] Pas d'erreurs dans les logs Supabase

---

**Dernière mise à jour:** 9 décembre 2024

