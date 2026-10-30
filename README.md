# MilkyRaman

Android-first dairy business management for a single-owner operation covering both milk procurement and retail distribution.

## Product scope
- Farmer and supplier registry
- Milk procurement with quantity, FAT/SNF, rate-chart calculation and farmer ledger
- Retail customers, customer-specific pricing and daily sales
- Recurring subscriptions and delivery planning
- Payments, advances, outstanding balances and monthly billing
- Product catalogue and inventory
- Expenses, business reports, exports and backup

## Technology
- Kotlin and Jetpack Compose
- Android min SDK 24; compile/target SDK 35
- Room is included as the planned local persistence layer
- Offline-first design; cloud backup/synchronisation is a later milestone

## Build
Open this repository in Android Studio with JDK 17 and Android SDK 35, then run the `app` configuration. The Gradle wrapper will be added when the build environment is configured.

## Current status
Version 0.1.0 is the initial UI and project foundation. Dashboard metrics are placeholders; business workflows and persistence are not yet implemented.
