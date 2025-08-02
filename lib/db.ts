// lib/db.ts
import { PrismaClient } from "../app/generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";

const client = new PrismaClient({
  log: ["query", "error", "warn"], // optional
}).$extends(withAccelerate());

const globalForPrisma = globalThis as unknown as {
  prisma?: typeof client;
};
  
(globalForPrisma.prisma ??= client);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = client;
}

export const db = client;
