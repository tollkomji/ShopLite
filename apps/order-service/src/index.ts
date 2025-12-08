/* eslint-disable @typescript-eslint/consistent-type-imports */
import express, { Request, Response } from 'express';
import axios from 'axios';
import { prisma } from './prisma';

type CreateOrderBody = { items?: unknown };
type ItemInput = { productId?: unknown; qty?: unknown };
type CatalogProduct = { id: string; title: string; price: number };

const app = express();
app.use(express.json());

const CATALOG_URL = process.env.CATALOG_URL ?? 'http://localhost:3001';
const catalogApi = axios.create({ baseURL: CATALOG_URL, timeout: 5000 });

// GET /orders
app.get('/orders', async (_req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, status: true, total: true, createdAt: true },
  });
  return res.json(orders);
});

// GET /orders/:id
app.get('/orders/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  return res.json(order);
});

// POST /orders
app.post('/orders', async (req: Request<unknown, unknown, CreateOrderBody>, res: Response) => {
  const itemsRaw = req.body?.items;

  if (!Array.isArray(itemsRaw) || itemsRaw.length === 0) {
    return res.status(400).json({ message: 'items must be a non-empty array' });
  }

  const items: { productId: string; qty: number }[] = [];
  for (const it of itemsRaw as ItemInput[]) {
    const productId = typeof it.productId === 'string' ? it.productId : '';
    const qty = typeof it.qty === 'number' ? it.qty : NaN;

    if (!productId) return res.status(400).json({ message: 'productId is required' });
    if (!Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({ message: 'qty must be a positive integer' });
    }
    items.push({ productId, qty });
  }

  const pricedItems: { productId: string; qty: number; priceSnapshot: number }[] = [];
  for (const it of items) {
    try {
      const resp = await catalogApi.get<CatalogProduct>(`/products/${it.productId}`);
      const p = resp.data;

      if (typeof p.price !== 'number' || !Number.isFinite(p.price) || p.price <= 0) {
        return res.status(400).json({ message: `Invalid price for product ${it.productId}` });
      }

      pricedItems.push({ productId: it.productId, qty: it.qty, priceSnapshot: p.price });
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const status = e.response?.status;

        if (status === 404) {
          return res.status(404).json({ message: `Product not found: ${it.productId}` });
        }

        return res.status(502).json({ message: 'Catalog service unavailable' });
      }

      return res.status(500).json({ message: 'Unexpected error' });
    }
  }

  const total = pricedItems.reduce((sum, it) => sum + it.priceSnapshot * it.qty, 0);

  const created = await prisma.$transaction(async tx => {
    const order = await tx.order.create({
      data: {
        total,
        items: { create: pricedItems.map(it => ({ ...it })) },
      },
      include: { items: true },
    });
    return order;
  });

  return res.status(201).json(created);
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3002;
app.listen(PORT, () => {
  console.log(`Order Service listening on http://localhost:${PORT}`);
});
