/*
  # Fix instructor and availability setup

  1. Changes
    - Ensure instructor exists with proper data
    - Create unique constraint for availability
    - Set up availability for Monday through Saturday
*/

-- First, ensure the instructor exists
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

-- Create a unique constraint for availability
ALTER TABLE availability 
ADD CONSTRAINT availability_instructor_day_unique 
UNIQUE (instructor_id, day_of_week);

-- Set up availability for the instructor
DO $$
DECLARE
  v_instructor_id uuid;
BEGIN
  SELECT id INTO v_instructor_id 
  FROM instructors 
  WHERE email = 'john@rhythmacademy.com';

  -- Insert availability for Monday through Saturday
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