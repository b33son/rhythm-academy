/*
  # Fix booking availability check with improved time handling

  1. Changes
    - Simplify time zone handling
    - Add better logging for debugging
    - Fix availability check logic
    - Add function to debug availability issues
*/

-- Create a function to help debug availability issues
CREATE OR REPLACE FUNCTION debug_booking_availability(
  p_instructor_id uuid,
  p_start_time timestamptz,
  p_duration integer
)
RETURNS TABLE (
  check_type text,
  is_available boolean,
  details jsonb
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_day_of_week integer;
  v_time time;
  v_end_time timestamptz;
BEGIN
  -- Calculate end time
  v_end_time := p_start_time + (p_duration || ' minutes')::interval;
  v_day_of_week := EXTRACT(DOW FROM p_start_time);
  v_time := p_start_time::time;

  -- Check schedule availability
  RETURN QUERY
  SELECT 
    'schedule_check'::text,
    EXISTS (
      SELECT 1
      FROM availability
      WHERE instructor_id = p_instructor_id
        AND day_of_week = v_day_of_week
        AND start_time <= v_time
        AND end_time >= v_end_time::time
        AND is_available = true
    ),
    jsonb_build_object(
      'day_of_week', v_day_of_week,
      'start_time', v_time::text,
      'end_time', v_end_time::time::text
    );

  -- Check booking conflicts
  RETURN QUERY
  SELECT 
    'booking_conflicts'::text,
    NOT EXISTS (
      SELECT 1
      FROM bookings
      WHERE instructor_id = p_instructor_id
        AND status NOT IN ('cancelled')
        AND (
          (start_time, start_time + (duration || ' minutes')::interval) OVERLAPS
          (p_start_time, v_end_time)
        )
    ),
    jsonb_build_object(
      'conflicting_bookings', (
        SELECT jsonb_agg(jsonb_build_object(
          'booking_id', id,
          'start_time', start_time,
          'end_time', start_time + (duration || ' minutes')::interval
        ))
        FROM bookings
        WHERE instructor_id = p_instructor_id
          AND status NOT IN ('cancelled')
          AND (
            (start_time, start_time + (duration || ' minutes')::interval) OVERLAPS
            (p_start_time, v_end_time)
          )
      )
    );
END;
$$;

-- Drop and recreate the availability check function with simplified logic
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
  v_day_of_week := EXTRACT(DOW FROM p_start_time);
  v_time := p_start_time::time;
  
  -- Check if instructor is available at this time
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
  
  -- Check for conflicting bookings using OVERLAPS
  SELECT NOT EXISTS (
    SELECT 1
    FROM bookings
    WHERE instructor_id = p_instructor_id
      AND status NOT IN ('cancelled')
      AND (
        (start_time, start_time + (duration || ' minutes')::interval) OVERLAPS
        (p_start_time, v_end_time)
      )
  ) INTO v_is_available;
  
  RETURN v_is_available;
END;
$$;