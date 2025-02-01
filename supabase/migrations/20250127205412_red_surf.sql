/*
  # Fix booking availability check

  1. Changes
    - Simplify time zone handling
    - Fix time comparison logic
    - Add better error messages
    - Fix lesson type validation
*/

-- Drop and recreate the function with fixed logic
CREATE OR REPLACE FUNCTION check_booking_availability(
  p_instructor_id uuid,
  p_start_time timestamptz,
  p_duration integer
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  v_day_of_week integer;
  v_start_time time;
  v_end_time time;
  v_is_available boolean;
  v_availability_record RECORD;
BEGIN
  -- Get day of week and times
  v_day_of_week := EXTRACT(DOW FROM p_start_time);
  v_start_time := p_start_time::time;
  v_end_time := (p_start_time + (p_duration || ' minutes')::interval)::time;

  -- Get instructor's availability for this day
  SELECT *
  INTO v_availability_record
  FROM availability
  WHERE instructor_id = p_instructor_id
    AND day_of_week = v_day_of_week
    AND is_available = true;

  -- Check if instructor is available on this day
  IF NOT FOUND THEN
    RAISE NOTICE 'Instructor % is not available on day %', p_instructor_id, v_day_of_week;
    RETURN false;
  END IF;

  -- Check if requested time is within instructor's available hours
  IF v_start_time < v_availability_record.start_time OR v_end_time > v_availability_record.end_time THEN
    RAISE NOTICE 'Requested time % - % is outside instructor''s available hours % - %',
      v_start_time, v_end_time, v_availability_record.start_time, v_availability_record.end_time;
    RETURN false;
  END IF;

  -- Check for conflicting bookings
  SELECT NOT EXISTS (
    SELECT 1
    FROM bookings b
    WHERE b.instructor_id = p_instructor_id
      AND b.status NOT IN ('cancelled')
      AND (
        tstzrange(b.start_time, b.start_time + (b.duration || ' minutes')::interval) &&
        tstzrange(p_start_time, p_start_time + (p_duration || ' minutes')::interval)
      )
  ) INTO v_is_available;

  IF NOT v_is_available THEN
    RAISE NOTICE 'Found conflicting booking for instructor % at %', p_instructor_id, p_start_time;
  END IF;

  RETURN v_is_available;
END;
$$;

-- Ensure lesson type is properly validated
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_lesson_type_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_lesson_type_check 
  CHECK (lesson_type IN ('dj', 'production'));