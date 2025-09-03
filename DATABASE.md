# FlavorWheel México Database Documentation

## Database Overview
- **Project**: FlavorWheel México (ID: kobuclkvlacdwvxmakvq)
- **Region**: us-east-1
- **Status**: ACTIVE_HEALTHY
- **PostgreSQL Version**: 17.4.1.054
- **Supabase URL**: db.kobuclkvlacdwvxmakvq.supabase.co

## Core Application Tables (Public Schema)

### User Management
- **`profiles`** (14 records): User profiles with preferences, progress tracking, and achievements
  - Fields: id, name, email, avatar_url, preferences (jsonb), progress (jsonb)
  - Preferences include: theme, language (es-MX), notifications
  - Progress tracks: expertise level, tastings completed, regions explored, achievements

- **`users`** (separate table): Basic user information
- **`friendships`**: Social connections between users (pending/accepted status)
- **`activities`** (3 records): User activity feed
- **`activity_comments`** & **`activity_likes`**: Social interaction features

### Tasting System
- **`tastings`** (100 records): Core tasting sessions
  - Fields: id, code, name, type, description, date, is_blind, created_by
  - Types: guided, challenge, sotol, etc.
  - Modes: study, competition
  - Languages: Spanish (es) primary
  - Features: blind tasting, competition mode, participant ranking

- **`tasting_items`** (156 records): Individual items being tasted
  - Links to mexican_beverages via mexican_beverage_id
  - Includes: name, description, order_index, metadata, photo_url

- **`tasting_participants`**: User participation with roles
  - Roles: host, co_host, participant, observer
  - Status: joined, left, removed, completed

- **`tasting_results`**: User responses and ratings (jsonb format)
- **`tasting_categories`**: Evaluation criteria for tastings
- **`user_reviews`** (64 records): Individual user responses

### Mexican Beverage Database
- **`mexican_beverages`** (12 records): Comprehensive beverage catalog
  - Fields: nom_number, name, type, producer_id, region, agave_variety
  - Types: mezcal, tequila, sotol, pulque, raicilla, bacanora
  - Includes: alcohol_content, production_method, tasting_notes (jsonb)
  - Features: stock management, certifications, sustainability data

- **`producers`** (5 records): Producer information
  - Fields: nom_number, name, type[], region, municipality, state
  - Includes: certifications, facility info, brands, agave_varieties
  - Features: sustainability tracking, contact info, ownership type

### Flavor Analysis System
- **`flavor_wheels`** (9 records): Visual flavor profile representations
  - Fields: tasting_id, user_id, wheel_type, wheel_data (jsonb)
  - Includes: prose_excerpt, picture_url, group_id

- **`flavor_keywords`**: Standardized flavor terminology
  - Fields: keyword, category, subcategory, language, intensity_weight
  - Multi-language support (en/es)
  - Product type associations

- **`flavor_keyword_variants`**: Multi-language flavor term variations
- **`flavor_stopwords`**: Words to exclude from flavor analysis

### Template & Challenge System
- **`tasting_templates`**: Structured tasting formats
  - Difficulty levels: beginner, intermediate, professional
  - Categories: beginner, professional, educational, competition, regional
  - Features: evaluation criteria, scoring methods, cultural context

- **`templates`**: General template system
- **`template_categories`** & **`template_ratings`**: Organization and feedback
- **`daily_challenges`**: Gamification features with Mexican focus
- **`user_challenge_progress`**: Progress tracking
- **`user_streaks`**: Engagement tracking

### Product Management
- **`product_types`**: Categorization of different beverage types
- **`item_attributes`**: Metadata for tasting items

### Communication & Notifications
- **`chat_messages`**: In-app messaging system
- **`notification_logs`**: Push notification tracking
- **`push_subscriptions`**: User notification preferences

## Custom Types (Enums)

### Mexican Beverage Types
- mezcal, tequila, sotol, pulque, raicilla, bacanora

### Difficulty Levels
- beginner, intermediate, professional

### Participant Roles
- host, co_host, participant, observer

### Participation Status
- joined, left, removed, completed

### Template Categories
- beginner, professional, educational, competition, regional

### Certification Types
- NOM, CRT, CRM, Organic, Biodynamic, Fair_Trade, Sotol_Certification

## Storage
- **Storage Bucket**: `tasting-photos` (public) for tasting-related images

## Database Functions
- `update_beverage_stock`: Inventory management
- `update_template_rating`: Rating aggregation
- `update_updated_at_column`: Timestamp management

## Key Features

### Multi-language Support
- Primary: Spanish (es-MX)
- Secondary: English (en)

### Tasting Capabilities
- Blind tasting support
- Competition mode with ranking
- Multiple tasting types (guided, challenge, etc.)
- Real-time collaboration

### Mexican Beverage Focus
- NOM number tracking (regulatory compliance)
- Regional classification
- Agave variety tracking
- Traditional production methods

### Social Features
- Friend connections
- Activity feeds
- Likes and comments
- Chat messaging

### Gamification
- Daily challenges
- Streak tracking
- Achievement system
- Progress monitoring

### Professional Features
- Template system for structured tastings
- Evaluation criteria customization
- Scoring methodologies
- Educational content integration

## Data Statistics
- 14 active user profiles
- 100 tastings conducted
- 156 tasting items
- 64 user reviews
- 12 Mexican beverages cataloged
- 5 producers registered
- 9 flavor wheels created

## Authentication & Security
- Supabase Auth integration
- Row Level Security (RLS) policies
- User-based data access control
- Profile-based permissions

## API Access
- REST API via Supabase
- Real-time subscriptions
- GraphQL support
- Client libraries available
