# POS Software — Requirements Specification
### Stack: Laravel · React.js · MySQL
### Prepared for: Claude Code Agent

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Architecture](#2-tech-stack--architecture)
3. [Module & Feature Requirements](#3-module--feature-requirements)
4. [Database Schema (ERD Summary)](#4-database-schema-erd-summary)
5. [API Endpoint Map](#5-api-endpoint-map)
6. [UI/UX Theme & Design System](#6-uiux-theme--design-system)
7. [Component Library & Layout Blueprint](#7-component-library--layout-blueprint)
8. [Role & Permission Matrix](#8-role--permission-matrix)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Claude Code Agent Instructions](#10-claude-code-agent-instructions)

---

## 1. Project Overview

**Product Name:** SwiftPOS  
**Type:** Point-of-Sale (POS) Web Application  
**Target Users:** Retail shops, restaurants, pharmacies, and small-to-medium businesses in Bangladesh  
**Primary Language:** English (UI), with optional Bangla number rendering for receipts  

### Core Goals
- Fast, distraction-free sales transaction flow
- Real-time inventory tracking
- Multi-user access with role-based permissions
- Daily/weekly/monthly reporting and analytics
- Offline-ready cashier screen (PWA-ready)

---

## 2. Tech Stack & Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (React.js)                  │
│  React 18 · Vite · TailwindCSS · Zustand · React Query  │
│  Axios · React Router v6 · Recharts · React Hot Toast    │
└───────────────────────┬─────────────────────────────────┘
                        │ REST API (JSON)
┌───────────────────────▼─────────────────────────────────┐
│                    BACKEND (Laravel 11)                   │
│  Sanctum Auth · Eloquent ORM · Laravel Queues            │
│  Spatie Permissions · Laravel Excel · DomPDF             │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                   DATABASE (MySQL 8)                      │
│  Normalized schema · Soft deletes · Timestamps           │
└─────────────────────────────────────────────────────────┘
```

### Directory Structure (Laravel)
```
backend/
├── app/
│   ├── Http/Controllers/Api/
│   ├── Models/
│   ├── Services/
│   └── Policies/
├── database/
│   ├── migrations/
│   └── seeders/
└── routes/api.php

frontend/
├── src/
│   ├── pages/
│   ├── components/
│   │   ├── ui/          # Reusable atoms
│   │   ├── pos/         # POS-specific components
│   │   └── layout/      # Shell, Sidebar, Topbar
│   ├── stores/          # Zustand state
│   ├── hooks/           # Custom hooks
│   ├── services/        # Axios API calls
│   └── utils/
```

---

## 3. Module & Feature Requirements

### 3.1 Authentication & User Management

| Feature | Details |
|---|---|
| Login | Email + password, JWT via Laravel Sanctum |
| Logout | Token revocation |
| Roles | Super Admin, Admin, Cashier, Manager |
| User CRUD | Name, email, role, PIN for cashier mode |
| Password reset | Email-based |
| Session timeout | Configurable (default 30 min) |

---

### 3.2 POS / Sales Screen (Core Module)

> This is the most-used screen — must be ultra-fast and keyboard-navigable.

**Features:**
- Product search by name, barcode, or SKU
- Barcode scanner support (USB/webcam)
- Cart with quantity editing, line-item discount
- Customer selection (walk-in or saved customer)
- Payment methods: Cash, Card, Mobile Banking (bKash/Nagad), Split payment
- Change calculator for cash payments
- Hold/recall sale (park a transaction)
- Print receipt (thermal 58mm / 80mm / A4)
- Apply coupon code or percentage/flat discount
- Tax calculation per product or global
- Real-time stock check and low-stock warning

**Keyboard Shortcuts:**
```
F1  → Focus product search
F2  → Open payment modal
F3  → Hold current sale
F4  → Recall held sale
F5  → New sale / clear cart
F8  → Toggle customer panel
```

---

### 3.3 Product & Inventory Management

- Product CRUD: name, SKU, barcode, category, brand, unit, price, cost, tax, image
- Product variants (size, color, etc.)
- Stock adjustment (manual in/out with reason)
- Purchase entry (add stock with supplier details)
- Low-stock alerts (configurable threshold)
- Expiry date tracking (for pharmacy use)
- Bulk import via Excel
- Product categories and brands CRUD

---

### 3.4 Customer Management

- Customer CRUD: name, phone, email, address, balance
- Customer groups with custom price levels
- Credit/due tracking
- Purchase history per customer
- Loyalty points (optional toggle)

---

### 3.5 Supplier Management

- Supplier CRUD: name, phone, email, address
- Purchase orders linked to suppliers
- Payment tracking for supplier invoices
- Due/advance balance per supplier

---

### 3.6 Purchase Management

- Create purchase order
- Receive items (partial or full)
- Purchase returns
- Link to supplier
- Payment status: paid, partial, due
- Auto-update stock on purchase receive

---

### 3.7 Expense Management

- Expense categories CRUD
- Add daily expenses with amount, category, note, date
- Expense listing with filters
- Expense summary in dashboard

---

### 3.8 Reports & Analytics

| Report | Description |
|---|---|
| Sales Report | Daily/weekly/monthly/custom range |
| Profit & Loss | Revenue vs cost per period |
| Stock Report | Current stock levels |
| Low Stock Report | Items below threshold |
| Purchase Report | All purchase history |
| Expense Report | Categorized expenses |
| Customer Due Report | Who owes money |
| Supplier Due Report | What is owed to suppliers |
| Top Products | Best-selling by qty & revenue |
| Cashier Performance | Sales by user |

- All reports: filter, export to PDF and Excel

---

### 3.9 Dashboard

- Total sales today / this week / this month
- Total profit today
- Total expenses today
- Low stock product count (clickable)
- Top 5 selling products (bar chart)
- Sales trend line chart (last 7 or 30 days)
- Recent transactions list
- Quick-action buttons: New Sale, Add Product, Add Purchase

---

### 3.10 Settings

- Business info (name, logo, address, phone, currency)
- Receipt settings (header, footer, thermal format toggle)
- Tax configuration
- Currency symbol
- Low stock threshold
- Payment method enable/disable
- Loyalty point ratio
- Backup & restore database

---

## 4. Database Schema (ERD Summary)

```sql
users               → id, name, email, password, pin, role_id
roles               → id, name
permissions         → id, name
role_permissions    → role_id, permission_id

products            → id, name, sku, barcode, category_id, brand_id,
                      unit_id, price, cost, tax_id, stock, alert_qty,
                      image, expiry_date, is_active
categories          → id, name, parent_id
brands              → id, name
units               → id, name, short_name
taxes               → id, name, rate

customers           → id, name, phone, email, address, group_id, balance, points
customer_groups     → id, name, discount_percent

suppliers           → id, name, phone, email, address, balance

sales               → id, invoice_no, customer_id, user_id, subtotal,
                      discount, tax, total, paid, change, payment_status,
                      sale_status, note, created_at
sale_items          → id, sale_id, product_id, qty, price, discount, total

purchases           → id, reference_no, supplier_id, user_id, subtotal,
                      discount, tax, total, paid, payment_status, created_at
purchase_items      → id, purchase_id, product_id, qty, cost, total

expenses            → id, category_id, amount, note, date, user_id
expense_categories  → id, name

stock_adjustments   → id, product_id, type (in/out), qty, reason, user_id, created_at

settings            → id, key, value
```

---

## 5. API Endpoint Map

### Auth
```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### Products
```
GET    /api/products
POST   /api/products
GET    /api/products/{id}
PUT    /api/products/{id}
DELETE /api/products/{id}
GET    /api/products/search?q=
POST   /api/products/import
GET    /api/products/low-stock
```

### Sales
```
GET    /api/sales
POST   /api/sales
GET    /api/sales/{id}
POST   /api/sales/{id}/return
GET    /api/sales/{id}/receipt
```

### Purchases
```
GET    /api/purchases
POST   /api/purchases
GET    /api/purchases/{id}
PUT    /api/purchases/{id}
```

### Customers
```
GET    /api/customers
POST   /api/customers
GET    /api/customers/{id}
PUT    /api/customers/{id}
GET    /api/customers/{id}/history
```

### Suppliers
```
GET    /api/suppliers
POST   /api/suppliers
GET    /api/suppliers/{id}
PUT    /api/suppliers/{id}
```

### Reports
```
GET    /api/reports/sales?from=&to=
GET    /api/reports/profit?from=&to=
GET    /api/reports/stock
GET    /api/reports/expenses?from=&to=
GET    /api/reports/top-products?limit=5
GET    /api/reports/cashier
```

### Settings
```
GET    /api/settings
POST   /api/settings
POST   /api/settings/logo
```

---

## 6. UI/UX Theme & Design System

### 6.1 Design Philosophy

SwiftPOS is built for **speed, clarity, and focus under pressure** — a cashier runs dozens of transactions a day. Every pixel must justify its presence. The aesthetic is **precision retail hardware meets modern SaaS**: dark sidebar with clean white content canvas, high-contrast interactive elements, and zero decorative noise.

The signature element: a **persistent transaction ticker** on the POS screen — a slim horizontal strip above the cart that shows the last 3 completed sales with animated slide-in, giving cashiers instant confidence that sales are recording.

---

### 6.2 Color Palette

```
--color-bg-base:        #F7F8FA   /* Main content background */
--color-bg-sidebar:     #12151E   /* Deep navy-black sidebar */
--color-bg-card:        #FFFFFF   /* Card surfaces */
--color-bg-muted:       #EEF0F5   /* Subtle section backgrounds */

--color-primary:        #2D6BE4   /* Actions, links, highlights */
--color-primary-hover:  #1E54C0   /* Hover state */
--color-primary-light:  #EBF1FD   /* Tinted backgrounds */

--color-success:        #17A865   /* Stock OK, paid, confirmed */
--color-warning:        #F5A623   /* Low stock, partial payment */
--color-danger:         #E5384F   /* Delete, due, alert */
--color-info:           #0EA5E9   /* Informational badges */

--color-text-primary:   #111827   /* Headings, values */
--color-text-secondary: #6B7280   /* Labels, metadata */
--color-text-inverse:   #FFFFFF   /* On dark backgrounds */
--color-text-sidebar:   #A8B3C8   /* Sidebar nav items */

--color-border:         #E2E6EC   /* Dividers, input borders */
--color-border-focus:   #2D6BE4   /* Input focus ring */
```

---

### 6.3 Typography

```
Display / Headings:  "Inter" — weights 600, 700
Body / UI text:      "Inter" — weights 400, 500
Monospace (SKU/IDs): "JetBrains Mono" — weight 400
Receipt font:        "Courier Prime" — for thermal print preview
```

**Type Scale:**
```
--text-xs:   11px / 1.4  (badges, timestamps)
--text-sm:   13px / 1.5  (table data, helper text)
--text-base: 15px / 1.6  (body, form labels)
--text-lg:   18px / 1.4  (card titles, section headers)
--text-xl:   22px / 1.3  (page headings)
--text-2xl:  28px / 1.2  (dashboard stat numbers)
--text-3xl:  36px / 1.1  (hero metrics)
```

---

### 6.4 Spacing & Radius

```
--space-1:   4px
--space-2:   8px
--space-3:   12px
--space-4:   16px
--space-5:   20px
--space-6:   24px
--space-8:   32px
--space-10:  40px

--radius-sm: 4px    (badges, small chips)
--radius-md: 8px    (inputs, cards)
--radius-lg: 12px   (modals, panels)
--radius-xl: 16px   (large cards)
```

---

### 6.5 Shadows

```
--shadow-sm:  0 1px 2px rgba(0,0,0,0.06)
--shadow-md:  0 4px 12px rgba(0,0,0,0.08)
--shadow-lg:  0 8px 24px rgba(0,0,0,0.10)
--shadow-modal: 0 20px 60px rgba(0,0,0,0.15)
```

---

### 6.6 Component Tokens

**Buttons:**
```
Primary:    bg #2D6BE4, text white, radius 6px, px 16, py 8, font-weight 500
Secondary:  bg #EEF0F5, text #111827, border none
Danger:     bg #E5384F, text white
Ghost:      bg transparent, text #2D6BE4, hover bg #EBF1FD
Icon-only:  40×40px, radius 8px
```

**Inputs:**
```
Height: 40px
Border: 1px solid #E2E6EC
Border-radius: 8px
Focus: border #2D6BE4, box-shadow 0 0 0 3px rgba(45,107,228,0.15)
Padding: 0 12px
Font: 14px Inter
```

**Table:**
```
Header bg: #F7F8FA, font-weight 600, text-sm, text-secondary
Row border: 1px solid #E2E6EC (bottom only)
Row hover: bg #F7F8FA
Cell padding: 12px 16px
Striped: off (use hover instead)
```

**Badges / Status Pills:**
```
Paid:     bg #DCFCE7, text #15803D
Partial:  bg #FEF9C3, text #A16207
Due:      bg #FEE2E2, text #B91C1C
Active:   bg #DBEAFE, text #1D4ED8
Inactive: bg #F3F4F6, text #6B7280
```

---

## 7. Component Library & Layout Blueprint

### 7.1 App Shell Layout

```
┌──────────────────────────────────────────────────────────────┐
│ SIDEBAR (240px, dark #12151E)  │  MAIN CONTENT AREA          │
│                                │                              │
│  [Logo + Store Name]           │  [Topbar: breadcrumb, user]  │
│  ─────────────────────         │  ──────────────────────────  │
│  ○ Dashboard                   │                              │
│  ● POS / New Sale  ← active    │        <Page Content>        │
│  ○ Sales History               │                              │
│  ○ Products                    │                              │
│  ○ Inventory                   │                              │
│  ○ Purchases                   │                              │
│  ○ Customers                   │                              │
│  ○ Suppliers                   │                              │
│  ○ Expenses                    │                              │
│  ○ Reports                     │                              │
│  ○ Settings                    │                              │
│  ─────────────────────         │                              │
│  [User avatar + name]          │                              │
│  [Logout]                      │                              │
└──────────────────────────────────────────────────────────────┘
```

**Sidebar active state:** left border 3px solid `#2D6BE4`, text white, bg `rgba(45,107,228,0.12)`  
**Sidebar inactive:** text `#A8B3C8`, hover text white, hover bg `rgba(255,255,255,0.05)`

---

### 7.2 POS Screen Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ [TRANSACTION TICKER — last 3 sales, slide-in animation]         │
├──────────────────────────────────┬──────────────────────────────┤
│  PRODUCT PANEL (left 60%)        │  CART PANEL (right 40%)      │
│                                  │                               │
│  [🔍 Search / Barcode input F1]  │  Customer: [Walk-in ▼]  [F8] │
│  ─────────────────────────────   │  ─────────────────────────── │
│  [Category filter chips]         │  Product       Qty   Total    │
│                                  │  ─────────────────────────── │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐    │  Mineral Water  1   ৳20      │
│  │ 🧴 │ │ 🥤 │ │ 💊 │ │ 📦 │    │  Coca-Cola      2   ৳60      │
│  │Name│ │Name│ │Name│ │Name│    │  Bread loaf     1   ৳45      │
│  │৳120│ │৳40 │ │৳200│ │৳80 │    │  ─────────────────────────── │
│  └────┘ └────┘ └────┘ └────┘    │  Subtotal:          ৳125     │
│                                  │  Discount:          ৳0       │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐    │  Tax (5%):          ৳6.25    │
│  │    │ │    │ │    │ │    │    │  ─────────────────────────── │
│  └────┘ └────┘ └────┘ └────┘    │  TOTAL:           ৳131.25    │
│                                  │                               │
│                                  │  [Hold F3] [Clear F5]        │
│                                  │  [💳 CHARGE  F2]  ← primary  │
└──────────────────────────────────┴──────────────────────────────┘
```

**Product cards:** 120×120px min, image top, name below (2 lines max), price bold. Hover: shadow-md + blue top border 2px. Click: add to cart with count badge.

---

### 7.3 Payment Modal

```
┌────────────────────────────────────┐
│  Complete Payment                  │
│  Total: ৳131.25                    │
│  ────────────────────────────────  │
│  [Cash] [Card] [bKash] [Nagad]     │
│         ← tab pills                │
│  ────────────────────────────────  │
│  Amount Tendered: [_________ ৳]    │
│  Change:          ৳ 68.75  ← bold  │
│  ────────────────────────────────  │
│         [Cancel]  [✔ Confirm F2]   │
└────────────────────────────────────┘
```

---

### 7.4 Dashboard Layout

```
┌──────────────────────────────────────────────────────────────┐
│  [Stat Card]  [Stat Card]  [Stat Card]  [Stat Card]          │
│  Today Sales  Today Profit  Expenses    Low Stock Count       │
├───────────────────────────┬──────────────────────────────────┤
│  Sales Trend (Line Chart) │  Top Products (Bar Chart)        │
│  Last 30 days             │  Top 5 by Revenue                │
├───────────────────────────┴──────────────────────────────────┤
│  Recent Sales Table (last 10 transactions)                   │
└──────────────────────────────────────────────────────────────┘
```

**Stat cards:** large bold number (--text-3xl), label below (--text-sm, secondary), icon top-right (ghost, tinted), subtle colored border-left 4px (primary/success/warning/danger per context).

---

### 7.5 Data Table Pattern (All List Pages)

```
┌──────────────────────────────────────────────────────────┐
│  Page Title          [Search input]   [Filter] [+ Add]   │
│  ──────────────────────────────────────────────────────  │
│  ☐  Name       SKU       Price    Stock   Status  Action │
│  ──────────────────────────────────────────────────────  │
│  ☐  Product A  PRD-001  ৳120.00  50 pcs  ● Active  ···  │
│  ☐  Product B  PRD-002  ৳40.00   3 pcs   ⚠ Low     ···  │
│  ──────────────────────────────────────────────────────  │
│  Showing 1–20 of 148      [← Prev]  1 2 3 … 8  [Next →] │
└──────────────────────────────────────────────────────────┘
```

Action menu `···` dropdown: Edit, View, Delete (red).

---

## 8. Role & Permission Matrix

| Permission | Super Admin | Admin | Manager | Cashier |
|---|:---:|:---:|:---:|:---:|
| Make Sales | ✅ | ✅ | ✅ | ✅ |
| View Sales | ✅ | ✅ | ✅ | Own only |
| Return Sales | ✅ | ✅ | ✅ | ❌ |
| Manage Products | ✅ | ✅ | ✅ | ❌ |
| Adjust Stock | ✅ | ✅ | ✅ | ❌ |
| Manage Customers | ✅ | ✅ | ✅ | View only |
| Manage Suppliers | ✅ | ✅ | ❌ | ❌ |
| Create Purchase | ✅ | ✅ | ✅ | ❌ |
| Manage Expenses | ✅ | ✅ | ✅ | ❌ |
| View Reports | ✅ | ✅ | ✅ | ❌ |
| Manage Users | ✅ | ✅ | ❌ | ❌ |
| System Settings | ✅ | ❌ | ❌ | ❌ |

---

## 9. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | POS screen must load in < 1.5s; product search results < 300ms |
| Offline | Cart state must persist across tab refresh (localStorage) |
| Print | Support 58mm / 80mm thermal and A4 receipt formats |
| Responsive | Dashboard & admin panels: min 1024px; POS screen: 1280px+ |
| Security | Sanctum token auth; all routes middleware-protected |
| Validation | Server-side validation on all API inputs; client-side for UX only |
| Audit | All sales, stock changes, and logins must be logged with user + timestamp |
| Accessibility | Tab-navigable POS screen; keyboard shortcuts documented in UI |
| Export | All reports exportable to PDF (DomPDF) and Excel (Laravel Excel) |
| Error Handling | Consistent API error shape: `{ message, errors: {} }`; Toast on frontend |

---

## 10. Claude Code Agent Instructions

> These instructions are for the **Claude Code agent** to follow when building this project.

### General Rules
- Always read this spec fully before starting any module.
- Build backend (Laravel) and frontend (React) as **separate directories** in one monorepo: `/backend` and `/frontend`.
- Use `laravel/sanctum` for all authentication — do not use Passport.
- All API routes must be under `/api/` with versioning-ready structure (`/api/v1/`).
- Use **Spatie Laravel Permission** for roles and permissions.
- Seed the database with: 1 Super Admin user, sample products, categories.

### Laravel Conventions
- One controller per resource, use Form Requests for validation.
- Use Service classes for complex business logic (e.g., `SaleService`, `StockService`).
- Use API Resources for all JSON responses (`php artisan make:resource`).
- Soft deletes on: products, customers, suppliers, users.
- Use `config('pos.settings')` pattern to cache settings from DB.

### React Conventions
- Use **Zustand** for cart state and auth state.
- Use **React Query** (`@tanstack/react-query`) for all API data fetching.
- All Axios calls go through `/src/services/api.js` with base URL from `.env`.
- Use `react-router-dom` v6 with a protected route wrapper.
- Use `react-hot-toast` for all notifications.
- All table pages use a shared `<DataTable>` component with pagination, search, and sort props.
- All form modals use a shared `<Modal>` wrapper component.

### Theme Implementation
- Define all CSS variables in `/src/styles/tokens.css` and import globally.
- Use TailwindCSS for layout utilities; use CSS variables for colors via `[var(--color-primary)]` pattern.
- Sidebar is its own layout component: `<AppSidebar>`.
- POS screen is a **separate route layout** without the standard sidebar header (full-screen mode).
- Receipt preview component must use `Courier Prime` and 384px width (80mm thermal equivalent at 96dpi).

### Build Order (Recommended Sequence)
```
1. Laravel project setup, DB, migrations, seeders
2. Auth API (login, logout, me)
3. Products API + React product list page
4. POS screen — cart, product search, payment modal
5. Sales API + receipt generation
6. Customers, Suppliers APIs + React pages
7. Purchases API + React page
8. Stock adjustment API
9. Expenses API + React page
10. Reports API + React report pages with charts
11. Dashboard with Recharts
12. Settings page
13. User management page (Super Admin only)
14. PDF/Excel export for reports
15. Final: polish, keyboard shortcuts, print styles
```

### Environment Variables Required
```env
# Backend (.env)
APP_NAME=SwiftPOS
DB_DATABASE=swiftpos
SANCTUM_STATEFUL_DOMAINS=localhost:5173
FRONTEND_URL=http://localhost:5173

# Frontend (.env)
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=SwiftPOS
```

---

*End of Specification — SwiftPOS v1.0*  
*Generated for TechFiqh Development Reference*
