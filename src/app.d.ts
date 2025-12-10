import type { SupabaseClient } from '@supabase/supabase-js';
import type { AppUser } from '$entities/user';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient;
			user: AppUser | null;
		}
		interface PageData {
			user: AppUser | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
