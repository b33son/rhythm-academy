/*
  # Add new instructors

  1. New Instructors
    - Ethan Moore
    - Lily Martinez

  2. Changes
    - Add two new instructors with their availability schedules
    - Maintain same availability pattern (Mon-Sat, 9am-6pm)
*/

-- Insert new instructors
INSERT INTO instructors (name, email, bio)
VALUES 
  (
    'Ethan Moore',
    'ethan@rhythmacademy.com',
    'Veteran DJ with expertise in electronic music production and mixing techniques. Known for his innovative approach to teaching modern DJ techniques.'
  ),
  (
    'Lily Martinez',
    'lily@rhythmacademy.com',
    'Award-winning producer and DJ specializing in house music and live performance. Brings a fresh perspective to both production and DJing.'
  );

-- Set up availability for new instructors
DO $$
DECLARE
  v_ethan_id uuid;
  v_lily_id uuid;
BEGIN
  -- Get instructor IDs
  SELECT id INTO v_ethan_id FROM instructors WHERE email = 'ethan@rhythmacademy.com';
  SELECT id INTO v_lily_id FROM instructors WHERE email = 'lily@rhythmacademy.com';

  -- Insert availability for Ethan (Monday through Saturday)
  INSERT INTO availability (instructor_id, day_of_week, start_time, end_time)
  SELECT 
    v_ethan_id,
    day_number,
    '09:00'::time,
    '18:00'::time
  FROM unnest(ARRAY[1,2,3,4,5,6]) AS day_number
  ON CONFLICT (instructor_id, day_of_week) 
  DO UPDATE SET 
    start_time = EXCLUDED.start_time,
    end_time = EXCLUDED.end_time,
    is_available = true;

  -- Insert availability for Lily (Monday through Saturday)
  INSERT INTO availability (instructor_id, day_of_week, start_time, end_time)
  SELECT 
    v_lily_id,
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