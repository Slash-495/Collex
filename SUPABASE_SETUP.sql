-- Supabase Setup SQL Commands
-- Run these in your Supabase SQL Editor to fix profile and listing issues

-- 1. Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS policy for profiles - users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Create RLS policy for profiles - users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- 4. Create RLS policy for profiles - users can view all profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
FOR SELECT USING (true);

-- 5. Enable RLS on listings table
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policy for listings - users can insert their own listings
CREATE POLICY "Users can insert their own listings" ON public.listings
FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- 7. Create RLS policy for listings - users can view all listings
CREATE POLICY "Users can view all listings" ON public.listings
FOR SELECT USING (true);

-- 8. Make sure the avatars bucket is public for profile images
-- Go to Storage > avatars > Settings and enable "Public bucket"

-- 9. Add location column to listings if not exists
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS location TEXT;

-- 10. Check if foreign key exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'listings_owner_id_fkey'
    ) THEN
        ALTER TABLE public.listings 
        ADD CONSTRAINT listings_owner_id_fkey 
        FOREIGN KEY (owner_id) REFERENCES public.profiles(id);
    END IF;
END $$;
