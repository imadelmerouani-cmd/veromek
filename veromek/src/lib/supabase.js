import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  "https://pggeqhbbsdmgssccnoqj.supabase.co";

const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZ2VxaGJic2RtZ3NzY2Nub3FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4NjY1NjYsImV4cCI6MjEwMDQ0MjU2Nn0.ttPCbdOkcshBw0jwexGawlkwLdYDq0fczTJ_-5rV3aw";

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