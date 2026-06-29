# SwiftPOS

Point-of-Sale web application — **Laravel 12 API** + **React (Vite)** SPA + **MySQL**.
Built from [`POS_Requirements_Specification.md`](./POS_Requirements_Specification.md).

> Note: the spec targets Laravel 11; this scaffold uses Laravel **12** (current stable),
> which is a drop-in for everything the spec requires.

## Structure

```
backend/    Laravel 12 API (Sanctum, Spatie Permission, Laravel Excel, DomPDF)
frontend/   React 18 + Vite + Tailwind v4 + Zustand + React Query
```

## Prerequisites

PHP 8.2+, Composer, Node 20+, MySQL/MariaDB.

## Backend setup

```bash
cd backend
cp .env.example .env        # already configured for db "swiftpos" on 127.0.0.1
php artisan key:generate    # if needed
php artisan migrate:fresh --seed
php artisan serve           # http://localhost:8000
```

Seeded Super Admin: **admin@swiftpos.test** / **password** (PIN `1234`).

API is served under `/api/v1`. Health check: `GET /api/v1/health`.

## Frontend setup

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

Config lives in `frontend/.env` (`VITE_API_BASE_URL=http://localhost:8000/api/v1`).

## What's scaffolded

- **DB schema & models** for the full ERD (products, sales, purchases, customers,
  suppliers, expenses, stock adjustments, settings, taxes, units, etc.).
- **Roles & permissions** seeded per the spec matrix (Super Admin / Admin / Manager / Cashier).
- **Sample catalog** + default business settings.
- **Frontend foundation**: design tokens (`src/styles/tokens.css`), Tailwind theme,
  app shell (sidebar + topbar), protected routing, Login, Dashboard, full-screen POS
  screen, Zustand auth/cart stores (cart persists across refresh), shared
  `Button` / `Modal` / `DataTable`, and the central Axios client.

## What's next (spec build order)

Auth controllers → Products API & pages → POS charge/receipt → Customers/Suppliers →
Purchases → Stock adjustments → Expenses → Reports (charts + PDF/Excel) → Settings →
User management. Each module plugs into the existing routing, stores, and components.
