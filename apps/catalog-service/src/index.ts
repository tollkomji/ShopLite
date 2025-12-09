import { PrismaClient } from './generated/prisma';
import { createApp } from './app';

const prisma = new PrismaClient();
const app = createApp(prisma);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

app.listen(PORT, () => {
  console.log(`Catalog Service listening on http://localhost:${PORT}`);
});
