-- ============================================
-- MIGRATION: Ajout de la table auto_response_templates
-- ============================================
-- Date: 2024
-- Description: Ajoute la table pour gérer les templates de réponses automatiques
-- ============================================

-- Table pour stocker les templates de réponses automatiques
CREATE TABLE IF NOT EXISTS auto_response_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    conditions JSONB DEFAULT '{}'::jsonb,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_auto_response_templates_user_id ON auto_response_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_auto_response_templates_enabled ON auto_response_templates(user_id, enabled) WHERE enabled = TRUE;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_auto_response_templates_updated_at ON auto_response_templates;
CREATE TRIGGER update_auto_response_templates_updated_at
    BEFORE UPDATE ON auto_response_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE auto_response_templates ENABLE ROW LEVEL SECURITY;

-- Policies: Users peuvent gérer leurs propres templates
DROP POLICY IF EXISTS "Users can view own auto response templates" ON auto_response_templates;
CREATE POLICY "Users can view own auto response templates"
    ON auto_response_templates FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own auto response templates" ON auto_response_templates;
CREATE POLICY "Users can insert own auto response templates"
    ON auto_response_templates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own auto response templates" ON auto_response_templates;
CREATE POLICY "Users can update own auto response templates"
    ON auto_response_templates FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own auto response templates" ON auto_response_templates;
CREATE POLICY "Users can delete own auto response templates"
    ON auto_response_templates FOR DELETE
    USING (auth.uid() = user_id);

-- Commentaires
COMMENT ON TABLE auto_response_templates IS 'Templates de réponses automatiques personnalisées pour les prospects';
COMMENT ON COLUMN auto_response_templates.conditions IS 'Conditions JSON pour déclencher ce template (project_type, budget_range, etc.)';

