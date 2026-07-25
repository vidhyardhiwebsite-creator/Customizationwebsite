import { supabase } from '../lib/supabase'
import axios from 'axios'

export async function createRazorpayOrder(amount) {
  // In production, call your Supabase Edge Function
  // For demo, we simulate the order creation
  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID
  if (!razorpayKeyId) {
    throw new Error('Razorpay key not configured')
  }
  // This would normally be a server-side call
  return { id: `order_demo_${Date.now()}`, amount: amount * 100, currency: 'INR' }
}

export async function saveOrder({ userId, items, total, address, paymentId, orderId }) {
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      total_amount: total,
      payment_status: 'paid',
      address: JSON.stringify(address),
      razorpay_payment_id: paymentId,
      razorpay_order_id: orderId,
    })
    .select()
    .single()

  if (error) throw error

  const orderItems = items.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.products?.price || 0,
  }))

  await supabase.from('order_items').insert(orderItems)
  return order
}

export async function fetchUserOrders(userId) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, images))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function fetchAllOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name)), users(email)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}
