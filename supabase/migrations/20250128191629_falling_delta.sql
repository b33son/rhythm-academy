/*
  # Add instructor images

  1. Changes
    - Add image_url column to instructors table
    - Update existing instructors with professional images
*/

-- Add image_url column to instructors table
ALTER TABLE instructors
ADD COLUMN IF NOT EXISTS image_url text;

-- Update existing instructors with images
UPDATE instructors
SET image_url = CASE
  WHEN email = 'john@rhythmacademy.com' THEN 'https://images.unsplash.com/photo-1559386484-97dfc0e15539?q=80&w=1974'
  WHEN email = 'ethan@rhythmacademy.com' THEN 'https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?q=80&w=1976'
  WHEN email = 'lily@rhythmacademy.com' THEN 'https://images.unsplash.com/photo-1605722243979-fe0be8158232?q=80&w=1970'
  ELSE NULL
END
WHERE email IN ('john@rhythmacademy.com', 'ethan@rhythmacademy.com', 'lily@rhythmacademy.com');