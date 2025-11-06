import { supabase } from "./supabaseClient.js";

async function testConnection() {
  console.log("🧠 Testing Supabase connection...");

  const { data, error } = await supabase.from("users").select("*").limit(1);

  if (error) {
    console.error("❌ Supabase connection failed:", error.message);
  } else {
    console.log("✅ Supabase connection successful!");
    console.log("Sample data:", data);
  }
}

testConnection();
