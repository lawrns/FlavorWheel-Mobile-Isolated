-- Create base Supabase tables that the application expects
-- These are the foundational tables that should exist in a Supabase project

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name text,
    email text,
    avatar_url text,
    bio text,
    location text,
    website text,
    experience_level text CHECK (experience_level IN ('beginner', 'intermediate', 'professional')) DEFAULT 'beginner',
    beverage_preferences text[] DEFAULT '{}',
    language text DEFAULT 'es',
    last_login timestamp with time zone,
    account_status text CHECK (account_status IN ('active', 'suspended', 'banned')) DEFAULT 'active',
    preferences jsonb DEFAULT '{
        "theme": "system",
        "notifications": {
            "email": true,
            "push": true,
            "tastingReminders": true,
            "socialActivity": true,
            "weeklyDigest": true
        },
        "privacy": {
            "profileVisibility": "public",
            "showActivity": true,
            "allowFriendRequests": true
        },
        "defaultTastingMode": "quick",
        "autoSave": true,
        "hapticFeedback": true
    }',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Tastings table
CREATE TABLE IF NOT EXISTS tastings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    type text CHECK (type IN ('quick', 'study', 'competition', 'educational', 'guided')) DEFAULT 'quick',
    status text CHECK (status IN ('draft', 'active', 'completed', 'cancelled')) DEFAULT 'draft',
    created_by uuid REFERENCES auth.users(id),
    date timestamp with time zone DEFAULT timezone('utc'::text, now()),
    characteristics jsonb DEFAULT '{}',
    max_participants integer,
    current_participants integer DEFAULT 1,
    is_public boolean DEFAULT false,
    location text,
    meeting_link text,
    tasting_data jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Tasting Items table
CREATE TABLE IF NOT EXISTS tasting_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tasting_id uuid REFERENCES tastings(id) ON DELETE CASCADE,
    name text NOT NULL,
    type text,
    details jsonb DEFAULT '{}',
    order_index integer DEFAULT 0,
    photo_url text,
    nom_number text,
    producer_id uuid REFERENCES producers(id),
    agave_variety text,
    production_method text,
    alcohol_content decimal(4,1),
    certifications text[] DEFAULT '{}',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Tasting Participants table
CREATE TABLE IF NOT EXISTS tasting_participants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tasting_id uuid REFERENCES tastings(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    status text CHECK (status IN ('joined', 'completed', 'left', 'removed')) DEFAULT 'joined',
    joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    completed_at timestamp with time zone,
    notes text
);

-- Mexican Beverages table
CREATE TABLE IF NOT EXISTS mexican_beverages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    type text CHECK (type IN ('mezcal', 'tequila', 'sotol', 'pulque', 'raicilla', 'bacanora')),
    nom_number text,
    producer_id uuid REFERENCES producers(id),
    agave_variety text,
    production_method text,
    alcohol_content decimal(4,1),
    tasting_notes jsonb DEFAULT '{}',
    certifications text[] DEFAULT '{}',
    stock_quantity integer DEFAULT 0,
    price_range text,
    availability text CHECK (availability IN ('available', 'limited', 'out_of_stock')) DEFAULT 'available',
    sustainability_score integer CHECK (sustainability_score >= 0 AND sustainability_score <= 100),
    region text,
    description text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Flavor Wheels table
CREATE TABLE IF NOT EXISTS flavor_wheels (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tasting_id uuid REFERENCES tastings(id) ON DELETE CASCADE,
    review_id uuid REFERENCES user_reviews(id) ON DELETE SET NULL,
    item_id uuid REFERENCES tasting_items(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    wheel_type text CHECK (wheel_type IN ('aroma', 'flavor', 'combined', 'metaphor')) DEFAULT 'combined',
    wheel_data jsonb NOT NULL,
    prose_excerpt text,
    picture_url text,
    group_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tastings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasting_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE mexican_beverages ENABLE ROW LEVEL SECURITY;
ALTER TABLE flavor_wheels ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view public tastings" ON tastings FOR SELECT USING (is_public = true OR created_by = auth.uid());
CREATE POLICY "Users can create tastings" ON tastings FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own tastings" ON tastings FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Anyone can view tasting items" ON tasting_items FOR SELECT USING (true);
CREATE POLICY "Users can manage items in their tastings" ON tasting_items FOR ALL USING (
    tasting_id IN (SELECT id FROM tastings WHERE created_by = auth.uid())
);

CREATE POLICY "Anyone can view beverages" ON mexican_beverages FOR SELECT USING (true);

CREATE POLICY "Users can view their own flavor wheels" ON flavor_wheels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own flavor wheels" ON flavor_wheels FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_tastings_created_by ON tastings(created_by);
CREATE INDEX IF NOT EXISTS idx_tastings_status ON tastings(status);
CREATE INDEX IF NOT EXISTS idx_tastings_is_public ON tastings(is_public);
CREATE INDEX IF NOT EXISTS idx_tasting_items_tasting_id ON tasting_items(tasting_id);
CREATE INDEX IF NOT EXISTS idx_flavor_wheels_user_id ON flavor_wheels(user_id);
CREATE INDEX IF NOT EXISTS idx_flavor_wheels_tasting_id ON flavor_wheels(tasting_id);

-- Create function to handle profile creation on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email)
    VALUES (new.id, new.raw_user_meta_data->>'name', new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tastings_updated_at BEFORE UPDATE ON tastings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasting_items_updated_at BEFORE UPDATE ON tasting_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mexican_beverages_updated_at BEFORE UPDATE ON mexican_beverages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_flavor_wheels_updated_at BEFORE UPDATE ON flavor_wheels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

