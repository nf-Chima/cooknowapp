import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  InventoryItem,
  Supplier,
  Customer,
  Transaction,
  Waybill,
  Ticket,
  StockMovement,
  AuditActivity,
  DemoRole,
  TransactionStatus,
  PaymentStatus,
  ValidationResult,
  ProductSaleRecord,
  TicketCategory,
  TicketPriority,
  TicketComment,
  WaybillReceiptData,
} from '../types';
import {
  SEED_INVENTORY,
  SEED_SUPPLIERS,
  SEED_CUSTOMERS,
  SEED_TRANSACTIONS,
  SEED_WAYBILLS,
  SEED_TICKETS,
  SEED_STOCK_MOVEMENTS,
  SEED_AUDIT_LOGS,
} from '../data/seedData';
import { validateWaybill } from '../services/waybillValidator';
import { generateRef } from '../utils/formatters';

const STORAGE_KEY_PREFIX = 'cooknow_og_bms_v2_';

export type AppMode = 'inventory_core' | 'ticketing_desk';

interface AppContextType {
  // App switcher
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;

  // Entities
  inventory: InventoryItem[];
  suppliers: Supplier[];
  customers: Customer[];
  transactions: Transaction[];
  waybills: Waybill[];
  tickets: Ticket[];
  stockMovements: StockMovement[];
  auditLogs: AuditActivity[];

  // Demo controls
  currentRole: DemoRole;
  setCurrentRole: (role: DemoRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;

  // Selected for modals / views
  activeReceiptTransaction: Transaction | null;
  setActiveReceiptTransaction: (tx: Transaction | null) => void;
  simulatedCallCustomer: { name: string; phone: string; context?: string } | null;
  setSimulatedCallCustomer: (data: { name: string; phone: string; context?: string } | null) => void;
  inspectedCustomerId: string | null;
  setInspectedCustomerId: (id: string | null) => void;
  inspectedProductLifecycleId: string | null;
  setInspectedProductLifecycleId: (id: string | null) => void;

  // Inventory actions
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated' | 'status' | 'lifecycle'> & { batchNumber?: string; depotLocation?: string; purchasedBy?: string }) => { success: boolean; message: string };
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => { success: boolean; message: string };
  adjustStock: (itemId: string, adjustmentQty: number, reason: string) => { success: boolean; message: string };

  // Supplier actions
  addSupplier: (supplier: Omit<Supplier, 'id'>) => { success: boolean; message: string };

  // Customer actions
  addCustomer: (customer: Omit<Customer, 'id' | 'dateRegistered' | 'totalSpend'>) => { success: boolean; message: string; customer?: Customer };
  updateCustomer: (id: string, updates: Partial<Customer>) => { success: boolean; message: string };

  // Transaction actions
  createTransaction: (data: {
    customerId: string;
    items: { itemId: string; quantity: number }[];
    discount?: number;
    paymentStatus: PaymentStatus;
    transactionStatus: TransactionStatus;
    deliveryAddress: string;
    associatedTicketId?: string;
    notes?: string;
  }) => { success: boolean; message: string; transaction?: Transaction };
  updateTransactionStatus: (id: string, status: TransactionStatus, paymentStatus?: PaymentStatus) => { success: boolean; message: string };

  // Waybill actions
  createWaybill: (waybill: Omit<Waybill, 'id' | 'validationStatus' | 'discrepancyDetails' | 'lastValidatedAt'>) => {
    success: boolean;
    message: string;
    validation: ValidationResult;
    waybill?: Waybill;
  };
  updateWaybill: (id: string, updates: Partial<Waybill>) => {
    success: boolean;
    message: string;
    validation: ValidationResult;
  };
  revalidateWaybillById: (id: string) => ValidationResult;

  // Ticket actions
  createTicket: (ticket: {
    customerId?: string;
    category: TicketCategory;
    subject: string;
    description: string;
    priority: TicketPriority;
    assignedStaff: string;
    relatedTransactionRef?: string;
    relatedWaybillNumber?: string;
    relatedProductId?: string;
    relatedPreviousTicketRef?: string;
    purchaseOrderDetails?: {
      productId: string;
      productName: string;
      requestedQuantity: number;
      unit: string;
      estimatedAmount: number;
    };
  }) => { success: boolean; message: string; ticket?: Ticket };
  updateTicket: (id: string, updates: Partial<Ticket>) => { success: boolean; message: string };
  updateTicketPriority: (ticketId: string, priority: TicketPriority, reason?: string) => { success: boolean; message: string };
  closeTicket: (ticketId: string, closedBy: 'Support Team' | 'Customer', notes: string) => { success: boolean; message: string };
  uploadWaybillReceiptToTicket: (ticketId: string, receiptData: WaybillReceiptData) => { success: boolean; message: string };
  addTicketComment: (
    ticketId: string,
    text: string,
    isInternal?: boolean,
    channel?: 'WhatsApp' | 'Email' | 'Portal'
  ) => { success: boolean; message: string; notificationMsg?: string };
  resolveTicket: (ticketId: string, resolutionNotes: string) => { success: boolean; message: string };

  // Demo resets
  resetAllDemoData: () => void;
  loadScenario: (scenarioKey: 'A' | 'B' | 'C' | 'D' | 'E') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.warn('LocalStorage error:', err);
  }
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appMode, setAppMode] = useState<AppMode>('inventory_core');
  const [inventory, setInventory] = useState<InventoryItem[]>(() => getStored('inventory', SEED_INVENTORY));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => getStored('suppliers', SEED_SUPPLIERS));
  const [customers, setCustomers] = useState<Customer[]>(() => getStored('customers', SEED_CUSTOMERS));
  const [transactions, setTransactions] = useState<Transaction[]>(() => getStored('transactions', SEED_TRANSACTIONS));
  const [waybills, setWaybills] = useState<Waybill[]>(() => getStored('waybills', SEED_WAYBILLS));
  const [tickets, setTickets] = useState<Ticket[]>(() => getStored('tickets', SEED_TICKETS));
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => getStored('stock_movements', SEED_STOCK_MOVEMENTS));
  const [auditLogs, setAuditLogs] = useState<AuditActivity[]>(() => getStored('audit_logs', SEED_AUDIT_LOGS));

  const [currentRole, setCurrentRole] = useState<DemoRole>('Administrator');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [globalSearch, setGlobalSearch] = useState<string>('');

  const [activeReceiptTransaction, setActiveReceiptTransaction] = useState<Transaction | null>(null);
  const [simulatedCallCustomer, setSimulatedCallCustomer] = useState<{ name: string; phone: string; context?: string } | null>(null);
  const [inspectedCustomerId, setInspectedCustomerId] = useState<string | null>(null);
  const [inspectedProductLifecycleId, setInspectedProductLifecycleId] = useState<string | null>(null);

  // Sync to storage
  useEffect(() => setStored('inventory', inventory), [inventory]);
  useEffect(() => setStored('suppliers', suppliers), [suppliers]);
  useEffect(() => setStored('customers', customers), [customers]);
  useEffect(() => setStored('transactions', transactions), [transactions]);
  useEffect(() => setStored('waybills', waybills), [waybills]);
  useEffect(() => setStored('tickets', tickets), [tickets]);
  useEffect(() => setStored('stock_movements', stockMovements), [stockMovements]);
  useEffect(() => setStored('audit_logs', auditLogs), [auditLogs]);

  // Log audit helper
  const addAuditLog = (
    module: AuditActivity['module'],
    type: AuditActivity['type'],
    title: string,
    description: string
  ) => {
    const newLog: AuditActivity = {
      id: `ACT-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      module,
      type,
      title,
      description,
      user: `Operations Officer (${currentRole})`,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // --- INVENTORY ACTIONS ---
  const addInventoryItem = (data: Omit<InventoryItem, 'id' | 'lastUpdated' | 'status' | 'lifecycle'> & { batchNumber?: string; depotLocation?: string; purchasedBy?: string }) => {
    if (!data.name || !data.stockRef || data.quantity < 0) {
      return { success: false, message: 'Invalid inventory details or negative quantity.' };
    }
    // Check unique stockRef
    if (inventory.some(i => i.stockRef.toUpperCase() === data.stockRef.toUpperCase())) {
      return { success: false, message: `Product reference '${data.stockRef}' already exists.` };
    }

    const status = data.quantity === 0 ? 'Out of Stock' : data.quantity <= data.reorderThreshold ? 'Low Stock' : 'In Stock';
    const newId = `INV-OG-${Date.now().toString().slice(-4)}`;

    const newItem: InventoryItem = {
      ...data,
      id: newId,
      status,
      lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
      lifecycle: {
        purchaseDate: data.purchaseDate || new Date().toISOString().split('T')[0],
        purchasedBy: data.purchasedBy || `Procurement Desk (${currentRole})`,
        purchaseCostUnit: data.costPrice,
        totalPurchaseCost: data.costPrice * data.quantity,
        supplierId: data.supplierId,
        supplierName: data.supplierName,
        batchNumber: data.batchNumber || `BATCH-OG-${Date.now().toString().slice(-4)}`,
        inspectionCertNumber: `NMDPRA/QC/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}`,
        depotTankLocation: data.depotLocation || 'Central Depot Tank Farm',
        initialQuantityReceived: data.quantity,
        currentAvailableQuantity: data.quantity,
        totalQuantityDispatched: 0,
        qaQcTestStatus: 'Passed - NMDPRA Certified',
        salesHistory: [],
        linkedTickets: [],
      },
    };

    setInventory(prev => [newItem, ...prev]);

    // Record initial stock movement
    const movement: StockMovement = {
      id: `MOV-${Date.now()}`,
      itemId: newItem.id,
      itemRef: newItem.stockRef,
      itemName: newItem.name,
      movementType: 'Stock Received',
      quantity: newItem.quantity,
      previousQty: 0,
      newQty: newItem.quantity,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      reference: 'INBOUND-DEPOT',
      operator: `Operations Officer (${currentRole})`,
      notes: `Depot receipt & QA certification: ${newItem.lifecycle.batchNumber}`,
    };
    setStockMovements(prev => [movement, ...prev]);

    addAuditLog('Inventory', 'create', `Product Registered: ${newItem.name}`, `Added ${newItem.quantity} ${newItem.unitOfMeasure} with full lifecycle tracking.`);
    return { success: true, message: `Product '${newItem.name}' registered into inventory lifecycle successfully.` };
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    const existing = inventory.find(i => i.id === id);
    if (!existing) return { success: false, message: 'Product not found.' };

    const updatedQty = updates.quantity !== undefined ? updates.quantity : existing.quantity;
    if (updatedQty < 0) {
      return { success: false, message: 'Stock quantity cannot be negative.' };
    }

    const reorder = updates.reorderThreshold !== undefined ? updates.reorderThreshold : existing.reorderThreshold;
    const newStatus = updatedQty === 0 ? 'Out of Stock' : updatedQty <= reorder ? 'Low Stock' : 'In Stock';

    setInventory(prev =>
      prev.map(i =>
        i.id === id
          ? {
              ...i,
              ...updates,
              quantity: updatedQty,
              status: newStatus,
              lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
              lifecycle: {
                ...i.lifecycle,
                currentAvailableQuantity: updatedQty,
              },
            }
          : i
      )
    );

    addAuditLog('Inventory', 'update', `Updated ${existing.name}`, 'Product details or specifications updated.');
    return { success: true, message: 'Product updated successfully.' };
  };

  const adjustStock = (itemId: string, adjustmentQty: number, reason: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return { success: false, message: 'Product not found.' };

    const newQty = item.quantity + adjustmentQty;
    if (newQty < 0) {
      return {
        success: false,
        message: `Adjustment denied: Current depot stock is ${item.quantity}. Cannot reduce by ${Math.abs(adjustmentQty)}. Negative stock prohibited.`,
      };
    }

    const newStatus = newQty === 0 ? 'Out of Stock' : newQty <= item.reorderThreshold ? 'Low Stock' : 'In Stock';

    setInventory(prev =>
      prev.map(i =>
        i.id === itemId
          ? {
              ...i,
              quantity: newQty,
              status: newStatus,
              lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
              lifecycle: {
                ...i.lifecycle,
                currentAvailableQuantity: newQty,
              },
            }
          : i
      )
    );

    const movement: StockMovement = {
      id: `MOV-${Date.now()}`,
      itemId: item.id,
      itemRef: item.stockRef,
      itemName: item.name,
      movementType: 'Stock Adjustment',
      quantity: adjustmentQty,
      previousQty: item.quantity,
      newQty: newQty,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      reference: 'DEPOT-DIP-ADJ',
      operator: `Depot Officer (${currentRole})`,
      notes: reason || 'Tank dipping & temperature reconciliation.',
    };
    setStockMovements(prev => [movement, ...prev]);

    addAuditLog('Inventory', 'status_change', `Depot Stock Adjusted: ${item.name}`, `Adjusted by ${adjustmentQty > 0 ? '+' : ''}${adjustmentQty} ${item.unitOfMeasure}. Reason: ${reason}`);
    return { success: true, message: `Stock for '${item.name}' updated to ${newQty} ${item.unitOfMeasure}.` };
  };

  // --- SUPPLIER ACTIONS ---
  const addSupplier = (data: Omit<Supplier, 'id'>) => {
    const newSup: Supplier = {
      ...data,
      id: `SUP-OG-${Date.now().toString().slice(-4)}`,
    };
    setSuppliers(prev => [...prev, newSup]);
    addAuditLog('Inventory', 'create', `Supplier Registered: ${newSup.name}`, `Reference: ${newSup.supplierRef}`);
    return { success: true, message: 'Supplier registered successfully.' };
  };

  // --- CUSTOMER ACTIONS (Shared across Inventory Core and Ticketing Desk) ---
  const addCustomer = (data: Omit<Customer, 'id' | 'dateRegistered' | 'totalSpend'>) => {
    // Unique identifier e.g. CUST-OG-109
    const newCustId = `CUST-OG-${Date.now().toString().slice(-3)}`;
    const newCust: Customer = {
      ...data,
      id: newCustId,
      dateRegistered: new Date().toISOString().split('T')[0],
      totalSpend: 0,
      industrySector: data.industrySector || 'Energy & Utilities',
    };
    setCustomers(prev => [newCust, ...prev]);
    addAuditLog('Customers', 'create', `Customer Created: ${newCust.name}`, `Assigned Unique ID: ${newCust.id}. Synced to Inventory System.`);
    return { success: true, message: `Customer registered successfully with Unique ID: ${newCust.id}. Available across Inventory & Ticketing.`, customer: newCust };
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
    addAuditLog('Customers', 'update', `Customer Updated`, `Record ${id} profile modified.`);
    return { success: true, message: 'Customer profile updated.' };
  };

  // --- TRANSACTION ACTIONS (Links to Product Lifecycle) ---
  const createTransaction = (data: {
    customerId: string;
    items: { itemId: string; quantity: number }[];
    discount?: number;
    paymentStatus: PaymentStatus;
    transactionStatus: TransactionStatus;
    deliveryAddress: string;
    associatedTicketId?: string;
    notes?: string;
  }) => {
    const customer = customers.find(c => c.id === data.customerId);
    if (!customer) return { success: false, message: 'Customer not found.' };

    if (!data.items || data.items.length === 0) {
      return { success: false, message: 'At least one line item is required.' };
    }

    // Validate quantities and stock availability
    const lineItems: Transaction['items'] = [];
    let subtotal = 0;

    for (const reqItem of data.items) {
      if (reqItem.quantity <= 0) {
        return { success: false, message: 'Line item quantity must be greater than zero.' };
      }
      const invItem = inventory.find(i => i.id === reqItem.itemId);
      if (!invItem) return { success: false, message: `Product ID ${reqItem.itemId} not found.` };

      // If status is 'Completed', verify sufficient stock
      if (data.transactionStatus === 'Completed' && invItem.quantity < reqItem.quantity) {
        return {
          success: false,
          message: `Insufficient stock for '${invItem.name}'. Requested ${reqItem.quantity} ${invItem.unitOfMeasure}, but only ${invItem.quantity} available in depot.`,
        };
      }

      const lineTotal = invItem.sellingPrice * reqItem.quantity;
      subtotal += lineTotal;
      lineItems.push({
        itemId: invItem.id,
        stockRef: invItem.stockRef,
        itemName: invItem.name,
        quantity: reqItem.quantity,
        unit: invItem.unitOfMeasure,
        unitPrice: invItem.sellingPrice,
        lineTotal,
      });
    }

    const discount = data.discount || 0;
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Math.round(taxableAmount * 0.075); // 7.5% demo VAT
    const totalAmount = taxableAmount + tax;

    const txRef = generateRef('TRX-OG', 4);
    const txId = `TX-OG-${Date.now().toString().slice(-4)}`;
    const shouldDeductStock = data.transactionStatus === 'Completed';

    const newTx: Transaction = {
      id: txId,
      reference: txRef,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      date: new Date().toISOString().split('T')[0],
      items: lineItems,
      subtotal,
      discount,
      tax,
      totalAmount,
      paymentStatus: data.paymentStatus,
      transactionStatus: data.transactionStatus,
      operator: `Operations Officer (${currentRole})`,
      stockDeducted: shouldDeductStock,
      notes: data.notes || '',
      deliveryAddress: data.deliveryAddress || customer.address,
      associatedTicketId: data.associatedTicketId,
      receiptNumber: shouldDeductStock ? `RCP-${txRef}` : undefined,
    };

    // Deduct stock & append to Product Lifecycle Sales History if Completed
    if (shouldDeductStock) {
      setInventory(prev =>
        prev.map(invItem => {
          const matched = lineItems.find(li => li.itemId === invItem.id);
          if (!matched) return invItem;
          const newQty = invItem.quantity - matched.quantity;
          const newStatus = newQty === 0 ? 'Out of Stock' : newQty <= invItem.reorderThreshold ? 'Low Stock' : 'In Stock';

          // Record sale into product lifecycle!
          const saleRecord: ProductSaleRecord = {
            id: `SALE-${Date.now()}-${invItem.id}`,
            transactionRef: txRef,
            saleDate: newTx.date,
            customerId: customer.id,
            customerName: customer.name,
            quantitySold: matched.quantity,
            unit: matched.unit,
            unitSellingPrice: matched.unitPrice,
            totalSalesAmount: matched.lineTotal,
            associatedWaybillNumber: `WB-${txRef}`,
            associatedTicketId: data.associatedTicketId,
            operator: `Operations Officer (${currentRole})`,
          };

          return {
            ...invItem,
            quantity: newQty,
            status: newStatus,
            lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
            lifecycle: {
              ...invItem.lifecycle,
              currentAvailableQuantity: newQty,
              totalQuantityDispatched: invItem.lifecycle.totalQuantityDispatched + matched.quantity,
              salesHistory: [saleRecord, ...invItem.lifecycle.salesHistory],
              linkedTickets: data.associatedTicketId && !invItem.lifecycle.linkedTickets.includes(data.associatedTicketId)
                ? [data.associatedTicketId, ...invItem.lifecycle.linkedTickets]
                : invItem.lifecycle.linkedTickets,
            },
          };
        })
      );

      // Record stock movements
      const newMovements: StockMovement[] = lineItems.map(li => {
        const invItem = inventory.find(i => i.id === li.itemId)!;
        return {
          id: `MOV-${Date.now()}-${li.itemId}`,
          itemId: li.itemId,
          itemRef: li.stockRef,
          itemName: li.itemName,
          movementType: 'Stock Issued (Sale)',
          quantity: -li.quantity,
          previousQty: invItem.quantity,
          newQty: invItem.quantity - li.quantity,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          reference: txRef,
          operator: `Operations Officer (${currentRole})`,
          notes: `Commercial dispatch to ${customer.name}${data.associatedTicketId ? ` (Linked Ticket: ${data.associatedTicketId})` : ''}`,
        };
      });
      setStockMovements(prev => [...newMovements, ...prev]);

      // Update customer total spend
      setCustomers(prev =>
        prev.map(c => (c.id === customer.id ? { ...c, totalSpend: c.totalSpend + totalAmount } : c))
      );
    }

    setTransactions(prev => [newTx, ...prev]);
    addAuditLog('Transactions', 'create', `Order ${txRef} Created`, `Total: ₦${totalAmount.toLocaleString()} (${newTx.transactionStatus}) for ${customer.name}`);

    return {
      success: true,
      message: `Transaction ${txRef} created successfully.${shouldDeductStock ? ' Product lifecycle updated and receipt generated.' : ''}`,
      transaction: newTx,
    };
  };

  const updateTransactionStatus = (id: string, newStatus: TransactionStatus, paymentStatus?: PaymentStatus) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return { success: false, message: 'Transaction not found.' };

    const oldStatus = tx.transactionStatus;
    if (oldStatus === newStatus && (!paymentStatus || tx.paymentStatus === paymentStatus)) {
      return { success: true, message: 'No change made.' };
    }

    let stockDeducted = tx.stockDeducted;

    // Transition to Completed: Deduct stock & log into product lifecycle
    if (newStatus === 'Completed' && !tx.stockDeducted) {
      for (const line of tx.items) {
        const item = inventory.find(i => i.id === line.itemId);
        if (!item || item.quantity < line.quantity) {
          return {
            success: false,
            message: `Cannot complete order: Insufficient stock for ${line.itemName}. Need ${line.quantity}, available ${item?.quantity ?? 0}.`,
          };
        }
      }

      setInventory(prev =>
        prev.map(item => {
          const line = tx.items.find(l => l.itemId === item.id);
          if (!line) return item;
          const newQty = item.quantity - line.quantity;
          const status = newQty === 0 ? 'Out of Stock' : newQty <= item.reorderThreshold ? 'Low Stock' : 'In Stock';

          const saleRecord: ProductSaleRecord = {
            id: `SALE-${Date.now()}-${item.id}`,
            transactionRef: tx.reference,
            saleDate: new Date().toISOString().split('T')[0],
            customerId: tx.customerId,
            customerName: tx.customerName,
            quantitySold: line.quantity,
            unit: line.unit,
            unitSellingPrice: line.unitPrice,
            totalSalesAmount: line.lineTotal,
            associatedWaybillNumber: `WB-${tx.reference}`,
            associatedTicketId: tx.associatedTicketId,
            operator: `Operations Officer (${currentRole})`,
          };

          return {
            ...item,
            quantity: newQty,
            status,
            lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
            lifecycle: {
              ...item.lifecycle,
              currentAvailableQuantity: newQty,
              totalQuantityDispatched: item.lifecycle.totalQuantityDispatched + line.quantity,
              salesHistory: [saleRecord, ...item.lifecycle.salesHistory],
            },
          };
        })
      );

      const movements: StockMovement[] = tx.items.map(line => {
        const item = inventory.find(i => i.id === line.itemId)!;
        return {
          id: `MOV-${Date.now()}-${line.itemId}`,
          itemId: line.itemId,
          itemRef: line.stockRef,
          itemName: line.itemName,
          movementType: 'Stock Issued (Sale)',
          quantity: -line.quantity,
          previousQty: item.quantity,
          newQty: item.quantity - line.quantity,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          reference: tx.reference,
          operator: `Operations Officer (${currentRole})`,
          notes: `Order fulfillment for ${tx.customerName}`,
        };
      });
      setStockMovements(prev => [...movements, ...prev]);
      stockDeducted = true;
    }

    // Transition to Cancelled: Restore stock once
    if (newStatus === 'Cancelled' && tx.stockDeducted) {
      setInventory(prev =>
        prev.map(item => {
          const line = tx.items.find(l => l.itemId === item.id);
          if (!line) return item;
          const newQty = item.quantity + line.quantity;
          const status = newQty === 0 ? 'Out of Stock' : newQty <= item.reorderThreshold ? 'Low Stock' : 'In Stock';
          return {
            ...item,
            quantity: newQty,
            status,
            lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
            lifecycle: {
              ...item.lifecycle,
              currentAvailableQuantity: newQty,
              totalQuantityDispatched: Math.max(0, item.lifecycle.totalQuantityDispatched - line.quantity),
            },
          };
        })
      );

      const restoreMovements: StockMovement[] = tx.items.map(line => {
        const item = inventory.find(i => i.id === line.itemId)!;
        return {
          id: `MOV-${Date.now()}-REV-${line.itemId}`,
          itemId: line.itemId,
          itemRef: line.stockRef,
          itemName: line.itemName,
          movementType: 'Stock Restored (Cancelled Sale)',
          quantity: line.quantity,
          previousQty: item.quantity,
          newQty: item.quantity + line.quantity,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          reference: tx.reference,
          operator: `Operations Officer (${currentRole})`,
          notes: `Automatic inventory restoration on cancellation of ${tx.reference}`,
        };
      });
      setStockMovements(prev => [...restoreMovements, ...prev]);
      stockDeducted = false;
    }

    const updatedTx: Transaction = {
      ...tx,
      transactionStatus: newStatus,
      paymentStatus: paymentStatus || tx.paymentStatus,
      stockDeducted,
      receiptNumber: newStatus === 'Completed' && !tx.receiptNumber ? `RCP-${tx.reference}` : tx.receiptNumber,
    };

    setTransactions(prev => prev.map(t => (t.id === id ? updatedTx : t)));
    addAuditLog('Transactions', 'status_change', `Order ${tx.reference} Status Updated`, `Changed from ${oldStatus} to ${newStatus}.`);

    return { success: true, message: `Transaction ${tx.reference} updated to ${newStatus}.` };
  };

  // --- WAYBILL ACTIONS ---
  const createWaybill = (data: Omit<Waybill, 'id' | 'validationStatus' | 'discrepancyDetails' | 'lastValidatedAt'>) => {
    const waybillId = `WB-OG-${Date.now().toString().slice(-4)}`;
    const validation = validateWaybill(data, transactions, waybills);

    const newWaybill: Waybill = {
      ...data,
      id: waybillId,
      validationStatus: validation.status,
      discrepancyDetails: validation.discrepancies,
      lastValidatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setWaybills(prev => [newWaybill, ...prev]);

    if (!validation.isValid) {
      addAuditLog(
        'Waybills',
        'warning',
        `Waybill Discrepancy Flagged: ${newWaybill.waybillNumber}`,
        `Issues: ${validation.discrepancies.join('; ')}`
      );
    } else {
      addAuditLog(
        'Waybills',
        'validation',
        `Waybill Validated: ${newWaybill.waybillNumber}`,
        `Passed 7-point audit against Transaction ${newWaybill.transactionRef}`
      );
    }

    return {
      success: true,
      message: validation.isValid
        ? `Waybill ${newWaybill.waybillNumber} verified and saved.`
        : `Waybill ${newWaybill.waybillNumber} recorded with ${validation.discrepancies.length} discrepancy alert(s). Review required.`,
      validation,
      waybill: newWaybill,
    };
  };

  const updateWaybill = (id: string, updates: Partial<Waybill>) => {
    const existing = waybills.find(w => w.id === id);
    if (!existing) {
      const emptyVal: ValidationResult = {
        isValid: false,
        status: 'Rejected',
        discrepancies: ['Waybill record not found.'],
        checkedFields: {
          transactionExists: false,
          customerMatches: false,
          referenceUnique: false,
          itemsAndQtyMatch: false,
          requiredFieldsPresent: false,
          transactionPermitsWaybill: false,
        },
      };
      return { success: false, message: 'Waybill not found.', validation: emptyVal };
    }

    const merged = { ...existing, ...updates };
    const validation = validateWaybill(merged, transactions, waybills, id);

    const updated: Waybill = {
      ...merged,
      validationStatus: validation.status,
      discrepancyDetails: validation.discrepancies,
      lastValidatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setWaybills(prev => prev.map(w => (w.id === id ? updated : w)));
    addAuditLog(
      'Waybills',
      validation.isValid ? 'validation' : 'warning',
      `Waybill ${updated.waybillNumber} Updated & Revalidated`,
      validation.isValid ? 'All checks passed.' : `Flagged with ${validation.discrepancies.length} issue(s).`
    );

    return {
      success: true,
      message: validation.isValid ? 'Waybill revalidated: All checks passed!' : 'Waybill updated, but discrepancy alerts remain.',
      validation,
    };
  };

  const revalidateWaybillById = (id: string): ValidationResult => {
    const wb = waybills.find(w => w.id === id);
    if (!wb) {
      return {
        isValid: false,
        status: 'Rejected',
        discrepancies: ['Record missing'],
        checkedFields: {
          transactionExists: false,
          customerMatches: false,
          referenceUnique: false,
          itemsAndQtyMatch: false,
          requiredFieldsPresent: false,
          transactionPermitsWaybill: false,
        },
      };
    }
    const result = validateWaybill(wb, transactions, waybills, id);
    setWaybills(prev =>
      prev.map(w =>
        w.id === id
          ? {
              ...w,
              validationStatus: result.status,
              discrepancyDetails: result.discrepancies,
              lastValidatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            }
          : w
      )
    );
    return result;
  };

  // --- TICKET ACTIONS (Cross-sync with Inventory & Customers) ---
  const createTicket = (data: {
    customerId?: string;
    category: TicketCategory;
    subject: string;
    description: string;
    priority: TicketPriority;
    assignedStaff: string;
    relatedTransactionRef?: string;
    relatedWaybillNumber?: string;
    relatedProductId?: string;
    relatedPreviousTicketRef?: string;
    purchaseOrderDetails?: {
      productId: string;
      productName: string;
      requestedQuantity: number;
      unit: string;
      estimatedAmount: number;
    };
  }) => {
    if (!data.subject.trim() || !data.description.trim()) {
      return { success: false, message: 'Ticket subject and description are required.' };
    }

    const customer = customers.find(c => c.id === data.customerId);
    const relatedProduct = inventory.find(i => i.id === data.relatedProductId);
    const ticketRef = generateRef('TCK-OG', 3);
    const ticketId = `TCK-OG-${Date.now().toString().slice(-4)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const newTicket: Ticket = {
      id: ticketId,
      ticketRef,
      customerId: customer?.id,
      customerName: customer?.name,
      customerPhone: customer?.phone,
      customerEmail: customer?.email,
      category: data.category,
      subject: data.subject,
      description: data.description,
      priority: data.priority,
      status: 'Open',
      assignedStaff: data.assignedStaff || 'Unassigned',
      createdDate: nowStr,
      lastUpdatedDate: nowStr,
      relatedTransactionRef: data.relatedTransactionRef,
      relatedWaybillNumber: data.relatedWaybillNumber,
      relatedProductId: relatedProduct?.id,
      relatedProductName: relatedProduct?.name,
      relatedPreviousTicketRef: data.relatedPreviousTicketRef,
      purchaseOrderDetails: data.purchaseOrderDetails,
      comments: [
        {
          id: `C-${Date.now()}`,
          author: `Support Desk (${currentRole})`,
          role: currentRole,
          timestamp: nowStr,
          text: `Ticket opened with priority '${data.priority}'. Assigned to ${data.assignedStaff || 'Unassigned'}.${
            relatedProduct ? ` Linked to inventory asset ${relatedProduct.stockRef}.` : ''
          }${data.relatedPreviousTicketRef ? ` Associated with previous ticket ${data.relatedPreviousTicketRef}.` : ''}${
            data.purchaseOrderDetails ? ` Requested: ${data.purchaseOrderDetails.requestedQuantity} ${data.purchaseOrderDetails.unit} of ${data.purchaseOrderDetails.productName}.` : ''
          }`,
          isInternal: true,
        },
      ],
      history: [
        {
          id: `H-${Date.now()}`,
          timestamp: nowStr,
          action: `Ticket created (${data.category}) in Field Support Portal`,
          author: `Support Desk (${currentRole})`,
        },
      ],
    };

    setTickets(prev => [newTicket, ...prev]);

    // Attach ticket ref to product lifecycle if relatedProductId was provided!
    if (relatedProduct) {
      setInventory(prev =>
        prev.map(i =>
          i.id === relatedProduct.id
            ? {
                ...i,
                lifecycle: {
                  ...i.lifecycle,
                  linkedTickets: [...i.lifecycle.linkedTickets, ticketRef],
                },
              }
            : i
        )
      );
    }

    addAuditLog('Tickets', 'create', `Ticket ${ticketRef} Created`, `${newTicket.subject} (${newTicket.priority})`);

    // If linked to a waybill, update the waybill with linkedTicketId
    if (data.relatedWaybillNumber) {
      setWaybills(prev =>
        prev.map(w => (w.waybillNumber === data.relatedWaybillNumber ? { ...w, linkedTicketId: ticketId } : w))
      );
    }

    return { success: true, message: `Ticket ${ticketRef} registered successfully. Synchronized across modules.`, ticket: newTicket };
  };

  const updateTicket = (id: string, updates: Partial<Ticket>) => {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return { success: false, message: 'Ticket not found.' };

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const historyItems = [...ticket.history];
    if (updates.status && updates.status !== ticket.status) {
      historyItems.push({
        id: `H-${Date.now()}`,
        timestamp: nowStr,
        action: `Status changed from ${ticket.status} to ${updates.status}`,
        author: `Support Desk (${currentRole})`,
      });
    }
    if (updates.assignedStaff && updates.assignedStaff !== ticket.assignedStaff) {
      historyItems.push({
        id: `H-${Date.now()}-2`,
        timestamp: nowStr,
        action: `Reassigned to ${updates.assignedStaff}`,
        author: `Support Desk (${currentRole})`,
      });
    }

    setTickets(prev =>
      prev.map(t =>
        t.id === id
          ? {
              ...t,
              ...updates,
              lastUpdatedDate: nowStr,
              history: historyItems,
            }
          : t
      )
    );

    addAuditLog('Tickets', 'update', `Ticket ${ticket.ticketRef} Modified`, `Updates applied by ${currentRole}.`);
    return { success: true, message: 'Ticket updated.' };
  };

  const updateTicketPriority = (ticketId: string, priority: TicketPriority, reason?: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return { success: false, message: 'Ticket not found.' };

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const historyItem = {
      id: `H-${Date.now()}`,
      timestamp: nowStr,
      action: `Severity adjusted from ${ticket.priority} to ${priority}${reason ? `: ${reason}` : ''}`,
      author: `Support Desk (${currentRole})`,
    };

    const comment = {
      id: `C-${Date.now()}`,
      author: `Support Desk (${currentRole})`,
      role: currentRole,
      timestamp: nowStr,
      text: `Severity escalated/adjusted to '${priority}'. Reason: ${reason || 'Support triage adjustment.'}`,
      isInternal: true,
    };

    setTickets(prev =>
      prev.map(t =>
        t.id === ticketId
          ? {
              ...t,
              priority,
              lastUpdatedDate: nowStr,
              history: [...t.history, historyItem],
              comments: [...t.comments, comment],
            }
          : t
      )
    );

    addAuditLog('Tickets', 'update', `Ticket ${ticket.ticketRef} Severity Changed`, `New Priority: ${priority}`);
    return { success: true, message: `Ticket severity adjusted to ${priority}.` };
  };

  const closeTicket = (ticketId: string, closedBy: 'Support Team' | 'Customer', notes: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return { success: false, message: 'Ticket not found.' };

    if (!notes || notes.trim().length < 4) {
      return { success: false, message: 'Closure remarks are required before closing the ticket.' };
    }

    // MANDATORY REQUIREMENT: No purchase order ticket can be closed without uploading the waybill receipt!
    if (ticket.category === 'Purchase Order' && !ticket.waybillReceipt) {
      return {
        success: false,
        message: 'Mandatory Requirement: This ticket is a Purchase Order. A signed Waybill Receipt must be uploaded and verified before closing this ticket.',
      };
    }

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const comment = {
      id: `C-${Date.now()}`,
      author: closedBy === 'Customer' ? `${ticket.customerName || 'Customer'} (Customer)` : `Support Desk (${currentRole})`,
      role: closedBy === 'Customer' ? 'Customer' : currentRole,
      timestamp: nowStr,
      text: `Ticket Closed by ${closedBy}. Remarks: ${notes.trim()}`,
      isInternal: false,
      notificationChannel: 'Portal' as const,
    };

    const historyEntry = {
      id: `H-${Date.now()}`,
      timestamp: nowStr,
      action: `Ticket Closed by ${closedBy}`,
      author: closedBy === 'Customer' ? `${ticket.customerName || 'Customer'}` : `Support Desk (${currentRole})`,
    };

    setTickets(prev =>
      prev.map(t =>
        t.id === ticketId
          ? {
              ...t,
              status: 'Closed',
              closedBy,
              closedAt: nowStr,
              resolutionNotes: notes.trim(),
              lastUpdatedDate: nowStr,
              comments: [...t.comments, comment],
              history: [...t.history, historyEntry],
            }
          : t
      )
    );

    addAuditLog('Tickets', 'status_change', `Ticket ${ticket.ticketRef} Closed by ${closedBy}`, notes.trim());
    return { success: true, message: `Ticket ${ticket.ticketRef} closed successfully by ${closedBy}.` };
  };

  const uploadWaybillReceiptToTicket = (ticketId: string, receiptData: WaybillReceiptData) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return { success: false, message: 'Ticket not found.' };

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const comment = {
      id: `C-${Date.now()}`,
      author: `Logistics Desk (${currentRole})`,
      role: currentRole,
      timestamp: nowStr,
      text: `Waybill Receipt '${receiptData.fileName}' uploaded and verified. Extracted: Waybill #${receiptData.extractedFields.waybillNumber}, Driver: ${receiptData.extractedFields.tankerDriverAndPlate}, Product: ${receiptData.extractedFields.productDispatched}, Qty: ${receiptData.extractedFields.volumeOrQuantity}. Assigned to Inventory. Retained for 30 days until ${receiptData.autoDeleteDate}.`,
      isInternal: false,
      notificationChannel: 'Email' as const,
      notificationSent: true,
      notificationRecipient: ticket.customerEmail || ticket.customerPhone,
    };

    const historyEntry = {
      id: `H-${Date.now()}`,
      timestamp: nowStr,
      action: `Waybill Receipt ${receiptData.extractedFields.waybillNumber} uploaded & synced to Inventory`,
      author: `Logistics Desk (${currentRole})`,
    };

    setTickets(prev =>
      prev.map(t =>
        t.id === ticketId
          ? {
              ...t,
              waybillReceipt: receiptData,
              relatedWaybillNumber: receiptData.extractedFields.waybillNumber,
              lastUpdatedDate: nowStr,
              comments: [...t.comments, comment],
              history: [...t.history, historyEntry],
            }
          : t
      )
    );

    // Send copy of extracted fields to Inventory (record stock entry / audit log)
    addAuditLog(
      'Inventory',
      'update',
      `Waybill Receipt Assigned from Ticket ${ticket.ticketRef}`,
      `Waybill ${receiptData.extractedFields.waybillNumber} assigned to ${receiptData.extractedFields.productDispatched} (Tank: ${receiptData.extractedFields.depotTankLocation}).`
    );

    return { success: true, message: 'Waybill receipt verified, extracted fields assigned to Inventory, and 30-day retention countdown started.' };
  };

  const addTicketComment = (
    ticketId: string,
    text: string,
    isInternal = false,
    channel: 'WhatsApp' | 'Email' | 'Portal' = 'WhatsApp'
  ) => {
    if (!text.trim()) return { success: false, message: 'Note cannot be empty.' };

    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return { success: false, message: 'Ticket not found.' };

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const recipient = channel === 'WhatsApp' ? (ticket.customerPhone || '+234 800 000 0000') : (ticket.customerEmail || 'client@energy.ng');

    const newComment: TicketComment = {
      id: `C-${Date.now()}`,
      author: `Support Desk (${currentRole})`,
      role: currentRole,
      timestamp: nowStr,
      text: text.trim(),
      isInternal,
      notificationChannel: isInternal ? undefined : channel,
      notificationSent: !isInternal,
      notificationRecipient: isInternal ? undefined : recipient,
    };

    const historyEntry = {
      id: `H-${Date.now()}`,
      timestamp: nowStr,
      action: isInternal
        ? 'Internal staff note added'
        : `Public note published & dispatched via ${channel} to ${recipient}`,
      author: `Support Desk (${currentRole})`,
    };

    setTickets(prev =>
      prev.map(t =>
        t.id === ticketId
          ? {
              ...t,
              lastUpdatedDate: nowStr,
              comments: [...t.comments, newComment],
              history: [...t.history, historyEntry],
            }
          : t
      )
    );

    const notificationMsg = !isInternal
      ? `Notification dispatched to customer via ${channel} (${recipient})`
      : undefined;

    return { success: true, message: 'Note posted successfully.', notificationMsg };
  };

  const resolveTicket = (ticketId: string, resolutionNotes: string) => {
    if (!resolutionNotes || resolutionNotes.trim().length < 5) {
      return { success: false, message: 'Detailed resolution notes are mandatory before closing a ticket.' };
    }

    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return { success: false, message: 'Ticket not found.' };

    // MANDATORY REQUIREMENT: No purchase order ticket can be closed without uploading the waybill receipt!
    if (ticket.category === 'Purchase Order' && !ticket.waybillReceipt) {
      return {
        success: false,
        message: 'Mandatory Requirement: This ticket is a Purchase Order. A signed Waybill Receipt must be uploaded and verified before this ticket can be resolved.',
      };
    }

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const comment = {
      id: `C-${Date.now()}`,
      author: `Operations Officer (${currentRole})`,
      role: currentRole,
      timestamp: nowStr,
      text: `Resolution recorded: ${resolutionNotes.trim()}`,
      isInternal: false,
      notificationChannel: 'WhatsApp' as const,
      notificationSent: true,
      notificationRecipient: ticket.customerPhone,
    };

    const historyEntry = {
      id: `H-${Date.now()}`,
      timestamp: nowStr,
      action: 'Ticket marked Resolved',
      author: `Operations Officer (${currentRole})`,
    };

    setTickets(prev =>
      prev.map(t =>
        t.id === ticketId
          ? {
              ...t,
              status: 'Resolved',
              closedBy: 'Support Team',
              resolutionNotes: resolutionNotes.trim(),
              resolvedAt: nowStr,
              lastUpdatedDate: nowStr,
              comments: [...t.comments, comment],
              history: [...t.history, historyEntry],
            }
          : t
      )
    );

    addAuditLog('Tickets', 'status_change', `Ticket ${ticket.ticketRef} Resolved`, resolutionNotes);
    return { success: true, message: `Ticket ${ticket.ticketRef} successfully marked as Resolved.` };
  };

  // --- DEMO CONTROLS ---
  const resetAllDemoData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'inventory');
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'suppliers');
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'customers');
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'transactions');
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'waybills');
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'tickets');
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'stock_movements');
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'audit_logs');
    } catch (e) {
      console.warn(e);
    }

    setInventory(SEED_INVENTORY);
    setSuppliers(SEED_SUPPLIERS);
    setCustomers(SEED_CUSTOMERS);
    setTransactions(SEED_TRANSACTIONS);
    setWaybills(SEED_WAYBILLS);
    setTickets(SEED_TICKETS);
    setStockMovements(SEED_STOCK_MOVEMENTS);
    setAuditLogs(SEED_AUDIT_LOGS);
    setActiveReceiptTransaction(null);
    setSimulatedCallCustomer(null);
    setInspectedCustomerId(null);
    setInspectedProductLifecycleId(null);
  };

  const loadScenario = (scenarioKey: 'A' | 'B' | 'C' | 'D' | 'E') => {
    switch (scenarioKey) {
      case 'A':
        setAppMode('inventory_core');
        setActiveTab('transactions');
        break;
      case 'B':
        setAppMode('inventory_core');
        setActiveTab('waybills');
        break;
      case 'C':
        setAppMode('inventory_core');
        setActiveTab('waybills');
        break;
      case 'D':
        setAppMode('ticketing_desk');
        setActiveTab('ticketing');
        break;
      case 'E':
        setAppMode('inventory_core');
        setActiveTab('reports');
        break;
    }
  };

  return (
    <AppContext.Provider
      value={{
        appMode,
        setAppMode,

        inventory,
        suppliers,
        customers,
        transactions,
        waybills,
        tickets,
        stockMovements,
        auditLogs,

        currentRole,
        setCurrentRole,
        activeTab,
        setActiveTab,
        globalSearch,
        setGlobalSearch,

        activeReceiptTransaction,
        setActiveReceiptTransaction,
        simulatedCallCustomer,
        setSimulatedCallCustomer,
        inspectedCustomerId,
        setInspectedCustomerId,
        inspectedProductLifecycleId,
        setInspectedProductLifecycleId,

        addInventoryItem,
        updateInventoryItem,
        adjustStock,

        addSupplier,

        addCustomer,
        updateCustomer,

        createTransaction,
        updateTransactionStatus,

        createWaybill,
        updateWaybill,
        revalidateWaybillById,

        createTicket,
        updateTicket,
        updateTicketPriority,
        closeTicket,
        uploadWaybillReceiptToTicket,
        addTicketComment,
        resolveTicket,

        resetAllDemoData,
        loadScenario,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
