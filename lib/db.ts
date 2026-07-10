import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';

const connectionString = process.env.DATABASE_URL;
const missingDbMessage =
    'DATABASE_URL environment variable is not set. Add it to your Vercel or Neon dashboard.';

type Database = NeonHttpDatabase<typeof schema>;

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
    ? drizzle(neon(connectionString), { schema })
    : createUnavailableDb();
