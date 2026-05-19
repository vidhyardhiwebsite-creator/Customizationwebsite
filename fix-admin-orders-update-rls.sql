-- Fix: Admin order status update via SECURITY DEFINER function
-- This bypasses RLS entirely for admin updates
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)

-- Create a function that updates order_status, bypassing RLS
CREATE OR REPLACE FUNCTION admin_update_order_status(
  p_order_id uuid,
  p_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE orders
  SET order_status = p_status
  WHERE id = p_order_id;
END;
$$;

-- Grant execute to authenticated users (the app will call this)
GRANT EXECUTE ON FUNCTION admin_update_order_status(uuid, text) TO authenticated;

-- Also create one for payment verification
CREATE OR REPLACE FUNCTION admin_verify_payment(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE orders
  SET payment_status = 'paid',
      payment_verified = true,
      order_status = 'confirmed'
  WHERE id = p_order_id;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_verify_payment(uuid) TO authenticated;

-- And one for rejecting payment
CREATE OR REPLACE FUNCTION admin_reject_payment(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE orders
  SET payment_status = 'failed',
      order_status = 'cancelled'
  WHERE id = p_order_id;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_reject_payment(uuid) TO authenticated;
