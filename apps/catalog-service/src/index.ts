/* eslint-disable @typescript-eslint/consistent-type-imports */
import express, { Request, Response } from 'express';
import { prisma } from './prisma';

type ProductCreateBody = {
  title?: unknown;
  price?: unknown;
};

const app = express();
app.use(express.json());

// GET /products
app.get('/products', async (_req: Request, res: Response) => {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  return res.json(products);
});

// GET /products/:id
app.get('/products/:id', async (req: Request, res: Response) => {
  const id = req.params.id;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return res.status(404).json({ message: 'Product not found' });

  return res.json(product);
});

// POST /products
app.post('/products', async (req: Request<unknown, unknown, ProductCreateBody>, res: Response) => {
  const { title, price } = req.body ?? {};

  if (typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ message: 'title is required' });
  }
  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) {
    return res.status(400).json({ message: 'price must be a positive number' });
  }

  const product = await prisma.product.create({
    data: { title: title.trim(), price },
  });

  return res.status(201).json(product);
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
app.listen(PORT, () => {
  console.log(`Catalog Service listening on http://localhost:${PORT}`);
});
