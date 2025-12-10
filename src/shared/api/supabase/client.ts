import { createClient } from '@supabase/supabase-js';
import { env } from '$shared/config';

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY);
