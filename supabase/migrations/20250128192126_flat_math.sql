/*
  # Update instructor records

  1. Changes
    - Remove duplicate Mike B33SON record
    - Update Lily's image URL
*/

-- Delete the original Mike B33SON record (keeping only the most recent one)
DELETE FROM instructors
WHERE email = 'mike@rhythmacademy.com'
AND id NOT IN (
  SELECT id
  FROM instructors
  WHERE email = 'mike@rhythmacademy.com'
  ORDER BY created_at DESC
  LIMIT 1
);

-- Update Lily's image URL
UPDATE instructors
SET image_url = 'https://plus.unsplash.com/premium_photo-1681511753084-89f5565f06ce'
WHERE email = 'lily@rhythmacademy.com';