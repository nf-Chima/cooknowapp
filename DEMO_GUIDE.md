# Presentation Script & Demonstration Walkthrough Guide
### Client Meeting: Cooknow Decision-Makers &bull; Presented by FENUCS GROUP LTD

This guide provides a step-by-step walkthrough script for demonstrating the **Cooknow Business Management System (BMS)** prototype. It highlights Cooknow's core operational needs while clearly explaining the prototype's boundaries.

---

## Preparation Before the Call / Presentation
1. Open the application in Google Chrome or another modern browser.
2. Ensure you have clicked **"Reset Demo Data"** to load the clean benchmark seed data.
3. Notice the top banner: **"Interactive Demonstration Walkthrough Guide"** is available at any time to instantly navigate across Scenarios A through E.

---

## Step-by-Step Demonstration Script

### Step 1: Welcome & Dashboard Introduction (2 mins)
- **Action**: Open the **Dashboard**.
- **What to say**:
  > *"Good morning / afternoon team Cooknow. On behalf of FENUCS GROUP LTD, we are pleased to demonstrate the interactive prototype of the Cooknow Business Management System. We engineered this prototype to validate your day-to-day operations: managing commercial kitchen inventory, issuing sales transactions and receipts, verifying dispatch waybills, and handling customer issues in one unified platform."*
- **Highlight**:
  - Show the 8 live KPI cards: total inventory units (131 units), low-stock warnings, completed revenue in Nigerian Naira (₦), active fleet dispatches, and open support tickets.
  - Point out that every number on this screen is calculated dynamically from real application state.

---

### Step 2: Warehouse Inventory Inspection (2 mins)
- **Action**: Navigate to **Inventory & Suppliers**.
- **What to say**:
  > *"Here is your central warehouse inventory catalog. Notice each item has a unique stock SKU, such as CK-STK-1001 for heavy-duty induction ranges, its category, wholesale cost, selling price in Naira, and real-time stock levels."*
- **Demonstration**:
  - Point out `CK-STK-1002` (Double-Door Stainless Chiller): stock is 4 units, marked with an amber **"Low Stock"** badge because it is below the threshold of 5.
  - Point out `CK-STK-1010` (Kitchen Fire Suppression Canopy): stock is 0 units, marked with a red **"Out of Stock"** badge.
  - Click **"Stock Movements History"** tab to show the traceable ledger where every stock addition, sales deduction, and adjustment is recorded with timestamps and operator names.

---

### Step 3: Scenario A — Customer Selection, Sale & Stock Deduction (3 mins)
- **Action**: Navigate to **Transactions & Receipts** and click **"+ New Sales Order"**.
- **What to say**:
  > *"Let's simulate a corporate sale. We select client Grand Pavilion Hotel & Suites, and choose 2 units of the Commercial Induction Cooktop."*
- **Demonstration**:
  - Select client: `Grand Pavilion Hotel & Suites`.
  - Add items: 2x Commercial Induction Cooktop (`CK-STK-1001`).
  - Set status to **"Completed"** and payment to **"Paid — Demo Only"**.
  - Notice the live price calculation: subtotal, demo VAT (7.5%), and total in ₦.
  - Click **"Confirm Sales Order & Generate Receipt"**.
  - **Result**: The order is recorded immediately!

---

### Step 4: Official Receipt Generation & Printing (2 mins)
- **Action**: In the receipt modal that automatically opens (or by clicking **"View Receipt"** on the new transaction):
- **What to say**:
  > *"When an order is completed, the system automatically generates an official Cooknow commercial sales receipt with receipt number, itemized quantities, unit prices, total in Naira, customer delivery details, and operator name. It includes a clear demonstration watermark. Notice the print button."*
- **Demonstration**:
  - Click **"Print Receipt"**. The browser print dialog opens with `@media print` styling: the dark sidebar and application headers are completely stripped out, leaving a clean, crisp, professional physical paper receipt.
  - Return to **Inventory**: show how `CK-STK-1001` inventory was automatically decremented by 2 units!

---

### Step 5: Scenario B — Fleet Dispatch & Valid Waybill Verification (2 mins)
- **Action**: Navigate to **Waybills & Deliveries**.
- **What to say**:
  > *"One of Cooknow's highest-priority requirements was eliminating mistakes and fraud in waybill dispatch. Our system includes a deterministic 7-point validation engine."*
- **Demonstration**:
  - Show Waybill `WB-8801-A` (dispatched to Grand Pavilion Hotel).
  - Click the **Eye icon ("Inspect 7-Point Audit Details")**.
  - Show the 7 checkmarks: Transaction Reference Exists (✓), Customer Identity Match (✓), Reference Uniqueness (✓), Item & Quantity Match (✓), Mandatory Fields (✓), Permitted Status (✓), and No Prior Duplicate (✓). Status is green: **"Validation Passed"**.

---

### Step 6: Scenario C — Deliberate Incorrect Waybill & Discrepancy Alert (3 mins)
- **Action**: Look at flagged record `WB-8805-ERR` in the Waybills table (or click **"Scenario C"** in the top walkthrough bar).
- **What to say**:
  > *"Now, observe what happens when a waybill is incorrect or uploaded with mismatched details. Here is waybill WB-8805-ERR, which references order TRX-8805."*
- **Demonstration**:
  - Notice the prominent amber/red discrepancy alert card.
  - Click **"Inspect 7-Point Audit Details"**:
    - **Issue 1**: *Customer Mismatch* — The waybill names 'Buka Delight Food Hub Ltd', but sales order TRX-8805 belongs to 'Atlantic Ocean View Resort'!
    - **Issue 2**: *Quantity Discrepancy* — The waybill entered 4 ice makers, but the authorized order authorized exactly 2 units!
  - Click **"1-Click Escalate to Ticketing"**:
    - Notice how the system automatically creates an urgent ticket linked directly to `WB-8805-ERR` and `TRX-8805`, assigning it to the operations team for warehouse audit!
  - Show how to click **"Edit & Revalidate Record"**:
    - Change customer to Atlantic Ocean View Resort and quantity to 2 units.
    - Click **"Submit & Revalidate"** &rarr; The engine immediately clears the discrepancy and marks the waybill as **"Validation Passed"**!

---

### Step 7: Scenario D — Customer Issue Management & Telephony Preview (3 mins)
- **Action**: Navigate to **Ticketing & Support**.
- **What to say**:
  > *"When complaints or logistics delays arise, Cooknow staff can triage, assign, and track resolution in the integrated ticketing desk."*
- **Demonstration**:
  - Open Ticket `TCK-501` (Interstate Delivery Delay for Chiller to Abuja).
  - Point out the customer phone number and click **"Simulate Call"**.
  - Show the telephony simulator: ringing animation, live timer, and call disposition notes. Log the call notes.
  - Click **"Resolve Ticket"**:
    - Demonstrate our business rule: you *cannot* resolve a ticket without entering detailed resolution notes.
    - Type: *"Haulage delivery arrived in Abuja CBD; equipment unboxed and calibrated with chef."*
    - Click **"Confirm Resolution"** &rarr; Notice the ticket is marked **Resolved**, and open ticket count on the sidebar decreases immediately!

---

### Step 8: Scenario E — Executive Reports & Architecture (2 mins)
- **Action**: Navigate to **Reports & Settings**.
- **What to say**:
  > *"Executive management can access real-time valuation reports and export CSVs for accounting analysis."*
- **Demonstration**:
  - Show Wholesale Inventory Valuation, Retail Spread, and Waybill Compliance Percentage.
  - Click **"Export Executive Summary CSV"** to show instant data download.
  - Switch to the **"Accounting & General Ledger (Planned)"** tab:
    - Explain that Cooknow's accounting software (QuickBooks, Sage 50, SAP) will be confirmed before production.
    - Show the conceptual double-entry journal preview: Debit Accounts Receivable, Credit Equipment Revenue, Output VAT, and Debit COGS / Credit Inventory.

---

### Step 9: Prototype Boundaries & Next Steps (2 mins)
- **Summary for Cooknow**:
  - Review what is working today: 100% of the 7 principal modules, inventory deduction, receipt printing, 7-point waybill validation, and ticketing.
  - Review production scope: database hosting on PostgreSQL, OAuth authentication, live Paystack webhook listening, and Twilio telephony integration.
  - Reiterate proposed 8-week production delivery timeframe upon agreement on scope.
  - Open floor for Cooknow stakeholder feedback and questions.
