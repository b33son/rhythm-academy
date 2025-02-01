/*
  # Fix lesson type constraint

  1. Changes
    - Update the lesson type check constraint to match application values
    - Add proper type validation
*/

-- Drop the existing constraint
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS bookings_lesson_type_check;

-- Add the updated constraint
ALTER TABLE bookings 
ADD CONSTRAINT bookings_lesson_type_check 
CHECK (lesson_type IN ('dj', 'production'));