# Guide du Développeur - InnovaPort

Ce guide est destiné aux développeurs qui travaillent sur le projet InnovaPort.

## 🏗️ Architecture du Projet

### Structure des Dossiers

```
app/
├── [username]/              # Routes dynamiques pour portfolios publics
│   ├── page.tsx            # Page portfolio (Server Component)
│   ├── portfolio-client.tsx # Composant client pour interactions
│   └── contact/            # Formulaire de devis public
├── api/                     # Routes API Next.js
│   ├── analytics/          # Endpoint analytics
│   ├── projects/           # CRUD projets
│   └── quotes/             # Gestion devis
├── auth/                    # Pages d'authentification
├── dashboard/               # Zone authentifiée
│   ├── _components/        # Composants partagés dashboard
│   └── [sections]/         # Pages du dashboard
└── preview/                 # Preview/demo portfolios

utils/
├── contact-constants.ts    # Constantes partagées formulaires
├── color-utils.ts          # Utilitaires couleurs
├── logger.ts               # Système de logging
├── resend.ts               # Emails transactionnels
└── supabase/               # Clients Supabase
```

## 🔑 Concepts Clés

### Server Components vs Client Components

- **Server Components** (par défaut) : Exécutés côté serveur, accès direct à la DB
  - Utilisez pour : Fetching de données, pages statiques, SEO
  - Exemple : `app/[username]/page.tsx`

- **Client Components** (`"use client"`) : Exécutés côté client, interactions
  - Utilisez pour : Formulaires, animations, état local
  - Exemple : `app/[username]/portfolio-client.tsx`

### Authentification

L'authentification utilise Supabase Auth avec middleware Next.js :

```typescript
// Côté serveur
import { createClient } from '@/utils/supabase/server';
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

// Côté client
import { createClient } from '@/utils/supabase/client';
const supabase = createClient();
```

### Base de Données

Toutes les tables ont RLS (Row Level Security) activé. Les utilisateurs ne peuvent accéder qu'à leurs propres données.

### Gestion d'Erreurs

Utilisez le système de logging dans `utils/logger.ts` :

```typescript
import { logError } from '@/utils/logger';

try {
    // code
} catch (error) {
    logError('Description de l\'erreur', error, { context: 'additional info' });
}
```

## 📝 Conventions de Code

### Naming

- **Composants** : PascalCase (`ProjectForm.tsx`)
- **Fichiers** : kebab-case pour routes, PascalCase pour composants
- **Variables** : camelCase
- **Constantes** : UPPER_SNAKE_CASE ou camelCase selon le contexte

### Imports

Ordre recommandé :
1. React/Next.js
2. Bibliothèques tierces
3. Composants locaux
4. Utilitaires
5. Types/interfaces
6. Styles

```typescript
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { ProjectForm } from './project-form';
import { createClient } from '@/utils/supabase/server';
import type { Project } from '@/types';
```

### Types TypeScript

Toujours typer explicitement :
- Props de composants
- Paramètres de fonctions
- Retours de fonctions
- État local (quand nécessaire)

```typescript
interface ProjectFormProps {
    projectId?: string;
    onSuccess?: (project: Project) => void;
}

export function ProjectForm({ projectId, onSuccess }: ProjectFormProps) {
    // ...
}
```

## 🎨 Styling

### Tailwind CSS

- Utilisez les classes utilitaires Tailwind
- Évitez les styles inline sauf pour les valeurs dynamiques
- Utilisez `clsx` pour les classes conditionnelles

```typescript
import clsx from 'clsx';

<button className={clsx(
    "px-4 py-2 rounded",
    isActive ? "bg-primary text-white" : "bg-gray-100 text-gray-900"
)}>
```

### Couleurs

- Utilisez les couleurs du thème : `primary`, `secondary`
- Ou les couleurs Tailwind standards : `blue-600`, `green-500`, etc.
- Évitez les couleurs hardcodées sauf pour les valeurs dynamiques

## 🔒 Sécurité

### Validation

Toujours valider les données côté serveur :

```typescript
// Dans les routes API
if (!title || title.length < 3) {
    return NextResponse.json(
        { error: 'Le titre doit contenir au moins 3 caractères' },
        { status: 400 }
    );
}
```

### RLS (Row Level Security)

Les politiques RLS sont définies dans `supabase/schema.sql`. Ne les modifiez pas sans comprendre l'impact.

### Variables d'Environnement

- Ne jamais commiter les fichiers `.env`
- Utiliser `env.example` comme référence
- Vérifier que toutes les variables sont documentées

## 🧪 Tests

### Structure Recommandée

```
__tests__/
├── components/
├── api/
└── utils/
```

### Bonnes Pratiques

- Tester les cas d'erreur
- Tester les validations
- Tester les interactions utilisateur
- Mock Supabase pour les tests

## 🐛 Debugging

### En Développement

- Les `console.error` sont visibles dans le terminal
- Utilisez les DevTools React
- Vérifiez les logs Supabase dans le dashboard

### En Production

- Les logs doivent aller vers un service externe (Sentry, LogRocket, etc.)
- Ne pas logger d'informations sensibles
- Utiliser le système de logging dans `utils/logger.ts`

## 📦 Dépendances

### Ajouter une Dépendance

```bash
npm install package-name
```

### Mettre à Jour

```bash
npm update
```

### Vérifier les Vulnérabilités

```bash
npm audit
```

## 🚀 Déploiement

### Build de Production

```bash
npm run build
```

Vérifiez qu'il n'y a pas d'erreurs de build.

### Variables d'Environnement

Assurez-vous que toutes les variables sont configurées dans votre plateforme de déploiement (Vercel, Netlify, etc.).

### Base de Données

- Exécutez `supabase/schema.sql` sur votre base de production
- Vérifiez que les migrations sont à jour
- Testez les politiques RLS

## 📚 Ressources

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## ❓ Questions Fréquentes

### Comment ajouter une nouvelle route API ?

1. Créez un fichier dans `app/api/[route-name]/route.ts`
2. Exportez les fonctions HTTP (`GET`, `POST`, etc.)
3. Utilisez `createClient` de `@/utils/supabase/server` pour l'auth
4. Validez les données d'entrée
5. Gérez les erreurs proprement

### Comment ajouter une nouvelle page au dashboard ?

1. Créez un dossier dans `app/dashboard/[page-name]/`
2. Créez un `page.tsx` dans ce dossier
3. Ajoutez un lien dans `app/dashboard/_components/sidebar.tsx`
4. Utilisez `createClient` pour récupérer l'utilisateur

### Comment personnaliser un template de portfolio ?

Les templates sont dans `app/[username]/portfolio-client.tsx`. Ajoutez une nouvelle condition pour votre template :

```typescript
if (template === 'mon-template') {
    return (
        // Votre JSX
    );
}
```

Puis mettez à jour la liste des templates dans `app/dashboard/appearance/page.tsx`.

## 🤝 Contribution

1. Créez une branche pour votre fonctionnalité
2. Suivez les conventions de code
3. Testez vos changements
4. Créez une pull request avec une description claire

