# Cooknow Oil & Gas Business Management System (BMS)
### Interactive Operations Prototype for Cooknow &bull; Designed by FENUCS LTD

[![Specification Compliance](https://img.shields.io/badge/Business%20Rules-20%2F20%20PASS-emerald)](#automated-testing)
[![Domain](https://img.shields.io/badge/Domain-Oil%20%26%20Gas%20Operations-amber)](#oil--gas-product-domain)
[![Attribution](https://img.shields.io/badge/Attribution-Designed%20by%20FENUCS%20LTD-blue)](#about-fenucs-ltd)
[![Currency](https://img.shields.io/badge/Currency-NGN%20(%E2%82%A6)-blue)](#key-operational-modules)

---

## 1. Executive Summary & Purpose

The **Cooknow Oil & Gas Business Management System** is a responsive, browser-based commercial enterprise prototype **Designed by FENUCS LTD** for client **Cooknow**.

The platform provides unified management of:
1. **Refined Petroleum Reserves & Oilfield Hardware**: Accounting for the complete product lifecycle from refinery procurement (batch number, NMDPRA QA/QC certificate, depot tank location) to customer sales off-take with associated ticket IDs.
2. **Customer Accounts & Transaction Statements**: Unique customer IDs (`CUST-OG-xxx`) with instant audit statements of every historical transaction, waybill, and support ticket, plus 6 multi-criteria sorting modes.
3. **Standalone Synchronized Ticketing Desk**: Operates as a distinct sub-application that dynamically pulls live inventory balances and allows creating new customers directly from Ticketing with immediate registration into the central customer directory.
4. **Tanker Haulage & 7-Point Discrepancy Validation**: Real-time audit comparing waybill documents against sales contracts to block unauthorized discharges.

> **DEMO ENVIRONMENT NOTICE:** This application is an interactive prototype using authentic Nigerian energy and downstream petroleum data. It demonstrates end-to-end workflows, cross-module reactivity, and automated validation rules.

---

## 2. Oil & Gas Product Domain & Full Lifecycle

The system models downstream petroleum and upstream oilfield supply products:
- **Refined Petroleum**: Automotive Gas Oil (AGO Diesel 33,000L - 40,000L tanker consignments), Premium Motor Spirit (PMS Petrol), Dual Purpose Kerosene (DPK).
- **Liquefied Petroleum Gas (LPG)**: 70/30 Butane/Propane Mix in Metric Tonnes (MT).
- **Industrial Lubricants**: SAE 40 Trunk Piston Marine Engine Oil (200L drums).
- **Oilfield Hardware**: API 6A 10,000 PSI Flanged Gate Valves, OCTG Seamless Casing Pipes (9-5/8" P-110 BTC), Explosion-Proof ATEX Hydrocarbon Transfer Pump Skids, Custody Transfer Ultrasonic Gas Flow Meters, and Inconel 625 Ring Joint Gaskets.

### Complete Product Lifecycle Ledger
Every product includes a custody timeline accounting for:
- **Purchase Date & Buyer**: Who purchased the product and when.
- **Acquisition Cost**: Unit cost and total purchase expenditure in Nigerian Naira (₦).
- **Refinery QA/QC Cert**: NMDPRA inspection certificate number and batch reference.
- **Depot Storage**: Exact tank bay location (e.g. Tank Farm Bay 1 - Lekki Terminal, Warri Depot, Onne Free Zone).
- **Sales Off-Takes**: When it was sold, whom it was sold to, amount sold for, waybill number, and associated support ticket IDs.

---

## 3. Seven Principal Modules & Standalone Ticketing Sub-App

### Mode A: Oil & Gas Inventory Core
1. **Executive Dashboard (`DashboardModule`)**: Live KPI cards for reserve volumes, out-of-stock items, settled petroleum revenue, tanker dispatches, and open SLA tickets.
2. **Petroleum Inventory & Refineries (`InventoryModule`)**: Multi-tank catalog with unique SKUs (`CK-OG-1001` to `CK-OG-1011`), NMDPRA certificate tracking, stock reconciliations, and one-click "Inspect Lifecycle" timeline.
3. **Customer Accounts & Statement Reports (`CustomerModule`)**: Unique Customer IDs (`CUST-OG-101` to `CUST-OG-108`). Clicking any customer ID opens the full transaction audit statement modal. Includes 6 sorting modes:
   - Most Purchased (Highest Total Spend)
   - Least Purchased
   - Frequent Off-Takers (Order Count)
   - Recent Customers
   - Active / Inactive Status
   - Alphabetical (A-Z)
4. **Commercial Petroleum Orders & Receipts (`TransactionModule`)**: Sales contracts with immediate tank inventory deduction, VAT (7.5%), branded receipt printing, and clickable links to customer statements and product lifecycles.
5. **Waybills & Tanker Dispatch Verification (`WaybillModule`)**: 7-Point automated audit engine detecting volume and client discrepancies (e.g. pre-seeded mismatch `WB-8805-ERR`).
6. **Embedded Ticketing (`TicketingModule`)**: Issue triage, assignee routing, and resolution notes.
7. **Reports & Prototype Settings (`ReportsSettingsModule`)**: Financial valuation, CSV exports, General Ledger architectural schema, and demo controls.

### Mode B: Standalone Ticketing Portal App (`TicketingPortalApp`)
- Functions as its own dedicated sub-application while remaining synchronized with the Inventory Core.
- **Live Inventory Balance Pulling**: Support operators view real-time tank quantities, unit prices, and depot locations without leaving the ticketing desk.
- **Direct Customer Registration**: Register new industrial clients directly from Ticketing, instantly generating unique `CUST-OG-xxx` IDs and adding them to the central directory.
- **Cross-Entity Linking**: Link tickets to customer accounts, sales orders, waybills, and specific inventory products.

---

## 4. Technology Architecture

- **Frontend Framework**: React 19 with TypeScript.
- **Build Tool**: Vite 8 with ES2022 target.
- **Styling**: Tailwind CSS v4 with accessible high-contrast colors and print isolation.
- **Icons**: Lucide React.
- **State Management & Persistence**: React Context architecture (`AppContext`) with automatic serialization to browser `localStorage` (`cooknow_og_bms_v2_*` namespace).
- **Testing Engine**: Standalone TypeScript verification suite (`src/tests/businessRules.test.ts`) executable via `npx tsx` and in-browser via the UI audit modal.

---

## 5. Setup and Run Instructions

### Prerequisites
- Node.js (version 18+ or 20+ recommended)
- npm (version 9+ or 10+)

### Running in Development
```bash
# Install dependencies
npm install

# Start Vite development server (port 3000)
npm run dev
```
Open browser at `http://localhost:3000`.

### Production Build
```bash
# Compile and verify build
npm run build

# Preview build locally
npm run preview
```

### Running Automated Business Rule Tests
```bash
# Executes all 20 business rules (20/20 PASS)
npx tsx src/tests/businessRules.test.ts
```

---

## 6. Automated Testing: 20 Verified Business Rules

1. `Rule 01: Inventory items receive unique references` [✓ PASS]
2. `Rule 02: Invalid inventory quantities are rejected` [✓ PASS]
3. `Rule 03: Stock cannot be reduced below zero` [✓ PASS]
4. `Rule 04: Completing a transaction applies the intended stock movement once` [✓ PASS]
5. `Rule 05: Cancelling a completed transaction does not restore stock twice` [✓ PASS]
6. `Rule 06: Receipt totals match transaction totals` [✓ PASS]
7. `Rule 07: Waybills with matching required fields pass validation` [✓ PASS]
8. `Rule 08: Waybills with mismatched transaction references are flagged` [✓ PASS]
9. `Rule 09: Waybills with mismatched quantities are flagged` [✓ PASS]
10. `Rule 10: Duplicate waybill references are detected` [✓ PASS]
11. `Rule 11: Missing required waybill information is identified` [✓ PASS]
12. `Rule 12: Corrected waybills are revalidated` [✓ PASS]
13. `Rule 13: Tickets can be created, assigned, and updated` [✓ PASS]
14. `Rule 14: Resolved tickets no longer count as open` [✓ PASS]
15. `Rule 15: Dashboard metrics change when underlying records change` [✓ PASS]
16. `Rule 16: Report totals are derived from actual data` [✓ PASS]
17. `Rule 17: Demo data persists across refreshes if persistence is enabled` [✓ PASS]
18. `Rule 18: Resetting demo data requires confirmation` [✓ PASS]
19. `Rule 19: Search and filtering work` [✓ PASS]
20. `Rule 20: Receipt printing excludes the application navigation shell` [✓ PASS]

---

## 7. About FENUCS LTD

Designed by **FENUCS LTD** for prospective client **Cooknow**.
Target Delivery: Proposed 8-week production implementation cycle.
