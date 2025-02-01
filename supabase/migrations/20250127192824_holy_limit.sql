/*
  # Booking System Schema

  1. New Tables
    - `instructors`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `bio` (text)
      - `created_at` (timestamp)
      
    - `availability`
      - `id` (uuid, primary key)
      - `instructor_id` (uuid, foreign key)
      - `day_of_week` (integer, 0-6)
      - `start_time` (time)
      - `end_time` (time)
      - `is_available` (boolean)
      
    - `bookings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `instructor_id` (uuid, foreign key)
      - `lesson_type` (text)
      - `start_time` (timestamp with time zone)
      - `duration` (integer, minutes)
      - `status` (text)
      - `total_price` (numeric)
      - `promo_code` (text, nullable)
      - `created_at` (timestamp)
      
    - `promo_codes`
      - `code` (text, primary key)
      - `discount_percentage` (integer)
      - `valid_from` (timestamp)
      - `valid_until` (timestamp)
      - `max_uses` (integer)
      - `times_used` (integer)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create instructors table
CREATE TABLE instructors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  bio text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors are viewable by everyone"
  ON instructors
  FOR SELECT
  TO authenticated
  USING (true);

-- Create availability table
CREATE TABLE availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id uuid REFERENCES instructors(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean DEFAULT true,
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Availability is viewable by everyone"
  ON availability
  FOR SELECT
  TO authenticated
  USING (true);

-- Create bookings table
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  instructor_id uuid REFERENCES instructors(id) ON DELETE CASCADE,
  lesson_type text NOT NULL CHECK (lesson_type IN ('dj', 'production')),
  start_time timestamptz NOT NULL,
  duration integer NOT NULL CHECK (duration > 0),
  status text NOT NULL CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  total_price numeric NOT NULL CHECK (total_price >= 0),
  promo_code text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT no_overlapping_bookings UNIQUE (instructor_id, start_time, duration)
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create promo codes table
CREATE TABLE promo_codes (
  code text PRIMARY KEY,
  discount_percentage integer NOT NULL CHECK (discount_percentage BETWEEN 0 AND 100),
  valid_from timestamptz NOT NULL,
  valid_until timestamptz NOT NULL,
  max_uses integer,
  times_used integer DEFAULT 0,
  CONSTRAINT valid_date_range CHECK (valid_from < valid_until)
);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Promo codes are viewable by everyone"
  ON promo_codes
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to check booking availability
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
  v_is_available boolean;
BEGIN
  -- Get day of week (0-6) and time from start_time
  v_day_of_week := EXTRACT(DOW FROM p_start_time);
  v_time := p_start_time::time;
  
  -- Check if instructor is available at this time
  SELECT EXISTS (
    SELECT 1
    FROM availability
    WHERE instructor_id = p_instructor_id
      AND day_of_week = v_day_of_week
      AND start_time <= v_time
      AND end_time >= v_time + (p_duration || ' minutes')::interval
      AND is_available = true
  ) INTO v_is_available;
  
  -- Check for conflicting bookings
  IF v_is_available THEN
    SELECT NOT EXISTS (
      SELECT 1
      FROM bookings
      WHERE instructor_id = p_instructor_id
        AND status NOT IN ('cancelled')
        AND (
          (start_time, duration) OVERLAPS 
          (p_start_time, p_duration)
        )
    ) INTO v_is_available;
  END IF;
  
  RETURN v_is_available;
END;
$$;