# Архітектура ShopLite

## Огляд

Проєкт побудовано як мінімальний набір мікросервісів:

- **Catalog Service** — джерело істини для товарів (створення/читання).
- **Order Service** — створення та читання замовлень; під час створення замовлення звертається до Catalog Service, щоб:
  - перевірити існування `productId`;
  - отримати ціну/дані для розрахунку підсумку.

## Межі відповідальності

### Catalog Service

- CRUD (у мінімумі для курсу — 3 роути): створення товару, список товарів, товар за id
- Валідація вхідних даних товару (наприклад: `price > 0`, `title` не порожній)

### Order Service

- Створення замовлення з переліком позицій
- Перевірка позицій через Catalog Service
- Розрахунок підсумку `total = Σ(price * qty)`
- Зберігання замовлень та їх позицій

## Компонентна діаграма (Mermaid)

```mermaid
flowchart LR
  C[Client / Postman] -->|HTTP| API1[Catalog Service]
  C -->|HTTP| API2[Order Service]
  API2 -->|HTTP запроси| API1
  API1 -->|читання/запис| DB1[(PostgreSQL: catalog_db)]
  API2 -->|читання/запис| DB2[(PostgreSQL: orders_db)]
```

## Взаємодія при створенні замовлення (послідовність)

```mermaid
sequenceDiagram
  participant U as Client
  participant O as Order Service
  participant C as Catalog Service

  U->>O: POST /orders (items[])
  loop для кожного item
    O->>C: GET /products/:id
    C-->>O: product (price, title) / 404
  end
  O->>O: total = Σ(price * qty)
  O-->>U: 201 Created (order)
```

## Нефункціональні вимоги (мінімум для курсу)

- Сервіси незалежні, мають власну БД (після ЛР4)
- Взаємодія між сервісами — через HTTP
- CI перевіряє форматування, лінтинг, білд, тести (ЛР6)
