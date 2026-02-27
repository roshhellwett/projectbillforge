import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

const connectionString = process.env.DATABASE_URL;
const missingDbMessage =
    'DATABASE_URL environment variable is not set. Add it to your Vercel or Neon dashboard.';

type Database = PostgresJsDatabase<typeof schema>;

function createUnavailableDb(): Database {
    return new Proxy(
        {} as Database,
        {
            get() {
                throw new Error(missingDbMessage);
            },
        }
    );
}

// Keep module import safe during build; fail only when DB is actually accessed.
export const db: Database = connectionString
    ? drizzle(
        postgres(connectionString, {
            max: 10,
            idle_timeout: 20,
            connect_timeout: 10,
            prepare: false,
        }),
        { schema }
    )
    : createUnavailableDb();
