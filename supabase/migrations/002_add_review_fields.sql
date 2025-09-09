-- Add missing review fields to user_reviews table
-- Migration: 002_add_review_fields.sql
-- Description: Adds comprehensive review fields as specified in the requirements

-- Add new columns to user_reviews table
DO $$
BEGIN
    -- Add salt level (0-100)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_reviews' AND column_name = 'salt_level') THEN
        ALTER TABLE user_reviews ADD COLUMN salt_level integer CHECK (salt_level >= 0 AND salt_level <= 100);
    END IF;

    -- Add umami level (0-100)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_reviews' AND column_name = 'umami_level') THEN
        ALTER TABLE user_reviews ADD COLUMN umami_level integer CHECK (umami_level >= 0 AND umami_level <= 100);
    END IF;

    -- Add spiciness level (0-100)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_reviews' AND column_name = 'spiciness_level') THEN
        ALTER TABLE user_reviews ADD COLUMN spiciness_level integer CHECK (spiciness_level >= 0 AND spiciness_level <= 100);
    END IF;

    -- Add acidity level (0-100)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_reviews' AND column_name = 'acidity_level') THEN
        ALTER TABLE user_reviews ADD COLUMN acidity_level integer CHECK (acidity_level >= 0 AND acidity_level <= 100);
    END IF;

    -- Add sweetness level (0-100)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_reviews' AND column_name = 'sweetness_level') THEN
        ALTER TABLE user_reviews ADD COLUMN sweetness_level integer CHECK (sweetness_level >= 0 AND sweetness_level <= 100);
    END IF;

    -- Add texture rating (enum)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_reviews' AND column_name = 'texture_rating') THEN
        ALTER TABLE user_reviews ADD COLUMN texture_rating text CHECK (texture_rating IN ('watery', 'light', 'medium', 'full', 'heavy', 'syrupy'));
    END IF;

    -- Add typicity score (0-100)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_reviews' AND column_name = 'typicity_score') THEN
        ALTER TABLE user_reviews ADD COLUMN typicity_score integer CHECK (typicity_score >= 0 AND typicity_score <= 100);
    END IF;

    -- Add complexity score (0-100)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_reviews' AND column_name = 'complexity_score') THEN
        ALTER TABLE user_reviews ADD COLUMN complexity_score integer CHECK (complexity_score >= 0 AND complexity_score <= 100);
    END IF;

    -- Add comprehensive review data JSON field for additional structured data
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_reviews' AND column_name = 'review_data') THEN
        ALTER TABLE user_reviews ADD COLUMN review_data jsonb DEFAULT '{}';
    END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_reviews_salt_level ON user_reviews(salt_level);
CREATE INDEX IF NOT EXISTS idx_user_reviews_sweetness_level ON user_reviews(sweetness_level);
CREATE INDEX IF NOT EXISTS idx_user_reviews_texture_rating ON user_reviews(texture_rating);
CREATE INDEX IF NOT EXISTS idx_user_reviews_typicity_score ON user_reviews(typicity_score);
CREATE INDEX IF NOT EXISTS idx_user_reviews_complexity_score ON user_reviews(complexity_score);

-- Update existing records with default values (optional, for data integrity)
UPDATE user_reviews
SET
    salt_level = 0,
    umami_level = 0,
    spiciness_level = 0,
    acidity_level = 0,
    sweetness_level = 0,
    texture_rating = 'medium',
    typicity_score = 50,
    complexity_score = 50,
    review_data = '{}'
WHERE
    salt_level IS NULL OR
    umami_level IS NULL OR
    spiciness_level IS NULL OR
    acidity_level IS NULL OR
    sweetness_level IS NULL OR
    texture_rating IS NULL OR
    typicity_score IS NULL OR
    complexity_score IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN user_reviews.salt_level IS 'Salt perception level (0-100)';
COMMENT ON COLUMN user_reviews.umami_level IS 'Umami/savory perception level (0-100)';
COMMENT ON COLUMN user_reviews.spiciness_level IS 'Spiciness/heat perception level (0-100)';
COMMENT ON COLUMN user_reviews.acidity_level IS 'Acidity/tartness perception level (0-100)';
COMMENT ON COLUMN user_reviews.sweetness_level IS 'Sweetness perception level (0-100)';
COMMENT ON COLUMN user_reviews.texture_rating IS 'Mouthfeel texture rating';
COMMENT ON COLUMN user_reviews.typicity_score IS 'How typical/representative of style (0-100)';
COMMENT ON COLUMN user_reviews.complexity_score IS 'Complexity and depth of flavors (0-100)';
COMMENT ON COLUMN user_reviews.review_data IS 'Additional structured review data (JSON)';

-- Analyze the table for query optimization
ANALYZE user_reviews;









