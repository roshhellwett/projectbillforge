import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set. Add it to your Railway dashboard.');
}

// Railway free tier: max 5 concurrent connections.
// prepare: false is required for connection poolers (PgBouncer/Supavisor).
const client = postgres(connectionString, {
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false, // Required for Railway's connection pooler
});

export const db = drizzle(client, { schema });

