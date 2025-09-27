# SQL Schema for Journal Entries

Run the following SQL query in the **SQL Editor** of your Supabase project dashboard to create the `journal_entries` table and configure its access policies.

```sql
-- Create a table for journal entries
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

-- Add comments for clarity
COMMENT ON COLUMN journal_entries.mood IS 'Mood rating on a 0-100 scale';
COMMENT ON COLUMN journal_entries.ai_insights IS 'Stores structured insights from the Gemini API';
COMMENT ON COLUMN journal_entries.ai_summary IS 'Stores the summary text from the Gemini API';
COMMENT ON COLUMN journal_entries.ai_actions IS 'Stores suggested actions from the Gemini API';

-- Enable Row Level Security (RLS)
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Create policies to ensure users can only access their own data
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
```

### Instructions:

1.  Navigate to your Supabase project dashboard.
2.  In the left sidebar, click on the **SQL Editor** icon.
3.  Click **New query**.
4.  Copy the entire SQL script from this file and paste it into the query editor.
5.  Click **Run**.

Once you have successfully run this query, I will proceed with modifying the `Journal.jsx` component to use this table. Let me know when you're ready.