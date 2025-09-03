-- FlavorWheel México - Query Optimizations
-- This file contains optimized queries and performance improvements

-- ============================================================================
-- 1. OPTIMIZED COMMON QUERIES
-- ============================================================================

-- Optimized User Dashboard Query
CREATE OR REPLACE FUNCTION get_user_dashboard(p_user_id uuid)
RETURNS json AS $$
DECLARE
    result json;
BEGIN
    SELECT json_build_object(
        'user_stats', (
            SELECT json_build_object(
                'total_tastings', total_tastings,
                'completed_tastings', completed_tastings,
                'average_rating', average_rating,
                'total_achievements', total_achievements,
                'current_streak', current_daily_streak,
                'last_activity', last_activity_at
            )
            FROM user_analytics
            WHERE user_id = p_user_id
        ),
        'recent_tastings', (
            SELECT json_agg(
                json_build_object(
                    'id', t.id,
                    'name', t.name,
                    'type', t.type,
                    'status', t.status,
                    'created_at', t.created_at,
                    'items_count', (
                        SELECT COUNT(*) FROM tasting_items ti WHERE ti.tasting_id = t.id
                    )
                )
                ORDER BY t.created_at DESC
            )
            FROM tastings t
            WHERE t.created_by = p_user_id
            LIMIT 5
        ),
        'recent_activities', (
            SELECT json_agg(
                json_build_object(
                    'id', a.id,
                    'type', a.activity_type,
                    'title', a.title,
                    'created_at', a.created_at,
                    'likes_count', (
                        SELECT COUNT(*) FROM activity_likes al WHERE al.activity_id = a.id
                    )
                )
                ORDER BY a.created_at DESC
            )
            FROM activities a
            WHERE a.user_id = p_user_id AND a.is_public = true
            LIMIT 5
        ),
        'achievements', (
            SELECT json_agg(
                json_build_object(
                    'type', achievement_type,
                    'title', title,
                    'description', description,
                    'points', points,
                    'unlocked_at', unlocked_at
                )
                ORDER BY unlocked_at DESC
            )
            FROM achievements
            WHERE user_id = p_user_id
            LIMIT 10
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Optimized Tasting Feed Query
CREATE OR REPLACE FUNCTION get_tasting_feed(
    p_user_id uuid,
    p_limit integer DEFAULT 20,
    p_offset integer DEFAULT 0
)
RETURNS json AS $$
BEGIN
    RETURN (
        SELECT json_agg(
            json_build_object(
                'id', t.id,
                'name', t.name,
                'description', t.description,
                'type', t.type,
                'mode', t.mode,
                'is_public', t.is_public,
                'created_at', t.created_at,
                'created_by', json_build_object(
                    'id', p.id,
                    'name', p.name,
                    'avatar_url', p.avatar_url
                ),
                'participants_count', t.current_participants,
                'items_count', (
                    SELECT COUNT(*) FROM tasting_items ti WHERE ti.tasting_id = t.id
                ),
                'recent_reviews', (
                    SELECT json_agg(
                        json_build_object(
                            'rating', ur.rating,
                            'title', ur.title,
                            'user_name', up.name
                        )
                        ORDER BY ur.created_at DESC
                    )
                    FROM user_reviews ur
                    JOIN profiles up ON ur.user_id = up.id
                    WHERE ur.tasting_id = t.id
                    LIMIT 3
                )
            )
            ORDER BY t.created_at DESC
        )
        FROM tastings t
        JOIN profiles p ON t.created_by = p.id
        WHERE t.is_public = true
        OR t.created_by = p_user_id
        OR EXISTS (
            SELECT 1 FROM tasting_participants tp
            WHERE tp.tasting_id = t.id AND tp.user_id = p_user_id
        )
        LIMIT p_limit OFFSET p_offset
    );
END;
$$ LANGUAGE plpgsql;

-- Optimized Beverage Search Query
CREATE OR REPLACE FUNCTION search_beverages(
    p_query text,
    p_type text DEFAULT NULL,
    p_region text DEFAULT NULL,
    p_min_rating numeric DEFAULT NULL,
    p_limit integer DEFAULT 20,
    p_offset integer DEFAULT 0
)
RETURNS json AS $$
BEGIN
    RETURN (
        SELECT json_agg(
            json_build_object(
                'id', ba.beverage_id,
                'name', ba.name,
                'type', ba.type,
                'region', ba.region,
                'agave_variety', ba.agave_variety,
                'alcohol_content', ba.alcohol_content,
                'producer_name', ba.producer_name,
                'average_rating', ba.average_rating,
                'total_reviews', ba.total_reviews,
                'times_tasted', ba.times_tasted,
                'popularity_score', ba.popularity_score,
                'common_flavors', ba.common_flavors
            )
            ORDER BY 
                CASE WHEN p_query IS NOT NULL THEN
                    ts_rank(
                        to_tsvector('spanish', ba.name || ' ' || COALESCE(ba.producer_name, '')),
                        plainto_tsquery('spanish', p_query)
                    )
                ELSE ba.popularity_score
                END DESC
        )
        FROM beverage_analytics ba
        WHERE (p_query IS NULL OR (
            to_tsvector('spanish', ba.name || ' ' || COALESCE(ba.producer_name, ''))
            @@ plainto_tsquery('spanish', p_query)
        ))
        AND (p_type IS NULL OR ba.type = p_type)
        AND (p_region IS NULL OR ba.region = p_region)
        AND (p_min_rating IS NULL OR ba.average_rating >= p_min_rating)
        LIMIT p_limit OFFSET p_offset
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. PERFORMANCE INDEXES
-- ============================================================================

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_beverages_search 
ON mexican_beverages USING GIN(to_tsvector('spanish', name || ' ' || COALESCE(region, '')));

CREATE INDEX IF NOT EXISTS idx_producers_search 
ON producers USING GIN(to_tsvector('spanish', name || ' ' || COALESCE(region, '')));

CREATE INDEX IF NOT EXISTS idx_tastings_search 
ON tastings USING GIN(to_tsvector('spanish', name || ' ' || COALESCE(description, '')));

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_tastings_user_status_date 
ON tastings(created_by, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_reviews_tasting_rating_date 
ON user_reviews(tasting_id, rating DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activities_user_public_date 
ON activities(user_id, is_public, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tasting_items_beverage_tasting 
ON tasting_items(mexican_beverage_id, tasting_id);

-- Partial indexes for active data
CREATE INDEX IF NOT EXISTS idx_tastings_active 
ON tastings(created_at DESC) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_competitions_upcoming 
ON competitions(start_date) WHERE status = 'upcoming';

CREATE INDEX IF NOT EXISTS idx_friendships_accepted 
ON friendships(requester_id, addressee_id) WHERE status = 'accepted';

-- ============================================================================
-- 3. QUERY OPTIMIZATION FUNCTIONS
-- ============================================================================

-- Function to get user's friend activity feed
CREATE OR REPLACE FUNCTION get_friend_activity_feed(
    p_user_id uuid,
    p_limit integer DEFAULT 20,
    p_offset integer DEFAULT 0
)
RETURNS json AS $$
BEGIN
    RETURN (
        SELECT json_agg(
            json_build_object(
                'id', a.id,
                'type', a.activity_type,
                'title', a.title,
                'description', a.description,
                'created_at', a.created_at,
                'user', json_build_object(
                    'id', p.id,
                    'name', p.name,
                    'avatar_url', p.avatar_url
                ),
                'likes_count', (
                    SELECT COUNT(*) FROM activity_likes al WHERE al.activity_id = a.id
                ),
                'comments_count', (
                    SELECT COUNT(*) FROM activity_comments ac WHERE ac.activity_id = a.id
                ),
                'user_liked', EXISTS(
                    SELECT 1 FROM activity_likes al 
                    WHERE al.activity_id = a.id AND al.user_id = p_user_id
                )
            )
            ORDER BY a.created_at DESC
        )
        FROM activities a
        JOIN profiles p ON a.user_id = p.id
        WHERE a.is_public = true
        AND a.user_id IN (
            SELECT CASE 
                WHEN f.requester_id = p_user_id THEN f.addressee_id
                ELSE f.requester_id
            END
            FROM friendships f
            WHERE (f.requester_id = p_user_id OR f.addressee_id = p_user_id)
            AND f.status = 'accepted'
        )
        LIMIT p_limit OFFSET p_offset
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get beverage recommendations
CREATE OR REPLACE FUNCTION get_beverage_recommendations(
    p_user_id uuid,
    p_limit integer DEFAULT 10
)
RETURNS json AS $$
DECLARE
    user_preferences json;
    user_ratings record;
BEGIN
    -- Get user's flavor preferences and rating patterns
    SELECT 
        top_flavor_categories,
        average_rating
    INTO user_preferences, user_ratings
    FROM user_analytics
    WHERE user_id = p_user_id;
    
    -- If no data, return popular beverages
    IF user_preferences IS NULL THEN
        RETURN (
            SELECT json_agg(
                json_build_object(
                    'beverage_id', beverage_id,
                    'name', name,
                    'type', type,
                    'region', region,
                    'average_rating', average_rating,
                    'recommendation_reason', 'Popular choice'
                )
                ORDER BY popularity_score DESC
            )
            FROM beverage_analytics
            WHERE average_rating >= 7
            LIMIT p_limit
        );
    END IF;
    
    -- Return personalized recommendations
    RETURN (
        SELECT json_agg(
            json_build_object(
                'beverage_id', ba.beverage_id,
                'name', ba.name,
                'type', ba.type,
                'region', ba.region,
                'average_rating', ba.average_rating,
                'recommendation_reason', 'Based on your preferences'
            )
            ORDER BY ba.popularity_score DESC
        )
        FROM beverage_analytics ba
        WHERE ba.beverage_id NOT IN (
            -- Exclude already tasted beverages
            SELECT DISTINCT ti.mexican_beverage_id
            FROM tasting_items ti
            JOIN tastings t ON ti.tasting_id = t.id
            WHERE t.created_by = p_user_id
            AND ti.mexican_beverage_id IS NOT NULL
        )
        AND ba.average_rating >= COALESCE(user_ratings.average_rating - 1, 6)
        LIMIT p_limit
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. CACHING STRATEGIES
-- ============================================================================

-- Function to cache expensive query results
CREATE OR REPLACE FUNCTION get_cached_result(
    cache_key text,
    cache_duration interval DEFAULT '1 hour'::interval
)
RETURNS json AS $$
DECLARE
    cached_data record;
    result json;
BEGIN
    -- Check if we have a valid cached result
    SELECT data, created_at INTO cached_data
    FROM query_cache
    WHERE key = cache_key
    AND created_at > now() - cache_duration;
    
    IF FOUND THEN
        RETURN cached_data.data;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to set cache
CREATE OR REPLACE FUNCTION set_cached_result(
    cache_key text,
    cache_data json
)
RETURNS void AS $$
BEGIN
    INSERT INTO query_cache (key, data, created_at)
    VALUES (cache_key, cache_data, now())
    ON CONFLICT (key) DO UPDATE SET
        data = EXCLUDED.data,
        created_at = EXCLUDED.created_at;
END;
$$ LANGUAGE plpgsql;

-- Query cache table
CREATE TABLE IF NOT EXISTS query_cache (
    key text PRIMARY KEY,
    data json NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Index for cache cleanup
CREATE INDEX IF NOT EXISTS idx_query_cache_created_at ON query_cache(created_at);

-- Function to clean old cache entries
CREATE OR REPLACE FUNCTION cleanup_query_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM query_cache
    WHERE created_at < now() - interval '24 hours';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. PERFORMANCE MONITORING
-- ============================================================================

-- Function to log slow queries
CREATE OR REPLACE FUNCTION log_slow_query(
    query_name text,
    execution_time_ms numeric,
    query_params json DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    INSERT INTO slow_query_log (
        query_name,
        execution_time_ms,
        query_params,
        logged_at
    ) VALUES (
        query_name,
        execution_time_ms,
        query_params,
        now()
    );
END;
$$ LANGUAGE plpgsql;

-- Slow query log table
CREATE TABLE IF NOT EXISTS slow_query_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    query_name text NOT NULL,
    execution_time_ms numeric NOT NULL,
    query_params json,
    logged_at timestamp with time zone DEFAULT now()
);

-- Index for performance analysis
CREATE INDEX IF NOT EXISTS idx_slow_query_log_name_time ON slow_query_log(query_name, execution_time_ms DESC);
CREATE INDEX IF NOT EXISTS idx_slow_query_log_logged_at ON slow_query_log(logged_at DESC);

-- ============================================================================
-- 6. CONNECTION POOLING CONFIGURATION
-- ============================================================================

-- Recommended PostgreSQL settings for connection pooling
-- Add these to postgresql.conf:

/*
# Connection Settings
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# Query Planning
random_page_cost = 1.1
effective_io_concurrency = 200

# Write Ahead Log
wal_buffers = 16MB
checkpoint_completion_target = 0.9

# Logging
log_min_duration_statement = 1000  # Log queries taking more than 1 second
log_statement = 'mod'  # Log all DDL and DML statements
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '

# Statistics
track_activities = on
track_counts = on
track_io_timing = on
track_functions = pl
*/

-- ============================================================================
-- NOTES
-- ============================================================================

-- Performance Best Practices:
-- 1. Use materialized views for complex aggregations
-- 2. Implement proper indexing strategies
-- 3. Use connection pooling (PgBouncer recommended)
-- 4. Cache expensive query results
-- 5. Monitor and log slow queries
-- 6. Use EXPLAIN ANALYZE to optimize queries
-- 7. Consider read replicas for analytics queries
-- 8. Implement query result pagination
-- 9. Use prepared statements for repeated queries
-- 10. Regular VACUUM and ANALYZE operations
