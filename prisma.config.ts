import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // `prisma generate` runs in CI without database secrets. Database commands
    // still require `DATABASE_URL` and fail against this local fallback otherwise.
    url: process.env.DATABASE_URL ?? "postgresql://localhost:5432/postgres",
  },
});
