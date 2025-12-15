# ShopLite — навчальний проєкт (Node.js)

**Курс:** Розробка ПЗ на платформі Node.js  
**Формат:** 2 сервіси × 3 HTTP-роути, CI/CD, тести, діаграми  
**Виконавець:** ІО-36 Білостенний Богдан

## Опис

**ShopLite** — спрощений бекенд інтернет-магазину з двома сервісами:

- **Catalog Service** — керує товарами (каталог).
- **Order Service** — керує замовленнями; під час створення замовлення звертається до Catalog Service для отримання даних про товари.

## Демо (staging)

- **Catalog Service:** https://shoplite-catalog.onrender.com/
- **Order Service:** https://shoplite-order.onrender.com/

## Стек

- Node.js + TypeScript
- Express (HTTP API)
- PostgreSQL + Prisma
- Тести: unit / integration / E2E + mutation testing (Stryker)
- CI/CD: GitHub Actions + деплой на Render

## Структура репозиторію

```text
.
├── apps/
│   ├── catalog-service/
│   └── order-service/
├── packages/
└── docs/
```

## Документація (ЛР2)

Файли з описом архітектури, моделі даних та сценаріїв знаходяться у `docs/`:

- `docs/architecture.md` — компоненти, модулі та взаємодія сервісів
- `docs/data-model.md` — модель даних та ER-діаграма
- `docs/scenarios.md` — ключові сценарії, зміни/агрегації даних
- `docs/testing-report.md` — короткий звіт по тестуванню/мутаціях (ЛР5)

> Якщо якихось файлів немає у репозиторії — створіть їх у `docs/` (можна мінімальні версії для здачі).

## Локальний запуск

### Встановлення залежностей

```bash
pnpm install
```

### Генерація Prisma Client (за потреби)

```bash
pnpm -C apps/catalog-service prisma:generate
pnpm -C apps/order-service prisma:generate
```

### Збірка

```bash
pnpm build
```

### Запуск сервісів (локально з .env)

```bash
pnpm -C apps/catalog-service start:local
pnpm -C apps/order-service start:local
```

> Для інтеграційних/E2E тестів потрібна запущена PostgreSQL та застосовані міграції.

## Перевірки якості

```bash
pnpm format:check
pnpm lint
pnpm test:unit
pnpm test
pnpm build
```

## CI/CD (ЛР6)

- **CI** запускається на `push` / `pull_request` і перевіряє форматування, лінтинг, збірку та тести.
- **CD** (staging) тригерить деплой у Render після пушу в `main` (через deploy hooks).

## План виконання лабораторних

- [x] **ЛР0** Вибір ідеї + створення репозиторію + опис у README
- [x] **ЛР1** Інструменти: prettier/eslint, git hooks, conventional commits
- [x] **ЛР2** Архітектура + ER + сценарії (див. `docs/`)
- [x] **ЛР3** Інтерактивний прототип зі статичними даними
- [x] **ЛР4** Інтеграція з БД (PostgreSQL/Prisma), заміна статики
- [x] **ЛР5** Тестування: unit + інтеграційні + E2E + mutation + звіт
- [x] **ЛР6** CI для PR + CD на staging, сервіс доступний з інтернету
