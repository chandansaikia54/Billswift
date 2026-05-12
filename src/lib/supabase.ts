import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ovzzqojbkpgvwxqsuczh.supabase.co";

const supabaseKey = "sb_publishable_CQpJgoG7taHrH1G_-0lvGw_GF4z1q5w";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);