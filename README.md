# MilkyRaman

Modern dairy business management for single-owner operations covering both milk procurement from farmers and retail distribution to households and shops.

## Features
- **Milk Buy (Procurement):** Daily collection from farmers (AM/PM shifts), Cow/Buffalo/Mixed milk varieties, live rate calculation via configurable FAT/SNF slabs or fixed rate, and instant generation of thermal receipt slips.
- **Milk Sell (Retail & Khata):** Household & shop sales with customer-negotiated rates, automatic inventory deduction, and immediate receivable ledger impact.
- **Farmers & Customers Registry:** Master party directory with contact numbers, addresses, milk varieties, total volumes supplied, total billing, payments made, and net outstanding balances.
- **Payments & Khata Ledger:** Customer receipts, farmer payouts, advance payments, and multi-mode settlement (UPI, Cash, Bank Transfer, Cheque).
- **Recurring Subscriptions:** Daily morning/evening customer delivery schedules with pause/resume support.
- **Delivery Route Sheet:** Morning and evening delivery checklists with one-click "Deliver" actions that automatically record transactions into daily sales.
- **Products & Inventory:** Stock management for fresh milk, curd, paneer, and desi ghee with low-stock alerts and manual adjustments.
- **Operating Expenses:** Track feed, fuel, electricity, packaging, labor, and maintenance costs.
- **Business Day Book & Reports:** Day book, milk volume flow, gross profit margin, cash flow tracking, printable statements, and CSV exports.
- **Configurable Pricing:** Configurable FAT/SNF rate chart editor matching standard dairy practices.
- **Offline-First & Data Backup:** Operates with 100% local persistence and export/restore JSON backups.

## Technology Stack
- React 19 + TypeScript
- Vite
- Tailwind CSS
- Lucide React icons
- Decimal-safe financial and quantity calculations

## Getting Started
```bash
npm install
npm run dev
```
Open `http://localhost:3000` to access the application.
