import { createClient } from '@supabase/supabase-js';
import { env } from '$shared/config';
import type { Database } from  '$shared/types'

export const supabase = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY);
