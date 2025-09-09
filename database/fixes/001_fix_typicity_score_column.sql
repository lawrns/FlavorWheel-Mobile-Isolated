-- FlavorWheel México - Database Fix Script
-- Fix: Correct typicicty_score column name typo to typicity_score
-- Date: 2025-01-08
-- Description: Fixes column name typo in user_reviews table and updates related constraints/indexes

-- ============================================================================
-- 1. BACKUP CURRENT STATE (for safety)
-- ============================================================================

-- Create a backup table with current data
CREATE TABLE IF NOT EXISTS user_reviews_backup_20250108 AS 
SELECT * FROM user_reviews;

-- Log the fix operation
DO $$
BEGIN
    RAISE NOTICE 'Starting typicity_score column fix at %', now();
    RAISE NOTICE 'Backup table created: user_reviews_backup_20250108';
END $$;

-- ============================================================================
-- 2. CHECK CURRENT COLUMN STATE
-- ============================================================================

-- Check if the typo column exists
DO $$
DECLARE
    typo_column_exists boolean;
    correct_column_exists boolean;
BEGIN
    -- Check for typo column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_reviews' AND column_name = 'typicicty_score'
    ) INTO typo_column_exists;
    
    -- Check for correct column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_reviews' AND column_name = 'typicity_score'
    ) INTO correct_column_exists;
    
    RAISE NOTICE 'Typo column (typicicty_score) exists: %', typo_column_exists;
    RAISE NOTICE 'Correct column (typicity_score) exists: %', correct_column_exists;
    
    -- Store state for later steps
    IF typo_column_exists THEN
        CREATE TEMP TABLE IF NOT EXISTS fix_state (step text, status text);
        INSERT INTO fix_state VALUES ('typo_column_found', 'true');
    END IF;
END $$;

-- ============================================================================
-- 3. FIX COLUMN NAME AND CONSTRAINTS
-- ============================================================================

-- Fix the column name if typo exists
DO $$
BEGIN
    -- Only proceed if typo column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_reviews' AND column_name = 'typicicty_score') THEN
        
        -- Drop the incorrect constraint first
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'user_reviews_typicicty_score_check') THEN
            ALTER TABLE user_reviews DROP CONSTRAINT user_reviews_typicicty_score_check;
            RAISE NOTICE 'Dropped incorrect constraint: user_reviews_typicicty_score_check';
        END IF;
        
        -- Rename the column
        ALTER TABLE user_reviews RENAME COLUMN typicicty_score TO typicity_score;
        RAISE NOTICE 'Renamed column: typicicty_score → typicity_score';
        
        -- Add the correct constraint
        ALTER TABLE user_reviews ADD CONSTRAINT user_reviews_typicity_score_check 
            CHECK (typicity_score >= 0 AND typicity_score <= 100);
        RAISE NOTICE 'Added correct constraint: user_reviews_typicity_score_check';
        
    ELSE
        RAISE NOTICE 'Typo column not found, checking if correct column exists...';
        
        -- If correct column doesn't exist, create it
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_reviews' AND column_name = 'typicity_score') THEN
            ALTER TABLE user_reviews ADD COLUMN typicity_score integer CHECK (typicity_score >= 0 AND typicity_score <= 100);
            RAISE NOTICE 'Created missing typicity_score column';
        END IF;
    END IF;
END $$;

-- ============================================================================
-- 4. FIX INDEXES
-- ============================================================================

-- Drop incorrect index if it exists
DROP INDEX IF EXISTS idx_user_reviews_typicicty_score;

-- Create correct index
CREATE INDEX IF NOT EXISTS idx_user_reviews_typicity_score ON user_reviews(typicity_score);

-- Log index fix
DO $$
BEGIN
    RAISE NOTICE 'Fixed index: idx_user_reviews_typicicty_score → idx_user_reviews_typicity_score';
END $$;

-- ============================================================================
-- 5. UPDATE COLUMN COMMENTS
-- ============================================================================

-- Add proper comment to the column
COMMENT ON COLUMN user_reviews.typicity_score IS 'How typical/representative of style (0-100)';

-- ============================================================================
-- 6. VERIFY THE FIX
-- ============================================================================

-- Verify the column structure
DO $$
DECLARE
    column_info record;
    constraint_info record;
    index_info record;
BEGIN
    RAISE NOTICE '=== VERIFICATION RESULTS ===';
    
    -- Check column exists with correct name
    SELECT column_name, data_type, is_nullable, column_default
    INTO column_info
    FROM information_schema.columns 
    WHERE table_name = 'user_reviews' AND column_name = 'typicity_score';
    
    IF FOUND THEN
        RAISE NOTICE 'Column typicity_score: type=%, nullable=%, default=%', 
            column_info.data_type, column_info.is_nullable, column_info.column_default;
    ELSE
        RAISE WARNING 'Column typicity_score not found!';
    END IF;
    
    -- Check constraint exists
    SELECT constraint_name, check_clause
    INTO constraint_info
    FROM information_schema.check_constraints 
    WHERE constraint_name = 'user_reviews_typicity_score_check';
    
    IF FOUND THEN
        RAISE NOTICE 'Constraint: % with clause: %', constraint_info.constraint_name, constraint_info.check_clause;
    ELSE
        RAISE WARNING 'Constraint user_reviews_typicity_score_check not found!';
    END IF;
    
    -- Check index exists
    SELECT indexname
    INTO index_info
    FROM pg_indexes 
    WHERE tablename = 'user_reviews' AND indexname = 'idx_user_reviews_typicity_score';
    
    IF FOUND THEN
        RAISE NOTICE 'Index: % exists', index_info.indexname;
    ELSE
        RAISE WARNING 'Index idx_user_reviews_typicity_score not found!';
    END IF;
END $$;

-- ============================================================================
-- 7. ANALYZE TABLE FOR PERFORMANCE
-- ============================================================================

-- Update table statistics
ANALYZE user_reviews;

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '=== FIX COMPLETED SUCCESSFULLY ===';
    RAISE NOTICE 'Typicity score column fix completed at %', now();
    RAISE NOTICE 'Backup table available: user_reviews_backup_20250108';
    RAISE NOTICE 'Run SELECT * FROM user_reviews_backup_20250108; to view backup if needed';
END $$;
