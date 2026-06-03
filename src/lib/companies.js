import { supabase } from "../supabase"

export async function listCompanies() {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data
}

export async function createCompany(payload) {
  const { data, error } = await supabase
    .from("companies").insert(payload).select().single()
  if (error) throw error
  return data
}

export async function createInvite(company_id, role = "employee") {
  const { data, error } = await supabase
    .from("company_invites").insert({ company_id, role }).select().single()
  if (error) throw error
  return data
}

export async function setCompanyStatus(id, status) {
  const { error } = await supabase.from("companies").update({ status }).eq("id", id)
  if (error) throw error
}

export async function redeemInvite(code) {
  const { data, error } = await supabase.rpc("redeem_invite", { p_code: code })
  if (error) throw error
  return data
}
