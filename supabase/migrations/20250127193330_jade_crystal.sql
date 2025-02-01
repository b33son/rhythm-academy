/*
  # Add default instructor and availability

  1. New Data
    - Add default instructor
    - Add default availability for weekdays
*/

-- Insert default instructor
INSERT INTO instructors (name, email, bio)
VALUES (
  'John Smith',
  'john@rhythmacademy.com',
  'Professional DJ and music producer with over 10 years of experience teaching both DJ skills and music production.'
);

-- Get the instructor's ID
DO $$
DECLARE
  v_instructor_id uuid;
BEGIN
  SELECT id INTO v_instructor_id FROM instructors WHERE email = 'john@rhythmacademy.com';

  -- Insert availability for Monday through Saturday (0 = Sunday, 1 = Monday, etc.)
  INSERT INTO availability (instructor_id, day_of_week, start_time, end_time)
  SELECT 
    v_instructor_id,
    day_of_week,
    '09:00'::time AS start_time,
    '18:00'::time AS end_time
  FROM unnest(ARRAY[1,2,3,4,5,6]) AS day_of_week;
END $$;