-- Admin Notes Table
-- This table stores messages from the administrator (Warden Aleix) that are displayed to all users

CREATE TABLE IF NOT EXISTS admin_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add RLS policies
ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read active admin notes
CREATE POLICY "Users can view active admin notes"
  ON admin_notes
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policy: Only admins can insert admin notes
CREATE POLICY "Admins can insert admin notes"
  ON admin_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Only admins can update admin notes
CREATE POLICY "Admins can update admin notes"
  ON admin_notes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Only admins can delete admin notes
CREATE POLICY "Admins can delete admin notes"
  ON admin_notes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create index for faster queries
CREATE INDEX idx_admin_notes_active ON admin_notes(is_active, created_at DESC);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admin_notes_updated_at
  BEFORE UPDATE ON admin_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_notes_updated_at();