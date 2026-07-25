import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

const connectionString = process.env.DATABASE_URL;
const missingDbMessage = 'DATABASE_URL environment variable is not set.';

type Database = PostgresJsDatabase<typeof schema>;

function createUnavailableDb(): Database {
    return new Proxy({} as Database, {
        get() {
            throw new Error(missingDbMessage);
        },
    });
}

/**
 * Cache the postgres client + drizzle wrapper on globalThis so Next.js HMR
 * (dev) and Vercel warm invocations reuse a single pooled client instead of
 * opening a new one per module reload. Serverless-cold starts still get one.
 */
const globalForDb = globalThis as unknown as {
    __billforge_pg?: ReturnType<typeof postgres>;
    __billforge_db?: Database;
};

function buildDb(): Database {
    if (!connectionString) return createUnavailableDb();
    if (globalForDb.__billforge_db) return globalForDb.__billforge_db;

    const client =
        globalForDb.__billforge_pg ??
        postgres(connectionString, {
            prepare: false,
            // Keep the pool tiny — Vercel serverless workers are single-tenant
            // and Neon/Supabase free tiers cap connections aggressively.
            max: process.env.NODE_ENV === 'production' ? 1 : 5,
            idle_timeout: 20,
            connect_timeout: 10,
        });

    if (process.env.NODE_ENV !== 'production') {
        globalForDb.__billforge_pg = client;
    }

    const wrapped = drizzle(client, { schema });
    if (process.env.NODE_ENV !== 'production') {
        globalForDb.__billforge_db = wrapped;
    }
    return wrapped;
}

export const db: Database = buildDb();
