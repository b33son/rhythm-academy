/*
  # Add promo code increment function

  1. New Function
    - Add function to safely increment promo code usage count
    - Includes validation of promo code existence and usage limits
*/

CREATE OR REPLACE FUNCTION increment_promo_code_usage(p_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE promo_codes
  SET times_used = times_used + 1
  WHERE code = p_code
    AND (max_uses IS NULL OR times_used < max_uses)
    AND NOW() BETWEEN valid_from AND valid_until;
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired promo code';
  END IF;
END;
$$;