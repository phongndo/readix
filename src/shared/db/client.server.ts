import { neon } from '@neondatabase/serverless';
import { env } from '$shared/config'

const connectionString: string = env.DATABASE_URL;

const sql = neon(connectionString);
export { sql };
