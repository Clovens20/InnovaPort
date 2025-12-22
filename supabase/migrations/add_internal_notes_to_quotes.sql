-- Migration: Ajouter la colonne internal_notes à la table quotes
-- Date: 2024
-- Description: Ajoute la colonne internal_notes pour stocker les notes internes et les données de devis créés
-- IMPORTANT: Cette migration doit être exécutée dans Supabase SQL Editor

-- Ajouter la colonne internal_notes si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'quotes' 
        AND column_name = 'internal_notes'
    ) THEN
        ALTER TABLE quotes 
        ADD COLUMN internal_notes TEXT;
        
        RAISE NOTICE 'Colonne internal_notes ajoutée à la table quotes';
    ELSE
        RAISE NOTICE 'La colonne internal_notes existe déjà dans la table quotes';
    END IF;
END $$;

-- Vérifier que les autres colonnes nécessaires existent aussi
DO $$
BEGIN
    -- Vérifier last_reminder_sent_at
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'quotes' 
        AND column_name = 'last_reminder_sent_at'
    ) THEN
        ALTER TABLE quotes 
        ADD COLUMN last_reminder_sent_at TIMESTAMPTZ;
        
        RAISE NOTICE 'Colonne last_reminder_sent_at ajoutée à la table quotes';
    END IF;

    -- Vérifier reminders_count
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'quotes' 
        AND column_name = 'reminders_count'
    ) THEN
        ALTER TABLE quotes 
        ADD COLUMN reminders_count INTEGER DEFAULT 0;
        
        RAISE NOTICE 'Colonne reminders_count ajoutée à la table quotes';
    END IF;
END $$;

