import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ublelxdzwhgpblnfqlic.supabase.co";
const supabaseKey = "sb_publishable_iS0SqaOb5zplTSb4HrpYDQ_Xu2mjCPc";
export const supabase = createClient(supabaseUrl, supabaseKey);
