/*
  # Initial Schema Setup

  1. New Tables
    - `instructors`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `bio` (text)
      - `created_at` (timestamp)
    - `availability`
      - `id` (uuid, primary key)
      - `instructor_id` (uuid, foreign key)
      - `day_of_week` (integer)
      - `start_time` (time)
      - `end_time` (time)
      - `is_available` (boolean)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
*/

-- Create instructors table if it doesn't exist
CREATE TABLE IF NOT EXISTS instructors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  bio text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS and create policy only if it doesn't exist
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'instructors'
      AND policyname = 'Allow public read access to instructors'
  ) THEN
    CREATE POLICY "Allow public read access to instructors"
      ON instructors
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- Create availability table if it doesn't exist
CREATE TABLE IF NOT EXISTS availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id uuid REFERENCES instructors(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean DEFAULT true,
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Enable RLS and create policy only if it doesn't exist
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'availability'
      AND policyname = 'Allow public read access to availability'
  ) THEN
    CREATE POLICY "Allow public read access to availability"
      ON availability
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- Insert default instructor if not exists
INSERT INTO instructors (name, email, bio)
VALUES (
  'John Smith',
  'john@rhythmacademy.com',
  'Professional DJ and music producer with over 10 years of experience teaching both DJ skills and music production.'
)
ON CONFLICT (email) DO NOTHING;

-- Set up availability for the instructor
DO $$
DECLARE
  v_instructor_id uuid;
BEGIN
  SELECT id INTO v_instructor_id FROM instructors WHERE email = 'john@rhythmacademy.com';

  -- Insert availability for Monday through Saturday if not exists
  INSERT INTO availability (instructor_id, day_of_week, start_time, end_time)
  SELECT 
    v_instructor_id,
    day_number,
    '09:00'::time,
    '18:00'::time
  FROM unnest(ARRAY[1,2,3,4,5,6]) AS day_number
  ON CONFLICT DO NOTHING;
END $$;