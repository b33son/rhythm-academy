/*
  # Fix booking availability check with proper time zone handling

  1. Changes
    - Fix time zone handling in availability check
    - Add better time comparison logic
    - Add debug logging
*/

-- Drop and recreate the availability check function with fixed time zone handling
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
  v_debug_info jsonb;
BEGIN
  -- Calculate end time
  v_end_time := p_start_time + (p_duration || ' minutes')::interval;
  
  -- Get day of week (0-6) and time
  v_day_of_week := EXTRACT(DOW FROM p_start_time);
  v_time := p_start_time::time;
  
  -- Store debug info
  v_debug_info := jsonb_build_object(
    'input', jsonb_build_object(
      'instructor_id', p_instructor_id,
      'start_time', p_start_time,
      'duration', p_duration,
      'day_of_week', v_day_of_week,
      'time', v_time,
      'end_time', v_end_time
    )
  );
  
  -- Check if instructor is available at this time
  WITH availability_check AS (
    SELECT EXISTS (
      SELECT 1
      FROM availability
      WHERE instructor_id = p_instructor_id
        AND day_of_week = v_day_of_week
        AND start_time <= v_time
        AND end_time >= v_end_time::time
        AND is_available = true
    ) AS is_available,
    (SELECT jsonb_agg(to_jsonb(a.*))
     FROM availability a
     WHERE a.instructor_id = p_instructor_id
       AND a.day_of_week = v_day_of_week
    ) AS found_availability
  )
  SELECT is_available INTO v_is_available
  FROM availability_check;
  
  -- Store availability check results
  v_debug_info := v_debug_info || jsonb_build_object(
    'availability_check', jsonb_build_object(
      'result', v_is_available,
      'found_availability', (
        SELECT found_availability 
        FROM availability_check
      )
    )
  );
  
  -- If not available in schedule, log and return false
  IF NOT v_is_available THEN
    RAISE NOTICE 'Availability check failed: %', v_debug_info;
    RETURN false;
  END IF;
  
  -- Check for conflicting bookings
  WITH booking_check AS (
    SELECT NOT EXISTS (
      SELECT 1
      FROM bookings b
      WHERE b.instructor_id = p_instructor_id
        AND b.status NOT IN ('cancelled')
        AND (
          -- New booking overlaps with existing booking
          (p_start_time, v_end_time) OVERLAPS 
          (b.start_time, b.start_time + (b.duration || ' minutes')::interval)
        )
    ) AS no_conflicts,
    (SELECT jsonb_agg(to_jsonb(b.*))
     FROM bookings b
     WHERE b.instructor_id = p_instructor_id
       AND b.status NOT IN ('cancelled')
       AND (
         (p_start_time, v_end_time) OVERLAPS 
         (b.start_time, b.start_time + (b.duration || ' minutes')::interval)
       )
    ) AS conflicting_bookings
  )
  SELECT no_conflicts INTO v_is_available
  FROM booking_check;
  
  -- Store booking check results
  v_debug_info := v_debug_info || jsonb_build_object(
    'booking_check', jsonb_build_object(
      'result', v_is_available,
      'conflicting_bookings', (
        SELECT conflicting_bookings 
        FROM booking_check
      )
    )
  );
  
  -- Log final result
  RAISE NOTICE 'Booking availability check complete: %', v_debug_info;
  
  RETURN v_is_available;
END;
$$;