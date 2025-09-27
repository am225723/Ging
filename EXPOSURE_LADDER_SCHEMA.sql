-- This is the SQL command to set up the 'exposure_ladders' table in your Supabase database.
-- Please copy the entire content of this file and run it in the SQL Editor on your Supabase project dashboard.

-- Step 1: Create the table for exposure ladders
CREATE TABLE exposure_ladders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  fear_title TEXT NOT NULL,
  goal TEXT,
  constraints TEXT,
  steps JSONB, -- Storing the array of ladder steps as a JSON object
  ai_notes TEXT,
  safety_note TEXT
);

-- Step 2: Add comments for clarity
COMMENT ON COLUMN exposure_ladders.steps IS 'The array of ladder steps, including title, description, anxiety level, completion status, etc.';

-- Step 3: Enable Row Level Security (RLS) to protect user data
ALTER TABLE exposure_ladders ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policies to ensure users can only access their own data
CREATE POLICY "Users can view their own exposure ladders"
ON exposure_ladders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exposure ladders"
ON exposure_ladders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exposure ladders"
ON exposure_ladders FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exposure ladders"
ON exposure_ladders FOR DELETE
USING (auth.uid() = user_id);