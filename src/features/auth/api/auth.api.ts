import { supabase } from '$shared/api/supabase';
import type { 
  AuthProvider, 
  SignInResult, 
  SignUpResult, 
  OAuthResult, 
  SignOutResult 
} from '../models/types';

export async function signInWithEmail(
  email: string, 
  password: string
): Promise<SignInResult> {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(
  email: string,
  password: string,
  metadata?: { firstName?: string; lastName?: string }
): Promise<SignUpResult> {
  return supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  });
}

export async function signInWithOAuth(provider: AuthProvider): Promise<OAuthResult> {
  return supabase.auth.signInWithOAuth({ 
    provider, 
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

export async function signOut(): Promise<SignOutResult> {
  return supabase.auth.signOut();
}
