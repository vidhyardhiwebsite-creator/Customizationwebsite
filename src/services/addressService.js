import { supabase } from "../lib/supabase"

export async function fetchAddresses(userId) {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false })
  if (error) throw error
  return data || []
}

export async function saveAddress(userId, addr) {
  // If setting as default, unset others first
  if (addr.is_default) {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId)
  }
  const { data, error } = await supabase
    .from("addresses")
    .insert({ ...addr, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateAddress(id, userId, updates) {
  if (updates.is_default) {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId)
  }
  const { data, error } = await supabase
    .from("addresses")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteAddress(id, userId) {
  const { error } = await supabase.from("addresses").delete().eq("id", id).eq("user_id", userId)
  if (error) throw error
}

export async function setDefaultAddress(id, userId) {
  await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId)
  await supabase.from("addresses").update({ is_default: true }).eq("id", id).eq("user_id", userId)
}
