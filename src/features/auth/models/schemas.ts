import { z } from 'zod';
import type { 
  AuthError, 
  Session, 
  User,
  AuthResponse,
  AuthTokenResponsePassword,
  OAuthResponse 
} from '@supabase/supabase-js';
// ============ Zod Schemas ============
export const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
export const signupSchema = z.object({
  firstname: z.string().min(1, 'First name is required'),
  lastname: z.string().min(1, 'Last name is required'),
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
// ============ Inferred Types ============
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
// ============ External Types ============
export type AuthProvider = 'google' | 'github';
export type SignInResult = AuthTokenResponsePassword;
export type SignUpResult = AuthResponse;
export type OAuthResult = OAuthResponse;
export type SignOutResult = { error: AuthError | null };
export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}
