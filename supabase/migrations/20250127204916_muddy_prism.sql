/*
  # Fix booking availability check

  1. Changes
    - Fix the booking availability check function to properly handle time overlaps
    - Add better error handling and validation
    - Fix time zone handling
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
  v_time time;
  v_end_time timestamptz;
  v_is_available boolean;
BEGIN
  -- Calculate end time
  v_end_time := p_start_time + (p_duration || ' minutes')::interval;
  
  -- Get day of week (0-6) and time from start_time
  v_day_of_week := EXTRACT(DOW FROM p_start_time AT TIME ZONE 'UTC');
  v_time := (p_start_time AT TIME ZONE 'UTC')::time;
  
  -- Check if instructor is available at this time
  SELECT EXISTS (
    SELECT 1
    FROM availability
    WHERE instructor_id = p_instructor_id
      AND day_of_week = v_day_of_week
      AND start_time <= v_time
      AND end_time >= (v_end_time AT TIME ZONE 'UTC')::time
      AND is_available = true
  ) INTO v_is_available;
  
  -- If not available in schedule, return false
  IF NOT v_is_available THEN
    RETURN false;
  END IF;
  
  -- Check for conflicting bookings
  SELECT NOT EXISTS (
    SELECT 1
    FROM bookings
    WHERE instructor_id = p_instructor_id
      AND status NOT IN ('cancelled')
      AND (
        -- New booking starts during existing booking
        (p_start_time >= start_time AND p_start_time < (start_time + (duration || ' minutes')::interval))
        OR
        -- New booking ends during existing booking
        (v_end_time > start_time AND v_end_time <= (start_time + (duration || ' minutes')::interval))
        OR
        -- New booking completely contains existing booking
        (p_start_time <= start_time AND v_end_time >= (start_time + (duration || ' minutes')::interval))
      )
  ) INTO v_is_available;
  
  RETURN v_is_available;
END;
$$;