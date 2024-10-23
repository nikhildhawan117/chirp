import { type Config } from "drizzle-kit";

import { env } from "~/env";

// To generate the drizzle schema and deploy database run:
// 1. npx drizzle-kit generate
// 2. npx drizzle-kit migrate
export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  tablesFilter: ["chirp_*"],
} satisfies Config;
