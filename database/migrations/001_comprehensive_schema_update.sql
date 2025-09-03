-- FlavorWheel México - Comprehensive Database Schema Update
-- Migration: 001_comprehensive_schema_update.sql
-- Description: Implements complete database schema with new tables, columns, indexes, policies, functions, and triggers

-- ============================================================================
-- 1. CREATE NEW TABLES
-- ============================================================================

-- User Reviews Table
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

-- Competitions Table
CREATE TABLE IF NOT EXISTS competitions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    type text CHECK (type IN ('professional', 'casual', 'educational')),
    status text CHECK (status IN ('upcoming', 'active', 'completed')) DEFAULT 'upcoming',
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    max_participants integer,
    current_participants integer DEFAULT 0,
    organizer_id uuid REFERENCES auth.users(id),
    location text,
    prize text,
    rules text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Competition Participants Table
CREATE TABLE IF NOT EXISTS competition_participants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id uuid REFERENCES competitions(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    status text CHECK (status IN ('joined', 'completed', 'disqualified')) DEFAULT 'joined',
    score decimal(5,2),
    ranking integer,
    joined_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Friendships Table
CREATE TABLE IF NOT EXISTS friendships (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    addressee_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    status text CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Activities Table
CREATE TABLE IF NOT EXISTS activities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type text CHECK (activity_type IN ('tasting_completed', 'review_created', 'competition_joined', 'achievement_earned')),
    title text NOT NULL,
    description text,
    metadata jsonb DEFAULT '{}',
    is_public boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Activity Likes Table
CREATE TABLE IF NOT EXISTS activity_likes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id uuid REFERENCES activities(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Activity Comments Table
CREATE TABLE IF NOT EXISTS activity_comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id uuid REFERENCES activities(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_type text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    icon text,
    rarity text CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')) DEFAULT 'common',
    points integer DEFAULT 0,
    unlocked_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    metadata jsonb DEFAULT '{}'
);

-- User Streaks Table
CREATE TABLE IF NOT EXISTS user_streaks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak integer DEFAULT 0,
    longest_streak integer DEFAULT 0,
    last_activity_date date,
    streak_type text CHECK (streak_type IN ('daily_tasting', 'weekly_review', 'monthly_completion')) DEFAULT 'daily_tasting',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Daily Challenges Table
CREATE TABLE IF NOT EXISTS daily_challenges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text NOT NULL,
    challenge_type text CHECK (challenge_type IN ('tasting', 'review', 'social', 'learning')),
    difficulty text CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'easy',
    points integer DEFAULT 10,
    requirements jsonb DEFAULT '{}',
    is_active boolean DEFAULT true,
    date date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- User Challenge Progress Table
CREATE TABLE IF NOT EXISTS user_challenge_progress (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_id uuid REFERENCES daily_challenges(id) ON DELETE CASCADE,
    progress integer DEFAULT 0,
    completed boolean DEFAULT false,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Producers Table
CREATE TABLE IF NOT EXISTS producers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nom_number text UNIQUE,
    name text NOT NULL,
    type text[] DEFAULT '{}',
    region text,
    municipality text,
    state text,
    certifications text[] DEFAULT '{}',
    facility_info jsonb DEFAULT '{}',
    brands text[] DEFAULT '{}',
    agave_varieties text[] DEFAULT '{}',
    sustainability_data jsonb DEFAULT '{}',
    contact_info jsonb DEFAULT '{}',
    ownership_type text,
    founded_year integer,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 2. MODIFY EXISTING TABLES - ADD NEW COLUMNS
-- ============================================================================

-- Add columns to profiles table
DO $$ 
BEGIN
    -- Add new columns to profiles if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
        ALTER TABLE profiles ADD COLUMN bio text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'location') THEN
        ALTER TABLE profiles ADD COLUMN location text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'website') THEN
        ALTER TABLE profiles ADD COLUMN website text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'experience_level') THEN
        ALTER TABLE profiles ADD COLUMN experience_level text CHECK (experience_level IN ('beginner', 'intermediate', 'professional')) DEFAULT 'beginner';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'beverage_preferences') THEN
        ALTER TABLE profiles ADD COLUMN beverage_preferences text[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'language') THEN
        ALTER TABLE profiles ADD COLUMN language text DEFAULT 'es';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_login') THEN
        ALTER TABLE profiles ADD COLUMN last_login timestamp with time zone;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'account_status') THEN
        ALTER TABLE profiles ADD COLUMN account_status text CHECK (account_status IN ('active', 'suspended', 'banned')) DEFAULT 'active';
    END IF;
END $$;

-- Add columns to tastings table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tastings' AND column_name = 'max_participants') THEN
        ALTER TABLE tastings ADD COLUMN max_participants integer;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tastings' AND column_name = 'current_participants') THEN
        ALTER TABLE tastings ADD COLUMN current_participants integer DEFAULT 1;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tastings' AND column_name = 'is_public') THEN
        ALTER TABLE tastings ADD COLUMN is_public boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tastings' AND column_name = 'location') THEN
        ALTER TABLE tastings ADD COLUMN location text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tastings' AND column_name = 'meeting_link') THEN
        ALTER TABLE tastings ADD COLUMN meeting_link text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tastings' AND column_name = 'tasting_data') THEN
        ALTER TABLE tastings ADD COLUMN tasting_data jsonb DEFAULT '{}';
    END IF;
END $$;

-- Add columns to tasting_items table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasting_items' AND column_name = 'photo_url') THEN
        ALTER TABLE tasting_items ADD COLUMN photo_url text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasting_items' AND column_name = 'nom_number') THEN
        ALTER TABLE tasting_items ADD COLUMN nom_number text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasting_items' AND column_name = 'producer_id') THEN
        ALTER TABLE tasting_items ADD COLUMN producer_id uuid REFERENCES producers(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasting_items' AND column_name = 'agave_variety') THEN
        ALTER TABLE tasting_items ADD COLUMN agave_variety text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasting_items' AND column_name = 'production_method') THEN
        ALTER TABLE tasting_items ADD COLUMN production_method text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasting_items' AND column_name = 'alcohol_content') THEN
        ALTER TABLE tasting_items ADD COLUMN alcohol_content decimal(4,1);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasting_items' AND column_name = 'certifications') THEN
        ALTER TABLE tasting_items ADD COLUMN certifications text[] DEFAULT '{}';
    END IF;
END $$;

-- Add columns to mexican_beverages table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mexican_beverages' AND column_name = 'nom_number') THEN
        ALTER TABLE mexican_beverages ADD COLUMN nom_number text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mexican_beverages' AND column_name = 'producer_id') THEN
        ALTER TABLE mexican_beverages ADD COLUMN producer_id uuid REFERENCES producers(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mexican_beverages' AND column_name = 'agave_variety') THEN
        ALTER TABLE mexican_beverages ADD COLUMN agave_variety text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mexican_beverages' AND column_name = 'production_method') THEN
        ALTER TABLE mexican_beverages ADD COLUMN production_method text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mexican_beverages' AND column_name = 'alcohol_content') THEN
        ALTER TABLE mexican_beverages ADD COLUMN alcohol_content decimal(4,1);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mexican_beverages' AND column_name = 'tasting_notes') THEN
        ALTER TABLE mexican_beverages ADD COLUMN tasting_notes jsonb DEFAULT '{}';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mexican_beverages' AND column_name = 'certifications') THEN
        ALTER TABLE mexican_beverages ADD COLUMN certifications text[] DEFAULT '{}';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mexican_beverages' AND column_name = 'stock_quantity') THEN
        ALTER TABLE mexican_beverages ADD COLUMN stock_quantity integer DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mexican_beverages' AND column_name = 'price_range') THEN
        ALTER TABLE mexican_beverages ADD COLUMN price_range text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mexican_beverages' AND column_name = 'availability') THEN
        ALTER TABLE mexican_beverages ADD COLUMN availability text CHECK (availability IN ('available', 'limited', 'out_of_stock')) DEFAULT 'available';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mexican_beverages' AND column_name = 'sustainability_score') THEN
        ALTER TABLE mexican_beverages ADD COLUMN sustainability_score integer CHECK (sustainability_score >= 0 AND sustainability_score <= 100);
    END IF;
END $$;

-- ============================================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- User Reviews Indexes
CREATE INDEX IF NOT EXISTS idx_user_reviews_user_id ON user_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_tasting_id ON user_reviews(tasting_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_created_at ON user_reviews(created_at DESC);

-- Competitions Indexes
CREATE INDEX IF NOT EXISTS idx_competitions_status ON competitions(status);
CREATE INDEX IF NOT EXISTS idx_competitions_start_date ON competitions(start_date);
CREATE INDEX IF NOT EXISTS idx_competitions_organizer_id ON competitions(organizer_id);

-- Competition Participants Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_competition_participants_unique ON competition_participants(competition_id, user_id);
CREATE INDEX IF NOT EXISTS idx_competition_participants_user_id ON competition_participants(user_id);

-- Friendships Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_friendships_unique ON friendships(LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id));
CREATE INDEX IF NOT EXISTS idx_friendships_requester_id ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee_id ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

-- Activities Indexes
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_activity_type ON activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_public ON activities(is_public) WHERE is_public = true;

-- Activity Likes Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_activity_likes_unique ON activity_likes(activity_id, user_id);
CREATE INDEX IF NOT EXISTS idx_activity_likes_activity_id ON activity_likes(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_likes_user_id ON activity_likes(user_id);

-- Activity Comments Indexes
CREATE INDEX IF NOT EXISTS idx_activity_comments_activity_id ON activity_comments(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_comments_user_id ON activity_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_comments_created_at ON activity_comments(created_at DESC);

-- Achievements Indexes
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_achievement_type ON achievements(achievement_type);
CREATE UNIQUE INDEX IF NOT EXISTS idx_achievements_unique ON achievements(user_id, achievement_type);

-- User Streaks Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_streaks_unique ON user_streaks(user_id, streak_type);
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);

-- Daily Challenges Indexes
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(date);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_active ON daily_challenges(is_active);
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_challenges_unique ON daily_challenges(date, challenge_type);

-- User Challenge Progress Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_challenge_progress_unique ON user_challenge_progress(user_id, challenge_id);
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_user_id ON user_challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_completed ON user_challenge_progress(completed);

-- Producers Indexes
CREATE INDEX IF NOT EXISTS idx_producers_region ON producers(region);
CREATE INDEX IF NOT EXISTS idx_producers_type ON producers USING GIN(type);
CREATE UNIQUE INDEX IF NOT EXISTS idx_producers_nom_number ON producers(nom_number);

-- Tastings Indexes (additional)
CREATE INDEX IF NOT EXISTS idx_tastings_is_public ON tastings(is_public);
CREATE INDEX IF NOT EXISTS idx_tastings_created_by ON tastings(created_by);

-- Critical Performance Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tastings_created_by_date ON tastings(created_by, date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_reviews_tasting_rating ON user_reviews(tasting_id, rating DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_user_created ON activities(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flavor_wheels_user_tasting ON flavor_wheels(user_id, tasting_id);

-- Composite Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tastings_status_participants ON tastings(status, current_participants) WHERE status = 'active';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_public_recent ON activities(is_public, created_at DESC) WHERE is_public = true;

-- ============================================================================
-- 4. CREATE DATABASE FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to calculate and update user streaks
CREATE OR REPLACE FUNCTION calculate_user_streak(p_user_id uuid, p_streak_type text)
RETURNS void AS $$
BEGIN
    UPDATE user_streaks
    SET current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_activity_date = CURRENT_DATE,
        updated_at = now()
    WHERE user_id = p_user_id AND streak_type = p_streak_type;

    IF NOT FOUND THEN
        INSERT INTO user_streaks (user_id, streak_type, current_streak, longest_streak, last_activity_date)
        VALUES (p_user_id, p_streak_type, 1, 1, CURRENT_DATE);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to award achievements to users
CREATE OR REPLACE FUNCTION award_achievement(
    p_user_id uuid,
    p_achievement_type text,
    p_title text,
    p_description text,
    p_points integer DEFAULT 0
)
RETURNS void AS $$
BEGIN
    INSERT INTO achievements (user_id, achievement_type, title, description, points)
    VALUES (p_user_id, p_achievement_type, p_title, p_description, p_points)
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Function to update beverage stock
CREATE OR REPLACE FUNCTION update_beverage_stock(
    p_beverage_id uuid,
    p_quantity_change integer
)
RETURNS void AS $$
BEGIN
    UPDATE mexican_beverages
    SET stock_quantity = GREATEST(0, stock_quantity + p_quantity_change),
        updated_at = now()
    WHERE id = p_beverage_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update template rating
CREATE OR REPLACE FUNCTION update_template_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- This would update average ratings for templates
    -- Implementation depends on template rating structure
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update tasting participants count
CREATE OR REPLACE FUNCTION update_tasting_participants_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tastings
        SET current_participants = current_participants + 1
        WHERE id = NEW.tasting_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tastings
        SET current_participants = current_participants - 1
        WHERE id = OLD.tasting_id;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. CREATE TRIGGERS
-- ============================================================================

-- Auto-update updated_at triggers
CREATE TRIGGER IF NOT EXISTS update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_tastings_updated_at
    BEFORE UPDATE ON tastings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_user_reviews_updated_at
    BEFORE UPDATE ON user_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_competitions_updated_at
    BEFORE UPDATE ON competitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_friendships_updated_at
    BEFORE UPDATE ON friendships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_activity_comments_updated_at
    BEFORE UPDATE ON activity_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_user_streaks_updated_at
    BEFORE UPDATE ON user_streaks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_user_challenge_progress_updated_at
    BEFORE UPDATE ON user_challenge_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_producers_updated_at
    BEFORE UPDATE ON producers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Participants count trigger
CREATE TRIGGER IF NOT EXISTS update_tasting_participants_trigger
    AFTER INSERT OR DELETE ON tasting_participants
    FOR EACH ROW EXECUTE FUNCTION update_tasting_participants_count();

-- ============================================================================
-- 6. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE producers ENABLE ROW LEVEL SECURITY;

-- User Reviews Policies
CREATE POLICY "Users can view reviews on their tastings" ON user_reviews
    FOR SELECT USING (
        tasting_id IN (SELECT id FROM tastings WHERE created_by = auth.uid())
        OR user_id = auth.uid()
    );

CREATE POLICY "Users can create reviews" ON user_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON user_reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON user_reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Competitions Policies
CREATE POLICY "Anyone can view active competitions" ON competitions
    FOR SELECT USING (status = 'active' OR organizer_id = auth.uid());

CREATE POLICY "Users can create competitions" ON competitions
    FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their competitions" ON competitions
    FOR UPDATE USING (auth.uid() = organizer_id);

-- Competition Participants Policies
CREATE POLICY "Users can view competition participants" ON competition_participants
    FOR SELECT USING (
        user_id = auth.uid()
        OR competition_id IN (SELECT id FROM competitions WHERE organizer_id = auth.uid())
    );

CREATE POLICY "Users can join competitions" ON competition_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation" ON competition_participants
    FOR UPDATE USING (auth.uid() = user_id);

-- Friendships Policies
CREATE POLICY "Users can view their friendships" ON friendships
    FOR SELECT USING (requester_id = auth.uid() OR addressee_id = auth.uid());

CREATE POLICY "Users can create friend requests" ON friendships
    FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update friendship status" ON friendships
    FOR UPDATE USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- Activities Policies
CREATE POLICY "Users can view public activities and their own" ON activities
    FOR SELECT USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can create activities" ON activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities" ON activities
    FOR UPDATE USING (auth.uid() = user_id);

-- Activity Likes Policies
CREATE POLICY "Users can view activity likes" ON activity_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can like activities" ON activity_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike activities" ON activity_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Activity Comments Policies
CREATE POLICY "Users can view activity comments" ON activity_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON activity_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON activity_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON activity_comments
    FOR DELETE USING (auth.uid() = user_id);

-- Achievements Policies
CREATE POLICY "Users can view their own achievements" ON achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can award achievements" ON achievements
    FOR INSERT WITH CHECK (true);

-- User Streaks Policies
CREATE POLICY "Users can view their own streaks" ON user_streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks" ON user_streaks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks" ON user_streaks
    FOR UPDATE USING (auth.uid() = user_id);

-- Daily Challenges Policies
CREATE POLICY "Anyone can view active challenges" ON daily_challenges
    FOR SELECT USING (is_active = true);

-- User Challenge Progress Policies
CREATE POLICY "Users can view their own challenge progress" ON user_challenge_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own challenge progress" ON user_challenge_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge progress" ON user_challenge_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Producers Policies
CREATE POLICY "Anyone can view producers" ON producers
    FOR SELECT USING (true);

-- Update existing profiles policies
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- ============================================================================
-- 7. MATERIALIZED VIEWS FOR PERFORMANCE
-- ============================================================================

-- User Statistics View
CREATE MATERIALIZED VIEW IF NOT EXISTS user_stats AS
SELECT
    p.id,
    p.name,
    COUNT(DISTINCT t.id) as tasting_count,
    AVG(ur.rating) as avg_rating,
    COUNT(DISTINCT a.id) as achievement_count,
    MAX(us.longest_streak) as longest_streak
FROM profiles p
LEFT JOIN tastings t ON p.id = t.created_by
LEFT JOIN user_reviews ur ON ur.user_id = p.id
LEFT JOIN achievements a ON a.user_id = p.id
LEFT JOIN user_streaks us ON us.user_id = p.id
GROUP BY p.id, p.name;

-- Popular Beverages View
CREATE MATERIALIZED VIEW IF NOT EXISTS popular_beverages AS
SELECT
    type,
    COUNT(*) as count,
    AVG(alcohol_content) as avg_alcohol_content,
    COUNT(DISTINCT region) as regions_count
FROM mexican_beverages
GROUP BY type
ORDER BY count DESC;

-- Recent Activity View
CREATE MATERIALIZED VIEW IF NOT EXISTS recent_activities AS
SELECT
    a.*,
    p.name as user_name,
    p.avatar_url as user_avatar,
    COUNT(al.id) as like_count,
    COUNT(ac.id) as comment_count
FROM activities a
JOIN profiles p ON a.user_id = p.id
LEFT JOIN activity_likes al ON a.id = al.activity_id
LEFT JOIN activity_comments ac ON a.id = ac.activity_id
WHERE a.is_public = true
GROUP BY a.id, p.name, p.avatar_url
ORDER BY a.created_at DESC
LIMIT 100;

-- Create indexes on materialized views
CREATE INDEX IF NOT EXISTS idx_user_stats_tasting_count ON user_stats(tasting_count DESC);
CREATE INDEX IF NOT EXISTS idx_popular_beverages_count ON popular_beverages(count DESC);
CREATE INDEX IF NOT EXISTS idx_recent_activities_created_at ON recent_activities(created_at DESC);

-- ============================================================================
-- 8. INITIAL DATA MIGRATION
-- ============================================================================

-- Update existing profiles with default values
UPDATE profiles
SET
    experience_level = 'beginner',
    beverage_preferences = '{}',
    language = 'es',
    account_status = 'active'
WHERE experience_level IS NULL;

-- Update existing tastings with default values
UPDATE tastings
SET
    tasting_data = '{}',
    current_participants = 1,
    is_public = false
WHERE tasting_data IS NULL;

-- Create initial daily challenges
INSERT INTO daily_challenges (title, description, challenge_type, difficulty, points, requirements, date)
VALUES
    ('Primer Sorbo', 'Completa tu primera cata del día', 'tasting', 'easy', 10, '{"tastings_required": 1}', CURRENT_DATE),
    ('Explorador de Sabores', 'Identifica 5 sabores diferentes en una cata', 'tasting', 'medium', 20, '{"flavors_required": 5}', CURRENT_DATE),
    ('Crítico Experto', 'Escribe una reseña detallada de al menos 100 palabras', 'review', 'medium', 15, '{"min_words": 100}', CURRENT_DATE),
    ('Conector Social', 'Comenta en 3 actividades de amigos', 'social', 'easy', 10, '{"comments_required": 3}', CURRENT_DATE)
ON CONFLICT (date, challenge_type) DO NOTHING;

-- ============================================================================
-- 9. REFRESH MATERIALIZED VIEWS
-- ============================================================================

REFRESH MATERIALIZED VIEW user_stats;
REFRESH MATERIALIZED VIEW popular_beverages;
REFRESH MATERIALIZED VIEW recent_activities;

-- ============================================================================
-- 10. FINAL OPTIMIZATIONS
-- ============================================================================

-- Analyze tables for query planner
ANALYZE user_reviews;
ANALYZE competitions;
ANALYZE competition_participants;
ANALYZE friendships;
ANALYZE activities;
ANALYZE activity_likes;
ANALYZE activity_comments;
ANALYZE achievements;
ANALYZE user_streaks;
ANALYZE daily_challenges;
ANALYZE user_challenge_progress;
ANALYZE producers;
ANALYZE profiles;
ANALYZE tastings;
ANALYZE tasting_items;
ANALYZE mexican_beverages;

-- Create function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW user_stats;
    REFRESH MATERIALIZED VIEW popular_beverages;
    REFRESH MATERIALIZED VIEW recent_activities;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'FlavorWheel México database schema migration completed successfully!';
    RAISE NOTICE 'Created % new tables', (
        SELECT COUNT(*) FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name IN (
            'user_reviews', 'competitions', 'competition_participants',
            'friendships', 'activities', 'activity_likes', 'activity_comments',
            'achievements', 'user_streaks', 'daily_challenges',
            'user_challenge_progress', 'producers'
        )
    );
    RAISE NOTICE 'Migration timestamp: %', now();
END $$;
