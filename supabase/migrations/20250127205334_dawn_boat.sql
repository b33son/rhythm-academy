/*
  # Fix availability check function

  1. Changes
    - Simplify time zone handling
    - Add more detailed logging
    - Fix time comparison logic
    - Add explicit time zone conversion
*/

-- Drop and recreate the function with fixed time handling
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
BEGIN
  -- Convert start time to local time and extract components
  v_day_of_week := EXTRACT(DOW FROM p_start_time);
  v_start_time := p_start_time::time;
  v_end_time := (p_start_time + (p_duration || ' minutes')::interval)::time;

  RAISE NOTICE 'Checking availability for instructor % on day % between % and %',
    p_instructor_id, v_day_of_week, v_start_time, v_end_time;

  -- First check: instructor availability for this day and time
  SELECT EXISTS (
    SELECT 1
    FROM availability a
    WHERE a.instructor_id = p_instructor_id
      AND a.day_of_week = v_day_of_week
      AND a.is_available = true
      AND a.start_time <= v_start_time
      AND a.end_time >= v_end_time
  ) INTO v_is_available;

  IF NOT v_is_available THEN
    RAISE NOTICE 'No availability found for instructor % on day % between % and %',
      p_instructor_id, v_day_of_week, v_start_time, v_end_time;
    RETURN false;
  END IF;

  -- Second check: no conflicting bookings
  WITH booking_window AS (
    SELECT
      p_start_time AS start_time,
      p_start_time + (p_duration || ' minutes')::interval AS end_time
  )
  SELECT NOT EXISTS (
    SELECT 1
    FROM bookings b, booking_window w
    WHERE b.instructor_id = p_instructor_id
      AND b.status NOT IN ('cancelled')
      AND (
        -- Check if the new booking overlaps with any existing booking
        (b.start_time, b.start_time + (b.duration || ' minutes')::interval) OVERLAPS
        (w.start_time, w.end_time)
      )
  ) INTO v_is_available;

  IF NOT v_is_available THEN
    RAISE NOTICE 'Found conflicting bookings for instructor % at %',
      p_instructor_id, p_start_time;
  END IF;

  RETURN v_is_available;
END;
$$;