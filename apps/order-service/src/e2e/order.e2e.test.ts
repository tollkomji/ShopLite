import { beforeAll, beforeEach, afterAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import http from 'http';
import { randomUUID } from 'crypto';

import { PrismaClient as OrderPrisma } from '../generated/prisma';
import { createApp as createOrderApp, createCatalogApi } from '../app';

const ORDERS_DB = 'postgresql://postgres:postgres@localhost:5432/shoplite?schema=orders_test';

describe('order e2e', () => {
  const orderPrisma = new OrderPrisma({ datasources: { db: { url: ORDERS_DB } } });

  let catalogServer: http.Server;
  let catalogBaseUrl = '';

  beforeAll(async () => {
    await orderPrisma.$connect();

    const catalogApp = express();
    catalogApp.use(express.json());

    const products = new Map<string, { id: string; title: string; price: number }>();

    catalogApp.post('/products', (req, res) => {
      const { title, price } = req.body ?? {};
      const id = randomUUID();
      const p = { id, title: String(title ?? ''), price: Number(price) };
      products.set(id, p);
      return res.status(201).json(p);
    });

    catalogApp.get('/products/:id', (req, res) => {
      const p = products.get(req.params.id);
      if (!p) return res.status(404).json({ message: 'Product not found' });
      return res.json(p);
    });

    catalogServer = http.createServer(catalogApp);
    await new Promise<void>(resolve => catalogServer.listen(0, '127.0.0.1', resolve));

    const addr = catalogServer.address();
    if (!addr || typeof addr === 'string') throw new Error('No address');
    catalogBaseUrl = `http://127.0.0.1:${addr.port}`;
  });

  beforeEach(async () => {
    await orderPrisma.orderItem.deleteMany();
    await orderPrisma.order.deleteMany();
  });

  afterAll(async () => {
    await new Promise<void>(resolve => catalogServer.close(() => resolve()));
    await orderPrisma.$disconnect();
  });

  it('creates order using catalog price', async () => {
    const catalogApi = createCatalogApi(catalogBaseUrl);
    const createdProduct = await catalogApi.post('/products', { title: 'Mouse', price: 19.99 });
    const productId = (createdProduct.data as { id: string }).id;

    const orderApp = createOrderApp(orderPrisma, createCatalogApi(catalogBaseUrl));

    const createdOrder = await request(orderApp)
      .post('/orders')
      .send({ items: [{ productId, qty: 2 }] })
      .expect(201);

    const body = createdOrder.body as { total: number; items: Array<{ priceSnapshot: number }> };
    expect(body.total).toBeCloseTo(39.98);
    expect(body.items[0].priceSnapshot).toBeCloseTo(19.99);
  });
});
