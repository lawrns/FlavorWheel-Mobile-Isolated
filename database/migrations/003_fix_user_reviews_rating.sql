-- Fix user_reviews table schema issues
-- Migration: 003_fix_user_reviews_rating.sql
-- Description: Adds missing rating column to user_reviews table if it doesn't exist

-- Ensure user_reviews table exists with proper structure
CREATE TABLE IF NOT EXISTS user_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    tasting_id uuid REFERENCES tastings(id) ON DELETE CASCADE,
    item_id uuid REFERENCES tasting_items(id) ON DELETE CASCADE,
    rating integer CHECK (rating >= 1 AND rating <= 10),
    title text NOT NULL,
    content text NOT NULL,
    helpful_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Add rating column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_reviews' AND column_name = 'rating') THEN
        ALTER TABLE user_reviews ADD COLUMN rating integer CHECK (rating >= 1 AND rating <= 10);
        RAISE NOTICE 'Added rating column to user_reviews table';
    ELSE
        RAISE NOTICE 'Rating column already exists in user_reviews table';
    END IF;
END $$;

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Ensure all required columns exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_reviews' AND column_name = 'user_id') THEN
        ALTER TABLE user_reviews ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_reviews' AND column_name = 'tasting_id') THEN
        ALTER TABLE user_reviews ADD COLUMN tasting_id uuid REFERENCES tastings(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_reviews' AND column_name = 'item_id') THEN
        ALTER TABLE user_reviews ADD COLUMN item_id uuid REFERENCES tasting_items(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_reviews' AND column_name = 'title') THEN
        ALTER TABLE user_reviews ADD COLUMN title text NOT NULL DEFAULT 'Tasting Review';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_reviews' AND column_name = 'content') THEN
        ALTER TABLE user_reviews ADD COLUMN content text NOT NULL DEFAULT 'Review content';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_reviews' AND column_name = 'helpful_count') THEN
        ALTER TABLE user_reviews ADD COLUMN helpful_count integer DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_reviews' AND column_name = 'created_at') THEN
        ALTER TABLE user_reviews ADD COLUMN created_at timestamp with time zone DEFAULT timezone('utc'::text, now());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_reviews' AND column_name = 'updated_at') THEN
        ALTER TABLE user_reviews ADD COLUMN updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view reviews on their tastings" ON user_reviews;
CREATE POLICY "Users can view reviews on their tastings" ON user_reviews
    FOR SELECT USING (
        tasting_id IN (SELECT id FROM tastings WHERE created_by = auth.uid())
        OR user_id = auth.uid()
    );

DROP POLICY IF EXISTS "Users can create reviews" ON user_reviews;
CREATE POLICY "Users can create reviews" ON user_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reviews" ON user_reviews;
CREATE POLICY "Users can update their own reviews" ON user_reviews
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reviews" ON user_reviews;
CREATE POLICY "Users can delete their own reviews" ON user_reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_reviews_user_id ON user_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_tasting_id ON user_reviews(tasting_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_created_at ON user_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_reviews_rating ON user_reviews(rating DESC);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_reviews_updated_at_trigger ON user_reviews;
CREATE TRIGGER update_user_reviews_updated_at_trigger
    BEFORE UPDATE ON user_reviews
    FOR EACH ROW EXECUTE FUNCTION update_user_reviews_updated_at();

-- =============================================================================
-- Fix tastings table (add missing is_public column)
-- =============================================================================

-- Add missing is_public column to tastings table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tastings' AND column_name = 'is_public') THEN
        ALTER TABLE tastings ADD COLUMN is_public BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_public column to tastings table';
    ELSE
        RAISE NOTICE 'is_public column already exists in tastings table';
    END IF;
END $$;

-- Add indexes for public tastings queries
CREATE INDEX IF NOT EXISTS idx_tastings_is_public ON tastings(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_tastings_public_created ON tastings(is_public, created_at DESC) WHERE is_public = true;

-- Analyze the tables for query optimization
ANALYZE user_reviews;
ANALYZE tastings;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Database schema fixes completed successfully!';
    RAISE NOTICE 'Fixed: user_reviews.rating, title, content, created_at columns';
    RAISE NOTICE 'Fixed: tastings.is_public column';
    RAISE NOTICE 'Migration timestamp: %', now();
END $$;
