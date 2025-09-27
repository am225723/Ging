# Connecting to a Supabase Backend

This guide outlines the necessary steps to connect this application to a [Supabase](https://supabase.com) backend for data persistence.

## 1. Set Up Your Supabase Project

Before you can connect the app, you need a Supabase project.

1.  **Create a Supabase Account:** If you don't have one, sign up at [supabase.com](https://supabase.com).
2.  **Create a New Project:** From your Supabase dashboard, create a new project. Give it a name and generate a secure database password (save this password somewhere safe).
3.  **Get Your API Keys:** Once your project is created, navigate to **Project Settings** > **API**. You will need two values from this page:
    *   **Project URL**
    *   **Project API Keys > `anon` `public` key**

## 2. Set Up Environment Variables

To keep your credentials secure, you should use environment variables.

1.  **Create a `.env` file:** In the root of the project, create a file named `.env`.
2.  **Copy the contents** of `.env.example` into your new `.env` file.
3.  **Add your credentials:** Fill in the values for `VITE_SUPABASE_PROJECT_URL` and `VITE_SUPABASE_ANON_KEY` with the keys you got from your Supabase dashboard.

Your `.env` file should look like this:
```
VITE_GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
VITE_SUPABASE_PROJECT_URL="YOUR_SUPABASE_PROJECT_URL_HERE"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY_HERE"
```
**Note:** The `.gitignore` file is configured to ignore `.env` files, so your credentials will not be committed to version control.

## 3. Install the Supabase Client Library

You need to add the official Supabase JavaScript library to the project's dependencies.

Open your terminal and run the following command in the project's root directory:

```bash
npm install @supabase/supabase-js
```

## 4. Create a Supabase Client

To interact with Supabase, you need to initialize a client. It's best to create a central file for this.

1.  **Create a new file:** `src/services/supabaseClient.js`
2.  **Add the following code to the file:**

    ```javascript
    import { createClient } from '@supabase/supabase-js';

    // Get Supabase credentials from environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_PROJECT_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase URL and anon key are not set in your environment variables. Please add them to your .env file.");
    }

    export const supabase = createClient(supabaseUrl, supabaseAnonKey);
    ```

## 5. Define Your Database Schema

You need to create tables in your Supabase database to store the application's data. You can do this using the **Table Editor** in your Supabase project dashboard or by running SQL queries in the **SQL Editor**.

Here is a sample SQL schema for the **Journal** feature. You can adapt this for other features like the Exposure Ladder.

```sql
-- Create a table for journal entries
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  title TEXT,
  content TEXT,
  mood INT,
  tags TEXT[]
);

-- Enable Row Level Security (RLS)
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Create policies to control access
CREATE POLICY "Users can view their own journal entries" ON journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own journal entries" ON journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own journal entries" ON journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own journal entries" ON journal_entries FOR DELETE USING (auth.uid() = user_id);
```

This schema includes **Row Level Security (RLS)**, which is crucial for ensuring users can only access their own data.

## 6. Using the Supabase Client in Your Application

Once the client is set up and the tables are created, you can import and use it in your components to perform database operations.

Here's an example of how you might modify the `Journal.jsx` page:

```javascript
// src/pages/Journal.jsx (simplified example)
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext'; // Assuming an Auth context

const Journal = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const fetchEntries = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('journal_entries')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) console.error('Error fetching entries:', error);
        else setEntries(data);
      }
    };
    fetchEntries();
  }, [user]);

  // ... rest of component
};
```

## Next Steps

I have now corrected the security issue and updated the documentation.

**To proceed with the implementation, please provide your Supabase Project URL and `anon` key.** You can create a `.env` file in the root of this project and place them there, following the `.env.example` format. Once you've done that, let me know, and I will begin the implementation.