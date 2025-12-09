/* eslint-disable @typescript-eslint/consistent-type-imports */
import express, { Request, Response } from 'express';
import axios, { AxiosInstance } from 'axios';
import type { PrismaClient } from './generated/prisma';
import { normalizeItems, calcTotal } from './domain/order';

type CreateOrderBody = { items?: unknown };
type CatalogProduct = { id: string; title: string; price: number };

export function createCatalogApi(baseURL: string): AxiosInstance {
  return axios.create({ baseURL, timeout: 5000 });
}

export function createApp(prisma: PrismaClient, catalogApi: AxiosInstance) {
  const app = express();
  app.use(express.json());

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

    const normalized = normalizeItems(itemsRaw);
    if (!normalized.ok) {
      return res.status(400).json({ message: normalized.error });
    }

    const items = normalized.items;

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

    const total = calcTotal(pricedItems);

    const created = await prisma.$transaction(async tx => {
      return tx.order.create({
        data: {
          total,
          items: { create: pricedItems.map(it => ({ ...it })) },
        },
        include: { items: true },
      });
    });

    return res.status(201).json(created);
  });

  return app;
}
