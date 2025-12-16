# InnovaPort

Plateforme tout-en-un pour les freelances et agences. Créez des portfolios époustouflants, recevez des demandes de devis qualifiées et gérez votre business.

## 🚀 Fonctionnalités

- **Portfolio Builder** : Créez un site vitrine professionnel en quelques minutes
- **Gestion de Devis** : Recevez et traitez les demandes de devis directement depuis votre dashboard
- **Personnalisation** : Changez les couleurs, polices et layouts pour coller à votre image de marque
- **Templates** : Plusieurs templates modernes et professionnels
- **Authentification** : Système d'authentification sécurisé avec Supabase
- **Analytics** : Suivez les visites de votre portfolio et les interactions
- **Emails** : Notifications automatiques pour les nouveaux devis

## 🛠️ Technologies

- **Next.js 16** : Framework React avec App Router
- **TypeScript** : Typage statique strict
- **Supabase** : Backend, authentification et base de données
- **Tailwind CSS 4** : Styling moderne
- **Resend** : Envoi d'emails transactionnels
- **Framer Motion** : Animations fluides
- **Lucide React** : Icônes modernes

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte Supabase
- Compte Resend (pour les emails)

## 📦 Installation

1. **Clonez le repository**
```bash
git clone <repository-url>
cd InnovaPort
```

2. **Installez les dépendances**
```bash
npm install
```

3. **Configurez les variables d'environnement**
```bash
cp env.example .env
```

Puis éditez le fichier `.env` avec vos clés :

### Variables Supabase (requises)
- `NEXT_PUBLIC_SUPABASE_URL` : URL de votre projet Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : Clé anonyme Supabase
- `SUPABASE_SERVICE_ROLE_KEY` : Clé service role Supabase (pour les opérations admin)

### Variables Resend (requises pour les emails)
- `RESEND_API_KEY` : Clé API Resend

### Variables Application
- `NEXT_PUBLIC_APP_URL` : URL de l'application (http://localhost:3000 en développement)
- `NEXT_PUBLIC_BASE_URL` : URL de base de l'application

4. **Configurez la base de données Supabase**

Exécutez le script SQL dans `supabase/schema.sql` dans votre projet Supabase :
- Connectez-vous à votre projet Supabase
- Allez dans l'éditeur SQL
- Copiez-collez le contenu de `supabase/schema.sql`
- Exécutez le script

Ce script créera :
- Les tables nécessaires (`profiles`, `projects`, `quotes`, `subscriptions`, `analytics`)
- Les politiques RLS (Row Level Security)
- Les triggers et fonctions SQL
- Les index pour optimiser les performances

5. **Lancez le serveur de développement**
```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🏗️ Build de production

```bash
npm run build
npm start
```

## 📝 Scripts disponibles

- `npm run dev` : Lance le serveur de développement
- `npm run build` : Crée un build de production optimisé
- `npm start` : Lance le serveur de production
- `npm run lint` : Lance le linter ESLint

## 📁 Structure du projet

```
app/
├── [username]/          # Portfolios publics dynamiques
│   ├── page.tsx         # Page portfolio principale
│   ├── portfolio-client.tsx  # Composant client pour interactions
│   └── contact/         # Formulaire de devis public
├── api/                 # Routes API
│   ├── analytics/       # Tracking analytics
│   ├── projects/        # Gestion des projets
│   └── quotes/          # Gestion des devis
├── auth/                # Pages d'authentification
│   ├── login/
│   └── register/
├── dashboard/           # Dashboard utilisateur
│   ├── _components/     # Composants partagés (sidebar, header)
│   ├── appearance/      # Personnalisation du portfolio
│   ├── billing/         # Gestion des abonnements
│   ├── projects/        # Gestion des projets
│   └── quotes/          # Gestion des devis
├── preview/             # Prévisualisation des portfolios (demo)
└── page.tsx             # Page d'accueil

utils/
├── contact-constants.ts # Constantes partagées pour formulaires
├── color-utils.ts       # Utilitaires de manipulation de couleurs
├── logger.ts            # Système de logging
├── resend.ts            # Utilitaires d'envoi d'emails
└── supabase/            # Utilitaires Supabase
    ├── client.ts        # Client Supabase (côté client)
    ├── server.ts        # Client Supabase (côté serveur)
    └── middleware.ts    # Middleware Supabase

supabase/
└── schema.sql           # Schéma de base de données complet
```

## 🔐 Configuration Supabase

### Authentification
- Activez l'authentification email/password dans votre projet Supabase
- Configurez les URLs de redirection dans les paramètres d'authentification

### Base de données
- Exécutez le script `supabase/schema.sql` pour créer toutes les tables
- Les politiques RLS sont déjà configurées dans le script
- Vérifiez que les triggers sont bien créés

### Sécurité
- Ne partagez jamais votre `SUPABASE_SERVICE_ROLE_KEY`
- Utilisez toujours la clé anonyme côté client
- Les politiques RLS protègent automatiquement les données

## 🎨 Personnalisation

### Templates disponibles
- **Modern** : Layout dynamique avec glassmorphism (par défaut)
- **Minimal** : Layout épuré, beaucoup d'espaces blancs

### Couleurs
Les utilisateurs peuvent personnaliser :
- Couleur primaire
- Couleur secondaire
- Via l'interface dans `/dashboard/appearance`

## 📊 Analytics

Le système track automatiquement :
- Vues de portfolio (`portfolio_view`)
- Clics sur le bouton "Devis" (`quote_click`)
- Vues de projets (`project_view`)
- Clics sur contact (`contact_click`)

Les données sont stockées dans la table `analytics` et visibles dans le dashboard.

## 📧 Emails

Les emails sont envoyés via Resend :
- Notification au développeur lors d'un nouveau devis
- Confirmation au client après envoi du devis

Configurez votre domaine dans Resend pour un meilleur délivrabilité.

## 🐛 Dépannage

### Erreurs d'authentification
- Vérifiez que les variables d'environnement Supabase sont correctes
- Vérifiez que l'authentification est activée dans Supabase
- Vérifiez les URLs de redirection

### Erreurs de base de données
- Vérifiez que le script `schema.sql` a été exécuté
- Vérifiez que les politiques RLS sont actives
- Vérifiez les permissions de votre utilisateur Supabase

### Erreurs d'emails
- Vérifiez que `RESEND_API_KEY` est correcte
- Vérifiez que votre domaine est vérifié dans Resend
- Consultez les logs Resend pour plus de détails

## 🔒 Sécurité

- ✅ Authentification sécurisée avec Supabase
- ✅ Row Level Security (RLS) activé sur toutes les tables
- ✅ Validation des données côté serveur
- ✅ Protection CSRF intégrée à Next.js
- ✅ Variables d'environnement pour les secrets

## 📄 Licence

Ce projet est privé.

## 🤝 Contribution

Ce projet est actuellement privé. Pour toute question ou suggestion, contactez l'équipe de développement.

## 📚 Documentation supplémentaire

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) : Guide de configuration détaillé
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) : Guide de dépannage
- [AUDIT_REPORT.md](./AUDIT_REPORT.md) : Rapport d'audit du projet
