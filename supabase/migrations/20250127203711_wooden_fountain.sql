/*
  # Add Social Authentication Support

  1. Changes
    - Enable Google, Facebook, and GitHub OAuth providers
    - Add provider-specific user fields
    - Add policies for social auth users

  2. Security
    - Enable RLS for new tables
    - Add policies for authenticated users
*/

-- Add provider-specific fields to auth.users
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS raw_app_meta_data jsonb;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS raw_user_meta_data jsonb;

-- Create table for storing OAuth provider details
CREATE TABLE IF NOT EXISTS auth.identities (
  id uuid NOT NULL,
  user_id uuid NOT NULL,
  identity_data jsonb NOT NULL,
  provider text NOT NULL,
  last_sign_in_at timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  CONSTRAINT identities_pkey PRIMARY KEY (provider, id),
  CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS identities_user_id_idx ON auth.identities(user_id);

-- Enable row level security
ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own identity data
CREATE POLICY "Users can read own identity data"
  ON auth.identities
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create policy for Supabase to manage identity data
CREATE POLICY "Service role manage all identities"
  ON auth.identities
  TO service_role
  USING (true)
  WITH CHECK (true);