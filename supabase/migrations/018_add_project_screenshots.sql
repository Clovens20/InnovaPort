-- Migration: Ajout du support pour plusieurs captures d'écran par projet
-- Date: 2025-01-XX

-- Ajouter la colonne screenshots_url comme tableau JSONB pour stocker plusieurs URLs d'images
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS screenshots_url JSONB DEFAULT '[]'::jsonb;

-- Commentaire pour documentation
COMMENT ON COLUMN projects.screenshots_url IS 'Tableau JSON contenant les URLs de toutes les captures d''écran du projet';

-- Index GIN pour améliorer les performances des requêtes sur le tableau JSONB
CREATE INDEX IF NOT EXISTS idx_projects_screenshots_url ON projects USING GIN (screenshots_url);

