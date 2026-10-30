# MilkyRaman architecture

## Product model
Single-owner dairy operation with two connected sides: procurement from farmers and retail sales to households/shops. Procurement stock flows into available inventory; retail sales and deliveries reduce stock. Financial ledgers remain separate by counterparty type but roll up into the business reports.

## Android application layers

- **Presentation:** Jetpack Compose screens, navigation, reusable form controls and dashboard components.
- **Domain:** use cases and business rules for procurement pricing, retail pricing, subscriptions, billing, stock movements and ledger balances.
- **Data:** repositories, Room database, DAOs and data-transfer mappings. UI must not access database tables directly.
- **Platform:** Android notifications, share/print intents, file export and backup integration.

## Planned feature modules

1. `dashboard` — daily sales, litres procured/sold, cash collected, dues and stock summary.
2. `farmers` — farmer profiles, milk sessions, quality readings and payable ledger.
3. `procurement` — collection entries, FAT/SNF rate charts, purchase slips and intake stock movements.
4. `customers` — customer profiles, delivery address, price overrides and receivable ledger.
5. `sales` — counter sales, daily household sales and product line items.
6. `subscriptions` — recurring quantity/product schedules, pause/resume and holiday exceptions.
7. `delivery` — route sheets, assigned deliveries and delivered/skipped status.
8. `inventory` — products, units, batches where needed, stock adjustments and low-stock alerts.
9. `payments` — receipts, partial payments, advances and allocations against invoices.
10. `billing` — billing periods, invoice generation, adjustments and printable receipts.
11. `expenses` — operating expenses and categories.
12. `reports` — sales, procurement, gross margin, cash flow, receivables and payables.
13. `settings` — dairy profile, units, rate charts, backup and data export.

## Core data entities

- `Farmer`, `Customer`, `Product`, `UnitOfMeasure`
- `MilkCollection`, `QualityReading`, `ProcurementRateSlab`
- `Sale`, `SaleLine`, `Subscription`, `DeliveryRun`, `DeliveryItem`
- `StockMovement`, `Payment`, `PaymentAllocation`, `Invoice`, `InvoiceLine`
- `Expense`, `LedgerEntry`, `BusinessSettings`

## Accounting invariants

- Store quantities and money as decimal-safe values; do not use binary floating point for persisted financial calculations.
- Every posted sale creates a receivable/cash ledger effect and a stock movement when stock-tracked.
- Every procurement entry creates a farmer payable and an inward stock movement.
- Payments are immutable transactions; corrections use reversal/adjustment entries rather than silently overwriting history.
- Invoice totals are derived from persisted line items, taxes/discounts and explicit adjustments.
- Dashboard totals are derived from transactions, not independently editable counters.

## Offline-first rules

- Local Room database is the source of truth on the device.
- Every mutable record will have a stable ID, created/updated timestamps and sync state.
- Sync must be idempotent and conflict-aware before cloud sync is enabled.
- Export/backup must be available without requiring a cloud account.

## Delivery sequence

1. Android shell and navigation.
2. Room schema, repositories and seed settings.
3. Farmers and procurement with FAT/SNF rate calculation.
4. Customers, products and retail sales.
5. Ledgers, payments and billing.
6. Subscriptions, delivery and inventory.
7. Reports, export, backup, hardening and APK validation.
