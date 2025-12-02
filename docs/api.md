# HTTP API

> Нижче — мінімальний контракт API для двох сервісів (по 3 роути на сервіс).

## Catalog Service

### POST /products

**Body**

```json
{
  "title": "Wireless Mouse",
  "price": 19.99
}
```

**201 Response**

```json
{
  "id": "uuid",
  "title": "Wireless Mouse",
  "price": 19.99
}
```

### GET /products

**200 Response**

```json
[
  { "id": "uuid1", "title": "Keyboard", "price": 49.99 },
  { "id": "uuid2", "title": "Mouse", "price": 19.99 }
]
```

### GET /products/:id

**200 Response**

```json
{ "id": "uuid", "title": "Mouse", "price": 19.99 }
```

**404 Response**

```json
{ "message": "Product not found" }
```

## Order Service

### POST /orders

**Body**

```json
{
  "items": [{ "productId": "uuid2", "qty": 2 }]
}
```

**201 Response**

```json
{
  "id": "uuid-order",
  "status": "NEW",
  "total": 39.98,
  "items": [{ "productId": "uuid2", "qty": 2, "priceSnapshot": 19.99 }]
}
```

### GET /orders

**200 Response**

```json
[{ "id": "uuid-order", "status": "NEW", "total": 39.98 }]
```

### GET /orders/:id

**200 Response**

```json
{
  "id": "uuid-order",
  "status": "NEW",
  "total": 39.98,
  "items": [{ "productId": "uuid2", "qty": 2, "priceSnapshot": 19.99 }]
}
```

## Примітки

- Order Service під час створення замовлення звертається у Catalog Service для перевірки `productId` та отримання ціни.
- На ЛР3 дані можуть зберігатися в памʼяті, на ЛР4 — у PostgreSQL (Prisma).
