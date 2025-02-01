/*
  # Add Mike B33SON instructor

  1. Changes
    - Add Mike B33SON as a new instructor with custom image
    - Set up availability schedule
*/

-- Insert Mike B33SON as a new instructor
INSERT INTO instructors (name, email, bio, image_url)
VALUES (
  'Mike B33SON',
  'mike@rhythmacademy.com',
  'Renowned DJ and producer specializing in electronic music. Known for innovative mixing techniques and deep understanding of music theory.',
  'https://images.unsplash.com/photo-1738091506184-8ee5b4da9df5?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
)
ON CONFLICT (email) 
DO UPDATE SET
  name = EXCLUDED.name,
  bio = EXCLUDED.bio,
  image_url = EXCLUDED.image_url;

-- Set up availability for Mike B33SON
DO $$
DECLARE
  v_instructor_id uuid;
BEGIN
  SELECT id INTO v_instructor_id 
  FROM instructors 
  WHERE email = 'mike@rhythmacademy.com';

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