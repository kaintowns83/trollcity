import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://piyzvrgtspdxhtxcbiwi.supabase.co";
const supabaseKey = sb_publishable_alWM4_ElwByRkhGmbu0OrQ_wOGy5Fyo;
export const supabase = createClient(supabaseUrl, supabaseKey);

// Sign up
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

// Log in
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// Log out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
