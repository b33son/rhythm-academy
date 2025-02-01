/*
  # Fix instructor access policies

  1. Changes
    - Drops existing policies if they exist
    - Creates new policies for public read access
    - Ensures instructor data exists
    - Verifies availability records

  2. Security
    - Adds proper RLS policies for public read access
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to instructors" ON instructors;
DROP POLICY IF EXISTS "Allow public read access to availability" ON availability;

-- Create new policies
CREATE POLICY "Allow public read access to instructors"
  ON instructors
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to availability"
  ON availability
  FOR SELECT
  USING (true);

-- First, ensure the instructor exists with the correct data
INSERT INTO instructors (name, email, bio)
VALUES (
  'John Smith',
  'john@rhythmacademy.com',
  'Professional DJ and music producer with over 10 years of experience teaching both DJ skills and music production.'
)
ON CONFLICT (email) 
DO UPDATE SET
  name = EXCLUDED.name,
  bio = EXCLUDED.bio;

-- Verify availability records exist
DO $$
DECLARE
  v_instructor_id uuid;
BEGIN
  SELECT id INTO v_instructor_id 
  FROM instructors 
  WHERE email = 'john@rhythmacademy.com';

  -- Insert availability for Monday through Saturday if not exists
  INSERT INTO availability (instructor_id, day_of_week, start_time, end_time)
  SELECT 
    v_instructor_id,
    day_number,
    '09:00'::time,
    '18:00'::time
  FROM unnest(ARRAY[1,2,3,4,5,6]) AS day_number
  ON CONFLICT (instructor_id, day_of_week) 
  DO UPDATE SET 
    start_time = EXCLUDED.start_time,
    end_time = EXCLUDED.end_time,
    is_available = true;
END $$;