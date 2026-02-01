import dotenv from "dotenv";
dotenv.config();

import { createApp } from "./app.js";
import { prisma } from "./db/client.js";

async function startServer() {
  try {
    console.log("🔄 Starting server...");

    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connected");

    const app = createApp();
    const port = Number(process.env.PORT || 3001);

    app.listen(port, () => {
      console.log(`🚀 API running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("DB connection failed", error);

    console.error(error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
