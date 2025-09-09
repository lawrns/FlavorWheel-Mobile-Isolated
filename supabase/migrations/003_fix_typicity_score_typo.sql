-- Fix typicity_score column name typo
-- Migration: 003_fix_typicity_score_typo.sql
-- Description: Fixes the typicicty_score column name typo to typicity_score

-- Check if the typo column exists and fix it
DO $$
BEGIN
    -- Only proceed if typo column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_reviews' AND column_name = 'typicicty_score') THEN
        
        -- Drop the incorrect constraint first
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'user_reviews_typicicty_score_check') THEN
            ALTER TABLE user_reviews DROP CONSTRAINT user_reviews_typicicty_score_check;
        END IF;
        
        -- Rename the column
        ALTER TABLE user_reviews RENAME COLUMN typicicty_score TO typicity_score;
        
        -- Add the correct constraint
        ALTER TABLE user_reviews ADD CONSTRAINT user_reviews_typicity_score_check 
            CHECK (typicity_score >= 0 AND typicity_score <= 100);
        
        -- Drop incorrect index if it exists
        DROP INDEX IF EXISTS idx_user_reviews_typicicty_score;
        
        -- Create correct index
        CREATE INDEX IF NOT EXISTS idx_user_reviews_typicity_score ON user_reviews(typicity_score);
        
        -- Update column comment
        COMMENT ON COLUMN user_reviews.typicity_score IS 'How typical/representative of style (0-100)';
        
        RAISE NOTICE 'Fixed typicity_score column name typo';
        
    ELSE
        -- If correct column doesn't exist, create it
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_reviews' AND column_name = 'typicity_score') THEN
            ALTER TABLE user_reviews ADD COLUMN typicity_score integer CHECK (typicity_score >= 0 AND typicity_score <= 100);
            CREATE INDEX IF NOT EXISTS idx_user_reviews_typicity_score ON user_reviews(typicity_score);
            COMMENT ON COLUMN user_reviews.typicity_score IS 'How typical/representative of style (0-100)';
            RAISE NOTICE 'Created missing typicity_score column';
        ELSE
            RAISE NOTICE 'typicity_score column already exists correctly';
        END IF;
    END IF;
END $$;

-- Analyze table for performance
ANALYZE user_reviews;
