# Configuration Supabase Storage - Bucket "avatars"

## 📋 Guide de création du bucket

Pour que l'upload de photos de profil fonctionne, vous devez créer un bucket dans Supabase Storage.

### Méthode 1 : Via l'interface Supabase (Recommandé)

1. **Connectez-vous à votre projet Supabase**
   - Allez sur [https://supabase.com](https://supabase.com)
   - Sélectionnez votre projet

2. **Accédez à Storage**
   - Dans le menu de gauche, cliquez sur **"Storage"**
   - Cliquez sur **"New bucket"**

3. **Créez le bucket "avatars"**
   - **Nom du bucket** : `avatars`
   - **Public bucket** : ✅ **Cochez cette option** (nécessaire pour que les images soient accessibles publiquement)
   - **File size limit** : 5 MB (ou laissez par défaut)
   - **Allowed MIME types** : `image/png,image/jpeg,image/jpg,image/webp` (optionnel, pour restreindre les types de fichiers)
   - Cliquez sur **"Create bucket"**

4. **Configurez les politiques de sécurité (RLS)**
   - Cliquez sur le bucket `avatars` que vous venez de créer
   - Allez dans l'onglet **"Policies"**
   - Cliquez sur **"New Policy"**
   
   **Politique 1 : Upload autorisé pour les utilisateurs authentifiés**
   - **Policy name** : `Users can upload their own avatars`
   - **Allowed operation** : INSERT
   - **Policy definition** :
   ```sql
   (bucket_id = 'avatars'::text) AND (auth.uid()::text = (storage.foldername(name))[1])
   ```
   
   **Politique 2 : Lecture publique**
   - **Policy name** : `Public can view avatars`
   - **Allowed operation** : SELECT
   - **Policy definition** :
   ```sql
   bucket_id = 'avatars'::text
   ```
   
   **Politique 3 : Mise à jour par le propriétaire**
   - **Policy name** : `Users can update their own avatars`
   - **Allowed operation** : UPDATE
   - **Policy definition** :
   ```sql
   (bucket_id = 'avatars'::text) AND (auth.uid()::text = (storage.foldername(name))[1])
   ```
   
   **Politique 4 : Suppression par le propriétaire**
   - **Policy name** : `Users can delete their own avatars`
   - **Allowed operation** : DELETE
   - **Policy definition** :
   ```sql
   (bucket_id = 'avatars'::text) AND (auth.uid()::text = (storage.foldername(name))[1])
   ```

### Méthode 2 : Via SQL (Alternative)

Si vous préférez utiliser SQL, exécutez ce script dans l'éditeur SQL de Supabase :

```sql
-- Créer le bucket "avatars"
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    5242880, -- 5 MB en bytes
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
);

-- Politique : Upload autorisé pour les utilisateurs authentifiés
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique : Lecture publique
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Politique : Mise à jour par le propriétaire
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique : Suppression par le propriétaire
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
);
```

## ✅ Vérification

Après avoir créé le bucket :

1. Vérifiez que le bucket apparaît dans la liste des buckets
2. Testez l'upload d'une photo dans l'interface des paramètres
3. Vérifiez que l'image est accessible publiquement

## 🔒 Structure des fichiers

Les fichiers seront stockés avec cette structure :
```
avatars/
  └── {user_id}/
      └── {timestamp}.{extension}
```

Exemple : `avatars/123e4567-e89b-12d3-a456-426614174000/1704067200000.jpg`

## ⚠️ Notes importantes

- Le bucket doit être **public** pour que les images soient accessibles dans les portfolios
- Les utilisateurs ne peuvent uploader que dans leur propre dossier (`{user_id}/`)
- La taille maximale par défaut est de 5 MB
- Les types de fichiers autorisés sont : PNG, JPEG, JPG, WebP

