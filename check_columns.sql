-- Check what columns exist in user_reviews table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_reviews'
AND table_schema = 'public'
ORDER BY ordinal_position;

