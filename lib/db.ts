import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set. Add it to your Vercel or Neon dashboard.');
}

// Neon Serverless Postgres generally allows more connections, but maintaining a reasonable pool is good practice.
// prepare: false is required for connection poolers (PgBouncer/Supavisor).
const client = postgres(connectionString, {
    max: 10, // Increased slightly for Neon's typical allowances
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false, // Required for Neon's connection pooler
});

export const db = drizzle(client, { schema });

