import { PrismaClient } from './generated/prisma';
import { createApp, createCatalogApi } from './app';

const prisma = new PrismaClient();

const CATALOG_URL = process.env.CATALOG_URL ?? 'http://localhost:3001';
const catalogApi = createCatalogApi(CATALOG_URL);

const app = createApp(prisma, catalogApi);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3002;

app.listen(PORT, () => {
  console.log(`Order Service listening on http://localhost:${PORT}`);
});
