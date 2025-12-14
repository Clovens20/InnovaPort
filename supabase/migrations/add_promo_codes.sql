-- ============================================
-- TABLE: promo_codes
-- Stocke les codes promotionnels pour les abonnements
-- ============================================
CREATE TABLE IF NOT EXISTS promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMPTZ NOT NULL,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    applicable_plans TEXT[] DEFAULT NULL, -- NULL = tous les plans, sinon ['pro', 'premium']
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active) WHERE is_active = TRUE;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_promo_codes_updated_at ON promo_codes;
CREATE TRIGGER update_promo_codes_updated_at BEFORE UPDATE ON promo_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies (les codes promo sont accessibles en lecture publique, mais la création/modification nécessite le rôle admin)
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde peut lire les codes promo actifs
CREATE POLICY "Public can view active promo codes"
    ON promo_codes FOR SELECT
    USING (is_active = TRUE AND valid_from <= NOW() AND valid_until >= NOW());

