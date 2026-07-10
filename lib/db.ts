import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

const connectionString = process.env.DATABASE_URL;
const missingDbMessage =
    'DATABASE_URL environment variable is not set.';

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

export const db: Database = connectionString
    ? drizzle(postgres(connectionString, { prepare: false }), { schema })
    : createUnavailableDb();
