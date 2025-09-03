-- FlavorWheel México - Materialized Views for Performance
-- This file contains all materialized views for optimizing common queries

-- ============================================================================
-- 1. USER ANALYTICS VIEWS
-- ============================================================================

-- User Statistics Materialized View
CREATE MATERIALIZED VIEW IF NOT EXISTS user_analytics AS
SELECT 
    p.id as user_id,
    p.name,
    p.email,
    p.experience_level,
    p.created_at as user_since,
    
    -- Tasting Statistics
    COUNT(DISTINCT t.id) as total_tastings,
    COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tastings,
    COUNT(DISTINCT CASE WHEN t.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN t.id END) as tastings_last_30_days,
    COUNT(DISTINCT CASE WHEN t.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN t.id END) as tastings_last_7_days,
    
    -- Review Statistics
    COUNT(DISTINCT ur.id) as total_reviews,
    ROUND(AVG(ur.rating), 2) as average_rating,
    COUNT(DISTINCT CASE WHEN ur.rating >= 8 THEN ur.id END) as high_ratings_count,
    
    -- Social Statistics
    COUNT(DISTINCT f1.id) + COUNT(DISTINCT f2.id) as total_friends,
    COUNT(DISTINCT a.id) as total_activities,
    COUNT(DISTINCT al.id) as total_likes_received,
    COUNT(DISTINCT ac.id) as total_comments_made,
    
    -- Achievement Statistics
    COUNT(DISTINCT ach.id) as total_achievements,
    COALESCE(SUM(ach.points), 0) as total_points,
    
    -- Streak Statistics
    MAX(us.longest_streak) as longest_streak,
    MAX(CASE WHEN us.streak_type = 'daily_tasting' THEN us.current_streak END) as current_daily_streak,
    
    -- Flavor Preferences (top 3)
    (
        SELECT json_agg(flavor_data ORDER BY flavor_count DESC)
        FROM (
            SELECT 
                jsonb_object_keys(fw.wheel_data->'children') as flavor_category,
                COUNT(*) as flavor_count
            FROM flavor_wheels fw
            WHERE fw.user_id = p.id
            GROUP BY jsonb_object_keys(fw.wheel_data->'children')
            ORDER BY COUNT(*) DESC
            LIMIT 3
        ) flavor_data
    ) as top_flavor_categories,
    
    -- Last Activity
    GREATEST(
        COALESCE(MAX(t.created_at), '1970-01-01'::timestamp),
        COALESCE(MAX(ur.created_at), '1970-01-01'::timestamp),
        COALESCE(MAX(a.created_at), '1970-01-01'::timestamp)
    ) as last_activity_at

FROM profiles p
LEFT JOIN tastings t ON p.id = t.created_by
LEFT JOIN user_reviews ur ON p.id = ur.user_id
LEFT JOIN friendships f1 ON p.id = f1.requester_id AND f1.status = 'accepted'
LEFT JOIN friendships f2 ON p.id = f2.addressee_id AND f2.status = 'accepted'
LEFT JOIN activities a ON p.id = a.user_id
LEFT JOIN activity_likes al ON a.id = al.activity_id
LEFT JOIN activity_comments ac ON p.id = ac.user_id
LEFT JOIN achievements ach ON p.id = ach.user_id
LEFT JOIN user_streaks us ON p.id = us.user_id
LEFT JOIN flavor_wheels fw ON p.id = fw.user_id
GROUP BY p.id, p.name, p.email, p.experience_level, p.created_at;

-- Create indexes on materialized view
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_total_tastings ON user_analytics(total_tastings DESC);
CREATE INDEX IF NOT EXISTS idx_user_analytics_experience_level ON user_analytics(experience_level);
CREATE INDEX IF NOT EXISTS idx_user_analytics_last_activity ON user_analytics(last_activity_at DESC);

-- ============================================================================
-- 2. BEVERAGE ANALYTICS VIEWS
-- ============================================================================

-- Popular Beverages Materialized View
CREATE MATERIALIZED VIEW IF NOT EXISTS beverage_analytics AS
SELECT 
    mb.id as beverage_id,
    mb.name,
    mb.type,
    mb.region,
    mb.agave_variety,
    mb.alcohol_content,
    mb.producer_id,
    p.name as producer_name,
    
    -- Usage Statistics
    COUNT(DISTINCT ti.id) as times_tasted,
    COUNT(DISTINCT ti.tasting_id) as unique_tastings,
    COUNT(DISTINCT t.created_by) as unique_tasters,
    
    -- Rating Statistics
    COUNT(DISTINCT ur.id) as total_reviews,
    ROUND(AVG(ur.rating), 2) as average_rating,
    COUNT(DISTINCT CASE WHEN ur.rating >= 8 THEN ur.id END) as high_ratings_count,
    COUNT(DISTINCT CASE WHEN ur.rating <= 5 THEN ur.id END) as low_ratings_count,
    
    -- Recent Activity
    COUNT(DISTINCT CASE WHEN t.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN t.id END) as tastings_last_30_days,
    COUNT(DISTINCT CASE WHEN t.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN t.id END) as tastings_last_7_days,
    
    -- Flavor Profile Aggregation
    (
        SELECT json_agg(DISTINCT flavor_category)
        FROM (
            SELECT jsonb_object_keys(fw.wheel_data->'children') as flavor_category
            FROM flavor_wheels fw
            JOIN tastings t2 ON fw.tasting_id = t2.id
            JOIN tasting_items ti2 ON t2.id = ti2.tasting_id
            WHERE ti2.mexican_beverage_id = mb.id
            LIMIT 10
        ) flavors
    ) as common_flavors,
    
    -- Popularity Score (weighted)
    (
        COUNT(DISTINCT ti.id) * 0.4 +
        COUNT(DISTINCT ur.id) * 0.3 +
        COALESCE(AVG(ur.rating), 0) * 0.3
    ) as popularity_score,
    
    -- Last Tasted
    MAX(t.created_at) as last_tasted_at

FROM mexican_beverages mb
LEFT JOIN producers p ON mb.producer_id = p.id
LEFT JOIN tasting_items ti ON mb.id = ti.mexican_beverage_id
LEFT JOIN tastings t ON ti.tasting_id = t.id
LEFT JOIN user_reviews ur ON ti.id = ur.item_id
GROUP BY mb.id, mb.name, mb.type, mb.region, mb.agave_variety, mb.alcohol_content, mb.producer_id, p.name;

-- Create indexes on beverage analytics
CREATE INDEX IF NOT EXISTS idx_beverage_analytics_beverage_id ON beverage_analytics(beverage_id);
CREATE INDEX IF NOT EXISTS idx_beverage_analytics_type ON beverage_analytics(type);
CREATE INDEX IF NOT EXISTS idx_beverage_analytics_region ON beverage_analytics(region);
CREATE INDEX IF NOT EXISTS idx_beverage_analytics_popularity ON beverage_analytics(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_beverage_analytics_rating ON beverage_analytics(average_rating DESC);

-- ============================================================================
-- 3. TASTING ANALYTICS VIEWS
-- ============================================================================

-- Tasting Session Analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS tasting_analytics AS
SELECT 
    t.id as tasting_id,
    t.name,
    t.type,
    t.mode,
    t.language,
    t.created_by,
    t.created_at,
    t.status,
    
    -- Participation Statistics
    COUNT(DISTINCT tp.user_id) as total_participants,
    COUNT(DISTINCT CASE WHEN tp.status = 'completed' THEN tp.user_id END) as completed_participants,
    
    -- Item Statistics
    COUNT(DISTINCT ti.id) as total_items,
    COUNT(DISTINCT ti.mexican_beverage_id) as unique_beverages,
    
    -- Review Statistics
    COUNT(DISTINCT ur.id) as total_reviews,
    ROUND(AVG(ur.rating), 2) as average_rating,
    
    -- Engagement Metrics
    COUNT(DISTINCT a.id) as activities_generated,
    COUNT(DISTINCT al.id) as total_likes,
    COUNT(DISTINCT ac.id) as total_comments,
    
    -- Flavor Wheels Generated
    COUNT(DISTINCT fw.id) as flavor_wheels_generated,
    
    -- Duration (if completed)
    CASE 
        WHEN t.status = 'completed' THEN 
            EXTRACT(EPOCH FROM (t.updated_at - t.created_at)) / 3600.0
        ELSE NULL 
    END as duration_hours,
    
    -- Success Rate
    CASE 
        WHEN COUNT(DISTINCT tp.user_id) > 0 THEN
            ROUND(
                COUNT(DISTINCT CASE WHEN tp.status = 'completed' THEN tp.user_id END)::numeric / 
                COUNT(DISTINCT tp.user_id)::numeric * 100, 
                2
            )
        ELSE 0 
    END as completion_rate

FROM tastings t
LEFT JOIN tasting_participants tp ON t.id = tp.tasting_id
LEFT JOIN tasting_items ti ON t.id = ti.tasting_id
LEFT JOIN user_reviews ur ON ti.id = ur.item_id
LEFT JOIN activities a ON t.id = (a.metadata->>'tasting_id')::uuid
LEFT JOIN activity_likes al ON a.id = al.activity_id
LEFT JOIN activity_comments ac ON a.id = ac.activity_id
LEFT JOIN flavor_wheels fw ON t.id = fw.tasting_id
GROUP BY t.id, t.name, t.type, t.mode, t.language, t.created_by, t.created_at, t.status, t.updated_at;

-- Create indexes on tasting analytics
CREATE INDEX IF NOT EXISTS idx_tasting_analytics_tasting_id ON tasting_analytics(tasting_id);
CREATE INDEX IF NOT EXISTS idx_tasting_analytics_created_by ON tasting_analytics(created_by);
CREATE INDEX IF NOT EXISTS idx_tasting_analytics_type ON tasting_analytics(type);
CREATE INDEX IF NOT EXISTS idx_tasting_analytics_completion_rate ON tasting_analytics(completion_rate DESC);
CREATE INDEX IF NOT EXISTS idx_tasting_analytics_created_at ON tasting_analytics(created_at DESC);

-- ============================================================================
-- 4. REGIONAL ANALYTICS VIEWS
-- ============================================================================

-- Regional Beverage Popularity
CREATE MATERIALIZED VIEW IF NOT EXISTS regional_analytics AS
SELECT 
    mb.region,
    mb.type as beverage_type,
    
    -- Beverage Counts
    COUNT(DISTINCT mb.id) as total_beverages,
    COUNT(DISTINCT mb.producer_id) as total_producers,
    
    -- Tasting Statistics
    COUNT(DISTINCT ti.id) as total_tastings,
    COUNT(DISTINCT t.created_by) as unique_tasters,
    
    -- Rating Statistics
    COUNT(DISTINCT ur.id) as total_reviews,
    ROUND(AVG(ur.rating), 2) as average_rating,
    
    -- Popular Agave Varieties
    (
        SELECT json_agg(variety_data ORDER BY variety_count DESC)
        FROM (
            SELECT 
                mb2.agave_variety,
                COUNT(*) as variety_count
            FROM mexican_beverages mb2
            WHERE mb2.region = mb.region AND mb2.type = mb.type
            AND mb2.agave_variety IS NOT NULL
            GROUP BY mb2.agave_variety
            ORDER BY COUNT(*) DESC
            LIMIT 5
        ) variety_data
    ) as popular_agave_varieties,
    
    -- Recent Activity
    COUNT(DISTINCT CASE WHEN t.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN t.id END) as recent_tastings,
    
    -- Regional Score
    (
        COUNT(DISTINCT mb.id) * 0.3 +
        COUNT(DISTINCT ti.id) * 0.4 +
        COALESCE(AVG(ur.rating), 0) * 0.3
    ) as regional_popularity_score

FROM mexican_beverages mb
LEFT JOIN tasting_items ti ON mb.id = ti.mexican_beverage_id
LEFT JOIN tastings t ON ti.tasting_id = t.id
LEFT JOIN user_reviews ur ON ti.id = ur.item_id
WHERE mb.region IS NOT NULL
GROUP BY mb.region, mb.type;

-- Create indexes on regional analytics
CREATE INDEX IF NOT EXISTS idx_regional_analytics_region ON regional_analytics(region);
CREATE INDEX IF NOT EXISTS idx_regional_analytics_type ON regional_analytics(beverage_type);
CREATE INDEX IF NOT EXISTS idx_regional_analytics_popularity ON regional_analytics(regional_popularity_score DESC);

-- ============================================================================
-- 5. REFRESH FUNCTIONS
-- ============================================================================

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_all_analytics_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW user_analytics;
    REFRESH MATERIALIZED VIEW beverage_analytics;
    REFRESH MATERIALIZED VIEW tasting_analytics;
    REFRESH MATERIALIZED VIEW regional_analytics;
    
    -- Update last refresh timestamp
    INSERT INTO system_metadata (key, value, updated_at)
    VALUES ('last_analytics_refresh', to_char(now(), 'YYYY-MM-DD HH24:MI:SS'), now())
    ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = EXCLUDED.updated_at;
        
    RAISE NOTICE 'All analytics materialized views refreshed at %', now();
END;
$$ LANGUAGE plpgsql;

-- Function to refresh views concurrently (PostgreSQL 9.4+)
CREATE OR REPLACE FUNCTION refresh_analytics_concurrent()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_analytics;
    REFRESH MATERIALIZED VIEW CONCURRENTLY beverage_analytics;
    REFRESH MATERIALIZED VIEW CONCURRENTLY tasting_analytics;
    REFRESH MATERIALIZED VIEW CONCURRENTLY regional_analytics;
    
    RAISE NOTICE 'All analytics materialized views refreshed concurrently at %', now();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. SYSTEM METADATA TABLE
-- ============================================================================

-- Table to track system metadata like last refresh times
CREATE TABLE IF NOT EXISTS system_metadata (
    key text PRIMARY KEY,
    value text NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);

-- Insert initial refresh timestamp
INSERT INTO system_metadata (key, value, updated_at)
VALUES ('last_analytics_refresh', 'never', now())
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 7. SCHEDULED REFRESH (if pg_cron is available)
-- ============================================================================

-- Schedule materialized view refresh every hour
-- SELECT cron.schedule('refresh-analytics', '0 * * * *', 'SELECT refresh_analytics_concurrent();');

-- Schedule full refresh daily at 2 AM
-- SELECT cron.schedule('refresh-analytics-full', '0 2 * * *', 'SELECT refresh_all_analytics_views();');

-- ============================================================================
-- NOTES
-- ============================================================================

-- Performance Considerations:
-- 1. Materialized views are refreshed periodically, not real-time
-- 2. Use CONCURRENTLY for refreshes to avoid blocking reads
-- 3. Monitor view sizes and refresh times
-- 4. Consider partitioning for very large datasets
-- 5. Index materialized views for common query patterns

-- Maintenance:
-- 1. Monitor refresh performance and adjust schedule as needed
-- 2. Add new views as analytics requirements grow
-- 3. Archive old data to keep views performant
-- 4. Consider incremental refresh strategies for large views
