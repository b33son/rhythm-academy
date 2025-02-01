/*
  # Fix lesson type validation and add debugging

  1. Changes
    - Re-create lesson type constraint with explicit case handling
    - Add trigger for detailed error logging
    - Add function to validate lesson types
*/

-- Drop existing constraint
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS bookings_lesson_type_check;

-- Create a function to validate lesson type
CREATE OR REPLACE FUNCTION validate_lesson_type()
RETURNS trigger AS $$
BEGIN
  -- Log the incoming lesson type for debugging
  RAISE NOTICE 'Validating lesson type: %', NEW.lesson_type;
  
  -- Convert to lowercase for case-insensitive comparison
  NEW.lesson_type = LOWER(NEW.lesson_type);
  
  -- Validate the lesson type
  IF NEW.lesson_type NOT IN ('dj', 'production') THEN
    RAISE EXCEPTION 'Invalid lesson type: %. Must be either ''dj'' or ''production''', NEW.lesson_type;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for lesson type validation
DROP TRIGGER IF EXISTS validate_lesson_type_trigger ON bookings;
CREATE TRIGGER validate_lesson_type_trigger
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION validate_lesson_type();

-- Add the constraint back
ALTER TABLE bookings 
ADD CONSTRAINT bookings_lesson_type_check 
CHECK (lesson_type = ANY (ARRAY['dj', 'production']));