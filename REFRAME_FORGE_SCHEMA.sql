-- This is the SQL command to set up the 'reframes' table in your Supabase database.
-- Please copy the entire content of this file and run it in the SQL Editor on your Supabase project dashboard.

-- Step 1: Create the table for reframe exercises
CREATE TABLE reframes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  negative_thought TEXT NOT NULL,
  context TEXT,
  cognitive_distortions TEXT[],
  reframed_thought TEXT,
  ai_analysis JSONB -- Storing the full analysis from Gemini, including evidence for/against, etc.
);

-- Step 2: Add comments for clarity
COMMENT ON COLUMN reframes.cognitive_distortions IS 'An array of cognitive distortion names identified by the user or AI.';
COMMENT ON COLUMN reframes.ai_analysis IS 'The full JSON response from the AI, including evidence, tiny actions, and safety notes.';

-- Step 3: Enable Row Level Security (RLS)
ALTER TABLE reframes ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policies to ensure users can only access their own data
CREATE POLICY "Users can view their own reframes"
ON reframes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reframes"
ON reframes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reframes"
ON reframes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reframes"
ON reframes FOR DELETE
USING (auth.uid() = user_id);