# 🔧 Configuration reCAPTCHA pour Localhost

**Guide rapide pour activer le reCAPTCHA en développement local**

---

## ✅ ÉTAPES RAPIDES

### 1. Créer/Modifier votre site reCAPTCHA

1. Aller sur https://www.google.com/recaptcha/admin
2. Créer un nouveau site ou modifier un site existant
3. **Dans la section "Domaines", ajouter:**
   ```
   localhost
   127.0.0.1
   ```
4. Sauvegarder

### 2. Configurer les variables d'environnement

Ajouter dans votre fichier `.env` :

```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

**Note:** Les clés ci-dessus sont des **clés de test** fournies par Google. Elles fonctionnent toujours en localhost mais retournent toujours `success: true` sans vérification réelle.

Pour la production, utilisez vos vraies clés depuis Google reCAPTCHA Admin.

### 3. Redémarrer le serveur

```bash
npm run dev
```

---

## 🧪 CLÉS DE TEST GOOGLE

Google fournit des **clés de test** qui fonctionnent toujours sur localhost :

- **Site Key (test):** `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
- **Secret Key (test):** `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`

**Caractéristiques:**
- ✅ Fonctionnent toujours sur `localhost` et `127.0.0.1`
- ✅ Retournent toujours `success: true` (pas de vraie vérification)
- ✅ Parfaites pour le développement
- ❌ **NE PAS utiliser en production**

---

## 🔍 VÉRIFICATION

### Tester que ça fonctionne

1. **Démarrer le serveur:**
   ```bash
   npm run dev
   ```

2. **Tester la page de connexion:**
   - Aller sur `http://localhost:3000/auth/login`
   - Le widget reCAPTCHA doit apparaître
   - Cocher la case → le token doit être généré
   - Soumettre le formulaire → doit fonctionner

3. **Tester la page d'inscription:**
   - Aller sur `http://localhost:3000/auth/register`
   - Même processus

4. **Tester le formulaire de devis:**
   - Aller sur `http://localhost:3000/[username]/contact`
   - Remplir jusqu'à l'étape 4
   - Le widget reCAPTCHA doit apparaître

---

## 🐛 DÉPANNAGE

### Le widget ne s'affiche pas

**Problème:** Le widget reCAPTCHA ne s'affiche pas

**Solutions:**
1. ✅ Vérifier que `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` est bien dans `.env`
2. ✅ Redémarrer le serveur (`npm run dev`)
3. ✅ Vider le cache du navigateur (Ctrl+Shift+R)
4. ✅ Vérifier la console du navigateur pour les erreurs

### Erreur "CAPTCHA invalide"

**Problème:** Le CAPTCHA est complété mais retourne une erreur

**Solutions:**
1. ✅ Vérifier que `RECAPTCHA_SECRET_KEY` est bien dans `.env`
2. ✅ Vérifier que `localhost` est dans les domaines autorisés sur Google reCAPTCHA Admin
3. ✅ Utiliser les clés de test Google pour le développement
4. ✅ Vérifier les logs serveur pour plus de détails

### Le CAPTCHA fonctionne sans configuration

**Explication:** En développement, si les clés ne sont pas configurées, le code accepte automatiquement la soumission (pour faciliter le développement). C'est normal et attendu.

**Pour activer le vrai CAPTCHA:**
- Configurer les variables d'environnement
- Redémarrer le serveur

---

## 📝 NOTES IMPORTANTES

1. **Clés de Test vs Production:**
   - Utilisez les clés de test pour le développement local
   - Créez de vraies clés pour la production
   - Les clés de test fonctionnent uniquement sur `localhost` et `127.0.0.1`

2. **Domaines Autorisés:**
   - `localhost` → Accepté automatiquement par Google
   - `127.0.0.1` → Accepté automatiquement par Google
   - Votre domaine de production → Doit être explicitement ajouté

3. **Mode Développement:**
   - Si les clés ne sont pas configurées, le CAPTCHA est ignoré en développement
   - Cela permet de développer sans configurer reCAPTCHA
   - En production, le CAPTCHA est obligatoire si configuré

---

## ✅ CHECKLIST

- [ ] Clés reCAPTCHA ajoutées dans `.env`
- [ ] `localhost` ajouté dans les domaines autorisés sur Google reCAPTCHA Admin
- [ ] Serveur redémarré après ajout des variables
- [ ] Widget reCAPTCHA visible sur `/auth/login`
- [ ] Widget reCAPTCHA visible sur `/auth/register`
- [ ] Widget reCAPTCHA visible sur `/[username]/contact`
- [ ] Soumission de formulaire fonctionne avec CAPTCHA complété

---

**✅ Une fois ces étapes complétées, le reCAPTCHA fonctionnera parfaitement en local !**

