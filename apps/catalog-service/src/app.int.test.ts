import { beforeAll, beforeEach, afterAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import { PrismaClient } from './generated/prisma';
import { createApp } from './app';

const TEST_DB = 'postgresql://postgres:postgres@localhost:5432/shoplite?schema=catalog_test';

describe('catalog integration', () => {
  const prisma = new PrismaClient({
    datasources: { db: { url: TEST_DB } },
  });

  const app = createApp(prisma);

  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    await prisma.product.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('POST /products -> persists and can be fetched', async () => {
    const created = await request(app)
      .post('/products')
      .send({ title: 'Keyboard', price: 49.99 })
      .expect(201);

    const id = created.body.id;
    expect(typeof id).toBe('string');

    const fetched = await request(app).get(`/products/${id}`).expect(200);
    expect(fetched.body.title).toBe('Keyboard');
    expect(fetched.body.price).toBe(49.99);
  });

  it('rejects invalid payload', async () => {
    await request(app).post('/products').send({ title: '', price: 0 }).expect(400);
  });
});
