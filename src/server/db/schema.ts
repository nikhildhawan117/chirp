import { varchar, pgTable, timestamp, index } from "drizzle-orm/pg-core";

import { createId } from "@paralleldrive/cuid2";

export const posts = pgTable(
  "posts",
  {
    id: varchar("id", { length: 128 })
      .primaryKey()
      .$defaultFn(() => createId()),
    createdAt: timestamp("created_at").defaultNow(),
    content: varchar("content", { length: 255 }),
    authorId: varchar("author_id", { length: 255 }).notNull(),
  },
  (table) => ({
    authorIdIdx: index("author_id_idx").on(table.authorId),
  })
);
