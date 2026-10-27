export type DemoRole = 'Administrator' | 'Operations Manager' | 'Inventory Staff' | 'Customer Support Staff';

export type InventoryCategory =
  | 'Refined Petroleum Products'
  | 'Liquefied Petroleum Gas (LPG)'
  | 'Industrial Lubricants & Greases'
  | 'Drilling, Valves & Piping Hardware'
  | 'Heavy Pipeline & Flow Control'
  | 'Depot Safety & Terminal Equipment';

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface ProductSaleRecord {
  id: string;
  transactionRef: string;
  saleDate: string;
  customerId: string;
  customerName: string;
  quantitySold: number;
  unit: string;
  unitSellingPrice: number;
  totalSalesAmount: number;
  associatedWaybillNumber?: string;
  associatedTicketId?: string;
  operator: string;
}

export interface ProductLifecycle {
  purchaseDate: string;
  purchasedBy: string;
  purchaseCostUnit: number;
  totalPurchaseCost: number;
  supplierId: string;
  supplierName: string;
  batchNumber: string;
  inspectionCertNumber: string;
  depotTankLocation: string;
  initialQuantityReceived: number;
  currentAvailableQuantity: number;
  totalQuantityDispatched: number;
  qaQcTestStatus: 'Passed - NMDPRA Certified' | 'Pending Lab Analysis' | 'Quarantine Inspection';
  salesHistory: ProductSaleRecord[];
  linkedTickets: string[]; // Associated ticket references e.g. TCK-OG-501
}

export interface InventoryItem {
  id: string;
  stockRef: string;
  name: string;
  category: InventoryCategory;
  description: string;
  quantity: number;
  unitOfMeasure: string;
  supplierId: string;
  supplierName: string;
  costPrice: number;
  sellingPrice: number;
  reorderThreshold: number;
  purchaseDate: string;
  status: StockStatus;
  lastUpdated: string;
  notes: string;
  lifecycle: ProductLifecycle;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  supplierRef: string;
  category: string;
  notes?: string;
}

export type MovementType =
  | 'Stock Received'
  | 'Stock Issued (Sale)'
  | 'Stock Adjustment'
  | 'Stock Restored (Cancelled Sale)';

export interface StockMovement {
  id: string;
  itemId: string;
  itemRef: string;
  itemName: string;
  movementType: MovementType;
  quantity: number;
  previousQty: number;
  newQty: number;
  date: string;
  reference: string;
  operator: string;
  notes: string;
}

export interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  cityState: string;
  dateRegistered: string;
  status: 'Active' | 'Inactive';
  notes: string;
  totalSpend: number;
  industrySector: string;
}

export interface TransactionLineItem {
  itemId: string;
  stockRef: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
}

export type TransactionStatus = 'Draft' | 'Pending' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Unpaid' | 'Partially Paid' | 'Paid' | 'Refunded';

export interface Transaction {
  id: string;
  reference: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  date: string;
  items: TransactionLineItem[];
  subtotal: number;
  discount: number;
  tax: number; // Demo 7.5% VAT
  totalAmount: number;
  paymentStatus: PaymentStatus;
  transactionStatus: TransactionStatus;
  operator: string;
  stockDeducted: boolean;
  notes: string;
  deliveryAddress: string;
  associatedTicketId?: string;
  receiptNumber?: string;
}

export interface Receipt {
  receiptNumber: string;
  transactionId: string;
  transactionRef: string;
  issueDate: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: TransactionLineItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  operator: string;
}

export type DeliveryStatus =
  | 'Draft'
  | 'Awaiting Dispatch'
  | 'Dispatched'
  | 'In Transit'
  | 'Delivered'
  | 'Delivery Exception'
  | 'Cancelled';

export type WaybillValidationStatus =
  | 'Validation Passed'
  | 'Requires Review'
  | 'Rejected'
  | 'Not Checked';

export interface WaybillItem {
  itemName: string;
  quantity: number;
  unit: string;
}

export interface Waybill {
  id: string;
  waybillNumber: string;
  transactionRef: string;
  customerId: string;
  customerName: string;
  destination: string;
  items: WaybillItem[];
  totalUnits: number;
  dispatchDate: string;
  expectedDeliveryDate: string;
  deliveryStatus: DeliveryStatus;
  validationStatus: WaybillValidationStatus;
  discrepancyDetails: string[];
  attachmentName?: string;
  recordedBy: string;
  tankerDriverDetails?: string;
  notes: string;
  lastValidatedAt?: string;
  linkedTicketId?: string;
}

export type TicketCategory =
  | 'Purchase Order'
  | 'Customer Complaint'
  | 'After-Sales Support'
  | 'Delivery & Tanker Issue'
  | 'Inventory Discrepancy'
  | 'Transaction & Billing Issue'
  | 'Fuel Quality / Testing Issue'
  | 'General Enquiry'
  | 'Internal Operational Request'
  | 'Other';

export type TicketPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export type TicketStatus =
  | 'Open'
  | 'In Progress'
  | 'Pending Response'
  | 'Resolved'
  | 'Closed';

export interface TicketComment {
  id: string;
  author: string;
  role: string;
  timestamp: string;
  text: string;
  isInternal?: boolean; // false = Public Note sent to customer, true = Staff-only
  notificationChannel?: 'WhatsApp' | 'Email' | 'Portal';
  notificationSent?: boolean;
  notificationRecipient?: string;
}

export interface TicketHistoryEntry {
  id: string;
  timestamp: string;
  action: string;
  author: string;
}

export interface WaybillReceiptData {
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  uploadedBy: string;
  autoDeleteDate: string; // Auto-deletes after 30 days
  extractedFields: {
    waybillNumber: string;
    tankerDriverAndPlate: string;
    productDispatched: string;
    volumeOrQuantity: string;
    depotTankLocation: string;
    destination: string;
    nmdpraInspectionStamp: string;
  };
  syncedToInventory: boolean;
}

export interface Ticket {
  id: string;
  ticketRef: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  category: TicketCategory;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedStaff: string;
  createdDate: string;
  lastUpdatedDate: string;
  relatedTransactionRef?: string;
  relatedWaybillNumber?: string;
  relatedProductId?: string;
  relatedProductName?: string;
  relatedPreviousTicketRef?: string; // For complaints or after-sales linking previous tickets
  purchaseOrderDetails?: {
    productId: string;
    productName: string;
    requestedQuantity: number;
    unit: string;
    estimatedAmount: number;
  };
  waybillReceipt?: WaybillReceiptData; // Mandatory for Purchase Order tickets to close
  closedBy?: 'Support Team' | 'Customer' | 'System';
  closedAt?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  comments: TicketComment[];
  history: TicketHistoryEntry[];
}

export interface AuditActivity {
  id: string;
  timestamp: string;
  module: 'Inventory' | 'Transactions' | 'Waybills' | 'Tickets' | 'Customers' | 'System';
  type: 'create' | 'update' | 'validation' | 'status_change' | 'warning';
  title: string;
  description: string;
  user: string;
}

export interface ValidationResult {
  isValid: boolean;
  status: WaybillValidationStatus;
  discrepancies: string[];
  checkedFields: {
    transactionExists: boolean;
    customerMatches: boolean;
    referenceUnique: boolean;
    itemsAndQtyMatch: boolean;
    requiredFieldsPresent: boolean;
    transactionPermitsWaybill: boolean;
  };
}
