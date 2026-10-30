# MilkyRaman feature research and product decisions

Research reviewed on 30 October 2026.

## Reference products and patterns
- Simple Dairy: customer-specific pricing, subscriptions, leave/vacation handling, WhatsApp invoices, counter POS, stock, route loads and expense reporting.
- Milk Sarthi: AM/PM milk purchase and sale, fixed or FAT/SNF rates, farmer/customer ledgers, thermal slips, day book and PDF sharing.
- Dairywala: offline-first collection, duplicate-entry prevention, machine-assisted readings, statements and multiple Indian languages.
- Dhenu: farmer-to-centre transparency, quality readings, dispatch reconciliation, advances and payout cycles.
- Android Developers offline-first guidance: local data for critical reads/writes, repository-mediated data access and network-aware sync.

## MilkyRaman MVP requirements
1. Farmer and customer master records with searchable names and phone numbers.
2. Procurement entries for AM/PM, cow/buffalo/mixed milk, quantity, FAT, SNF, rate and amount.
3. Configurable pricing modes: fixed rate and configurable FAT/SNF rate chart. Never hardcode a universal dairy formula.
4. Retail sales with customer-specific rates, product lines and immediate ledger impact.
5. Receipts, farmer payouts, advances, partial payments and payment method/reference.
6. Inventory movement from procurement, sales, spoilage and manual adjustment.
7. Subscription schedules, delivery lists, skipped/extra delivery handling and monthly invoice generation.
8. Expense capture and reports: day book, party ledger, procurement vs sales, dues, stock and gross margin.
9. PDF/CSV exports, WhatsApp share intent and Bluetooth thermal printing.
10. Local backup/restore, optional cloud sync, app lock and audit history.

## UI principles
- Dashboard prioritises today's procurement, retail litres, sales value, collections and pending dues.
- Primary actions reachable in one tap: Milk Buy, Milk Sell, Payment, Customer and Farmer.
- Entry screens default to current date and last-used shift, with large numeric quantity/FAT/SNF fields.
- Show rate and total live before saving; show a clear saved receipt afterwards.
- Keep procurement and retail ledgers distinct while providing a consolidated business overview.
- Restrained dairy-green accents, warm neutral surfaces, clear typography and high-contrast numeric totals.
- Avoid decorative charts on data-entry screens; use charts on reports.

## Engineering rules
- Persist money and quantity as decimal strings or scaled integers; avoid Double for financial calculations.
- Keep pricing logic pure and unit-testable.
- Room is the local persistence source of truth. UI observes Flows; writes go through repositories/use cases.
- Use unique entry IDs and validation to prevent accidental duplicate entries.
- Do not silently overwrite posted financial records; use reversal/adjustment records.
- Cloud sync must be idempotent, retryable and conflict-aware before being enabled.
- Keep backup/export available without internet.

## Source links
- https://simpledairy.com/
- https://milksarthiapp.in/features.php
- https://www.dairywala.in/
- https://play.google.com/store/apps/details?id=com.quartex.dhenu
- https://developer.android.com/topic/architecture/data-layer/offline-first
