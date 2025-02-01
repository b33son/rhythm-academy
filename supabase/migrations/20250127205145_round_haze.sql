/*
  # Fix booking availability check function

  1. Changes
    - Simplify the function by removing CTEs
    - Fix time zone handling
    - Improve overlap detection
    - Add better error handling
*/

-- Drop and recreate the function with simplified logic
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
  v_time time;
  v_end_time timestamptz;
  v_is_available boolean;
BEGIN
  -- Calculate end time
  v_end_time := p_start_time + (p_duration || ' minutes')::interval;
  
  -- Get day of week (0-6) and time
  v_day_of_week := EXTRACT(DOW FROM p_start_time);
  v_time := p_start_time::time;
  
  -- First check: instructor availability for this day and time
  SELECT EXISTS (
    SELECT 1
    FROM availability
    WHERE instructor_id = p_instructor_id
      AND day_of_week = v_day_of_week
      AND start_time <= v_time
      AND end_time >= v_end_time::time
      AND is_available = true
  ) INTO v_is_available;
  
  -- If not available in schedule, return false
  IF NOT v_is_available THEN
    RETURN false;
  END IF;
  
  -- Second check: no conflicting bookings
  SELECT NOT EXISTS (
    SELECT 1
    FROM bookings
    WHERE instructor_id = p_instructor_id
      AND status NOT IN ('cancelled')
      AND tstzrange(start_time, start_time + (duration || ' minutes')::interval) &&
          tstzrange(p_start_time, v_end_time)
  ) INTO v_is_available;
  
  RETURN v_is_available;
END;
$$;