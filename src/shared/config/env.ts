import { z } from 'zod';
import { 
  PUBLIC_SUPABASE_URL, 
  PUBLIC_SUPABASE_PUBLISHABLE_KEY 
} from '$env/static/public';
const envSchema = z.object({
  SUPABASE_URL: z.url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});
export const env = envSchema.parse({
  SUPABASE_URL: PUBLIC_SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY: PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});
