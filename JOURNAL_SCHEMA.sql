-- This is the SQL command to set up the 'journal_entries' table in your Supabase database.
-- Please copy the entire content of this file and run it in the SQL Editor on your Supabase project dashboard.

-- Step 1: Create the table for journal entries
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  title TEXT,
  content TEXT,
  mood INT,
  tags TEXT[],
  ai_insights JSONB,
  ai_summary TEXT,
  ai_actions JSONB
);

-- Step 2: Add comments for clarity
COMMENT ON COLUMN journal_entries.mood IS 'Mood rating on a 0-100 scale';
COMMENT ON COLUMN journal_entries.ai_insights IS 'Stores structured insights from the Gemini API';
COMMENT ON COLUMN journal_entries.ai_summary IS 'Stores the summary text from the Gemini API';
COMMENT ON COLUMN journal_entries.ai_actions IS 'Stores suggested actions from the Gemini API';

-- Step 3: Enable Row Level Security (RLS) to protect user data
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policies to ensure users can only access their own data
CREATE POLICY "Users can view their own journal entries"
ON journal_entries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own journal entries"
ON journal_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries"
ON journal_entries FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries"
ON journal_entries FOR DELETE
USING (auth.uid() = user_id);