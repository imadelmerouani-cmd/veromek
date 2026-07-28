import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://pggeqhbbsdmgssccnoqj.supabase.co";

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZ2VxaGJic2RtZ3NzY2Nub3FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4NjY1NjYsImV4cCI6MjEwMDQ0MjU2Nn0.ttPCbdOkcshBw0jwexGawlkwLdYDq0fczTJ_-5rV3aw";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase configuration is missing."
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);