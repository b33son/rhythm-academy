/*
  # Update instructor and availability

  1. Changes
    - Safely updates or inserts instructor data
    - Ensures availability records exist for Monday through Saturday
    - Uses proper conflict handling for availability records
*/

-- Insert or update instructor using ON CONFLICT
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

-- Set up availability for the instructor
DO $$
DECLARE
  v_instructor_id uuid;
BEGIN
  SELECT id INTO v_instructor_id FROM instructors WHERE email = 'john@rhythmacademy.com';

  -- Delete existing availability records for the instructor to avoid duplicates
  DELETE FROM availability WHERE instructor_id = v_instructor_id;

  -- Insert availability for Monday through Saturday
  INSERT INTO availability (instructor_id, day_of_week, start_time, end_time)
  SELECT 
    v_instructor_id,
    day_of_week,
    '09:00'::time AS start_time,
    '18:00'::time AS end_time
  FROM unnest(ARRAY[1,2,3,4,5,6]) AS day_of_week;
END $$;