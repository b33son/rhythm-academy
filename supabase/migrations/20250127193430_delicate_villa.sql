/*
  # Add instructor data

  1. New Data
    - Insert default instructor data for John Smith
    - Set up weekly availability schedule
*/

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
    day_of_week,
    '09:00'::time AS start_time,
    '18:00'::time AS end_time
  FROM unnest(ARRAY[1,2,3,4,5,6]) AS day_of_week
  ON CONFLICT DO NOTHING;
END $$;