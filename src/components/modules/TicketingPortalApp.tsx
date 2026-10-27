import React, { useState, useMemo } from 'react';
import {
  LifeBuoy,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  MessageSquare,
  Phone,
  ArrowRight,
  Download,
  Send,
  Eye,
  ShieldAlert,
  Boxes,
  UserPlus,
  RefreshCw,
  ExternalLink,
  Layers,
  Building2,
  PackageCheck,
  Check,
  UploadCloud,
  FileCheck2,
  Trash2,
  Calendar,
  Lock,
  Globe,
  Mail,
  Smartphone,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  Ticket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  WaybillReceiptData,
} from '../../types';
import { formatDate, formatDateTime, formatCurrency, exportToCSV } from '../../utils/formatters';
import { getStatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';

interface TicketingPortalAppProps {
  isEmbedded?: boolean;
}

export const TicketingPortalApp: React.FC<TicketingPortalAppProps> = ({ isEmbedded = false }) => {
  const {
    tickets,
    customers,
    inventory,
    transactions,
    waybills,
    createTicket,
    updateTicket,
    updateTicketPriority,
    closeTicket,
    uploadWaybillReceiptToTicket,
    addTicketComment,
    resolveTicket,
    addCustomer,
    setSimulatedCallCustomer,
    setInspectedCustomerId,
    setInspectedProductLifecycleId,
    setAppMode,
    currentRole,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [closeTarget, setCloseTarget] = useState<'Support Team' | 'Customer'>('Support Team');
  const [resolutionText, setResolutionText] = useState('');
  const [resolutionError, setResolutionError] = useState('');

  // Comment state
  const [newCommentText, setNewCommentText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [commentChannel, setCommentChannel] = useState<'WhatsApp' | 'Email' | 'Portal'>('WhatsApp');
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Form states for creating ticket
  const [formSubject, setFormSubject] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<TicketCategory>('Purchase Order');
  const [formPriority, setFormPriority] = useState<TicketPriority>('Normal');
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formAssignedStaff, setFormAssignedStaff] = useState('Support Operations Lead');
  const [formTxRef, setFormTxRef] = useState('');
  const [formWbRef, setFormWbRef] = useState('');
  const [formProductId, setFormProductId] = useState('');
  const [formPoQuantity, setFormPoQuantity] = useState<number>(33000);
  const [formPreviousTicketRef, setFormPreviousTicketRef] = useState('');
  const [formError, setFormError] = useState('');

  // Form states for creating new customer from ticketing
  const [newCustName, setNewCustName] = useState('');
  const [newCustContact, setNewCustContact] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('+234 ');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustSector, setNewCustSector] = useState('Energy & Utilities');
  const [custSuccessMsg, setCustSuccessMsg] = useState('');

  // Inline Quick Add Customer inside Create Ticket Modal
  const [showInlineCustomerAdd, setShowInlineCustomerAdd] = useState(false);
  const [inlineCustName, setInlineCustName] = useState('');
  const [inlineCustContact, setInlineCustContact] = useState('');
  const [inlineCustPhone, setInlineCustPhone] = useState('+234 ');
  const [inlineCustEmail, setInlineCustEmail] = useState('');
  const [inlineCustSector, setInlineCustSector] = useState('Gas Power Generation');

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchesSearch =
        searchTerm === '' ||
        t.ticketRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.customerName && t.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.relatedTransactionRef && t.relatedTransactionRef.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.relatedProductName && t.relatedProductName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.relatedWaybillNumber && t.relatedWaybillNumber.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? t.status === 'Open' || t.status === 'In Progress' || t.status === 'Pending Response'
          : t.status === statusFilter;

      const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [tickets, searchTerm, statusFilter, priorityFilter, categoryFilter]);

  // Selected inventory item for live pulling
  const selectedInventoryProduct = useMemo(() => {
    return inventory.find(i => i.id === formProductId);
  }, [inventory, formProductId]);

  // Previous tickets for linking (when complaint or after-sales is selected)
  const customerPreviousTickets = useMemo(() => {
    if (formCustomerId) {
      return tickets.filter(t => t.customerId === formCustomerId);
    }
    return tickets;
  }, [tickets, formCustomerId]);

  const handleOpenCreateModal = () => {
    setFormError('');
    setFormSubject('');
    setFormDescription('');
    setFormCategory('Purchase Order');
    setFormPriority('Normal');
    setFormCustomerId(customers[0]?.id || '');
    setFormAssignedStaff('Support Operations Lead');
    setFormTxRef('');
    setFormWbRef('');
    setFormProductId(inventory[0]?.id || '');
    setFormPoQuantity(33000);
    setFormPreviousTicketRef('');
    setShowInlineCustomerAdd(false);
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formSubject.trim() || !formDescription.trim()) {
      setFormError('Subject and description are mandatory.');
      return;
    }

    let poDetails;
    if (formCategory === 'Purchase Order' && selectedInventoryProduct) {
      poDetails = {
        productId: selectedInventoryProduct.id,
        productName: selectedInventoryProduct.name,
        requestedQuantity: formPoQuantity,
        unit: selectedInventoryProduct.unitOfMeasure,
        estimatedAmount: formPoQuantity * selectedInventoryProduct.sellingPrice,
      };
    }

    const res = createTicket({
      customerId: formCustomerId || undefined,
      category: formCategory,
      subject: formSubject,
      description: formDescription,
      priority: formPriority,
      assignedStaff: formAssignedStaff,
      relatedTransactionRef: formTxRef || undefined,
      relatedWaybillNumber: formWbRef || undefined,
      relatedProductId: formProductId || undefined,
      relatedPreviousTicketRef: formPreviousTicketRef || undefined,
      purchaseOrderDetails: poDetails,
    });

    if (!res.success) {
      setFormError(res.message);
      return;
    }

    setIsCreateModalOpen(false);
  };

  const handleQuickAddCustomerInline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineCustName.trim() || !inlineCustPhone.trim()) {
      alert('Business name and phone number are required.');
      return;
    }

    const res = addCustomer({
      name: inlineCustName.trim(),
      contactPerson: inlineCustContact.trim() || 'Operations Rep',
      phone: inlineCustPhone.trim(),
      email: inlineCustEmail.trim() || `${inlineCustName.toLowerCase().replace(/\s+/g, '')}@energyclient.ng`,
      address: 'Industrial Supply Depot Corridor, Lagos State',
      cityState: 'Lagos State',
      status: 'Active',
      industrySector: inlineCustSector,
      notes: 'Registered quickly via Ticketing Creation modal without leaving desk.',
    });

    if (res.success && res.customer) {
      setFormCustomerId(res.customer.id);
      setShowInlineCustomerAdd(false);
      setInlineCustName('');
      setInlineCustPhone('+234 ');
      setInlineCustEmail('');
      alert(`Customer created successfully with ID: ${res.customer.id} and synced to central inventory!`);
    }
  };

  const handleCreateCustomerFromTicketing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) {
      alert('Business name and phone number are required.');
      return;
    }

    const res = addCustomer({
      name: newCustName,
      contactPerson: newCustContact,
      phone: newCustPhone,
      email: newCustEmail,
      address: newCustAddress,
      cityState: 'Lagos State',
      status: 'Active',
      industrySector: newCustSector,
      notes: 'Client account created directly from Field Support Desk.',
    });

    if (res.success && res.customer) {
      setFormCustomerId(res.customer.id);
      setCustSuccessMsg(`Client created with Unique ID ${res.customer.id} and synchronized into Inventory System!`);
      setTimeout(() => {
        setIsNewCustomerModalOpen(false);
        setCustSuccessMsg('');
      }, 1200);
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newCommentText.trim()) return;

    const res = addTicketComment(selectedTicket.id, newCommentText, isInternalComment, commentChannel);
    setNewCommentText('');

    if (res.notificationMsg) {
      setNotificationToast(res.notificationMsg);
      setTimeout(() => setNotificationToast(null), 4500);
    }

    const updated = tickets.find(t => t.id === selectedTicket.id);
    if (updated) setSelectedTicket(updated);
  };

  const handleAdjustPriority = (newPriority: TicketPriority) => {
    if (!selectedTicket) return;
    const res = updateTicketPriority(selectedTicket.id, newPriority, 'Support team severity adjustment');
    if (res.success) {
      const updated = tickets.find(t => t.id === selectedTicket.id);
      if (updated) setSelectedTicket({ ...updated, priority: newPriority });
    }
  };

  const handleOpenCloseModal = (target: 'Support Team' | 'Customer') => {
    if (!selectedTicket) return;
    // Check mandatory waybill requirement for purchase order tickets
    if (selectedTicket.category === 'Purchase Order' && !selectedTicket.waybillReceipt) {
      alert(
        'MANDATORY REQUIREMENT BLOCKED:\n\nThis ticket is classified as a Purchase Order. Cooknow operational policy requires uploading and verifying the signed Waybill Receipt before this ticket can be resolved or closed.\n\nPlease upload the Waybill Receipt using the button in the ticket window.'
      );
      return;
    }
    setCloseTarget(target);
    setResolutionText(
      target === 'Customer'
        ? 'Customer confirmed receipt of consignment in full and accepted closure.'
        : 'All delivery and inspection conditions satisfied. Ticket resolved and closed by Support Desk.'
    );
    setResolutionError('');
    setIsResolveModalOpen(true);
  };

  const handleConfirmClose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setResolutionError('');

    const res = closeTicket(selectedTicket.id, closeTarget, resolutionText);
    if (!res.success) {
      setResolutionError(res.message);
      return;
    }

    setIsResolveModalOpen(false);
    setSelectedTicket(null);
  };

  const handleSimulateWaybillUpload = () => {
    if (!selectedTicket) return;

    const now = new Date();
    const autoDeleteDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .replace('T', ' ')
      .slice(0, 16);

    const waybillNo = selectedTicket.relatedWaybillNumber || `WB-REC-${Math.floor(1000 + Math.random() * 9000)}`;
    const product = selectedTicket.relatedProductName || 'Automotive Gas Oil (AGO Diesel 33,000L)';
    const qty = selectedTicket.purchaseOrderDetails
      ? `${selectedTicket.purchaseOrderDetails.requestedQuantity.toLocaleString()} ${selectedTicket.purchaseOrderDetails.unit}`
      : '33,000 Litres';

    const receiptData: WaybillReceiptData = {
      fileName: `Scanned_Waybill_Consignment_${waybillNo}.pdf`,
      fileSize: '2.4 MB (Signed & Stamped)',
      uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      uploadedBy: `Support Desk (${currentRole})`,
      autoDeleteDate,
      extractedFields: {
        waybillNumber: waybillNo,
        tankerDriverAndPlate: 'M. Danjuma (Mack 40T Tanker #LSR-820-XB)',
        productDispatched: product,
        volumeOrQuantity: qty,
        depotTankLocation: 'Tank Farm Bay 1 - Lekki Terminal',
        destination: selectedTicket.customerName ? `${selectedTicket.customerName} Commercial Site` : 'Central Terminal Hub',
        nmdpraInspectionStamp: 'NMDPRA/QC/LAG/2026/VALIDATED-CLEARED',
      },
      syncedToInventory: true,
    };

    const res = uploadWaybillReceiptToTicket(selectedTicket.id, receiptData);
    if (res.success) {
      alert(
        `✓ WAYBILL RECEIPT EXTRACTED & VERIFIED!\n\nExtracted Fields:\n- Waybill Ref: ${waybillNo}\n- Product: ${product}\n- Volume: ${qty}\n- Tanker Driver: M. Danjuma (#LSR-820-XB)\n- NMDPRA Stamp: VALIDATED\n\n✓ Extracted copy sent to Inventory System.\n✓ Auto-delete retention set for 30 days (Purge date: ${autoDeleteDate}).`
      );
      const updated = tickets.find(t => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    }
  };

  const handleExportCSV = () => {
    const data = filteredTickets.map(t => ({
      TicketRef: t.ticketRef,
      Subject: t.subject,
      Category: t.category,
      Priority: t.priority,
      Status: t.status,
      Customer: t.customerName || 'Internal',
      Phone: t.customerPhone || 'N/A',
      AssignedStaff: t.assignedStaff,
      RelatedProduct: t.relatedProductName || 'N/A',
      OrderRef: t.relatedTransactionRef || 'N/A',
      WaybillNumber: t.relatedWaybillNumber || 'N/A',
      WaybillReceiptUploaded: t.waybillReceipt ? 'YES' : 'NO',
      CreatedDate: t.createdDate,
      ClosedBy: t.closedBy || 'Unclosed',
      ResolutionNotes: t.resolutionNotes || 'Unresolved',
    }));
    exportToCSV(data, 'Cooknow_Field_Support_Tickets');
  };

  return (
    <div className="space-y-6 text-slate-900">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
              {isEmbedded ? 'Ticketing Integration Desk' : 'Standalone Sub-Application'}
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Inventory & Customer Sync</span>
            </div>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight mt-1 text-white">
            Cooknow Field Support Desk & Operations Ticketing
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 max-w-2xl font-normal">
            Independent customer care workflow. Adjust severity in real-time, dispatch public WhatsApp/email updates, and enforce mandatory Waybill Receipt uploads on purchase orders with 30-day auto retention.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {isEmbedded ? (
            <button
              onClick={() => setAppMode('ticketing_desk')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer shadow-sm"
              title="Open full dedicated window view for ticketing agents"
            >
              <ExternalLink className="w-4 h-4 text-cyan-400" />
              <span>Launch Standalone Portal</span>
            </button>
          ) : (
            <button
              onClick={() => setAppMode('inventory_core')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer shadow-sm"
            >
              <Boxes className="w-4 h-4 text-amber-400" />
              <span>Switch to Inventory Core</span>
            </button>
          )}

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Open New Ticket</span>
          </button>
        </div>
      </div>

      {/* Notification Toast Alert */}
      {notificationToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{notificationToast}</span>
          </div>
          <button onClick={() => setNotificationToast(null)} className="text-emerald-700 hover:text-emerald-950 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Real-time KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Open Issues & Requests
          </span>
          <p className="text-xl font-bold text-blue-700 mt-1">
            {tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Active triage queue</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            Urgent Severity SLA
          </span>
          <p className="text-xl font-bold text-rose-800 mt-1">
            {tickets.filter(t => t.priority === 'Urgent' && t.status !== 'Resolved' && t.status !== 'Closed').length}
          </p>
          <p className="text-[10px] text-rose-600 mt-0.5">Demurrage & discrepancy halts</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            Resolved / Closed Cases
          </span>
          <p className="text-xl font-bold text-emerald-800 mt-1">
            {tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Client & support closures</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Synced Live Catalog
          </span>
          <p className="text-xl font-bold text-slate-900 mt-1">{inventory.length} Products</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Depot reserves ready for PO</p>
        </div>
      </div>

      {/* Filters Bar with HIGH CONTRAST (Fixed text colors) */}
      <div className="bg-white rounded-xl border border-slate-300 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search ticket #, subject, client, product..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-blue-500 focus:border-blue-500 placeholder:text-slate-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-blue-500 focus:border-blue-500 cursor-pointer"
          >
            <option value="all" className="text-slate-900 bg-white">All Ticket Statuses ({tickets.length})</option>
            <option value="active" className="text-slate-900 bg-white">Active Open Cases</option>
            <option value="Open" className="text-slate-900 bg-white">Open</option>
            <option value="In Progress" className="text-slate-900 bg-white">In Progress</option>
            <option value="Pending Response" className="text-slate-900 bg-white">Pending Response</option>
            <option value="Resolved" className="text-slate-900 bg-white">Resolved Cases</option>
            <option value="Closed" className="text-slate-900 bg-white">Closed Cases</option>
          </select>
        </div>

        <div>
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-blue-500 focus:border-blue-500 cursor-pointer"
          >
            <option value="all" className="text-slate-900 bg-white">All Severities</option>
            <option value="Urgent" className="text-slate-900 bg-white">Urgent Severity (Immediate Action)</option>
            <option value="High" className="text-slate-900 bg-white">High Priority</option>
            <option value="Normal" className="text-slate-900 bg-white">Normal Priority</option>
            <option value="Low" className="text-slate-900 bg-white">Low Priority</option>
          </select>
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-blue-500 focus:border-blue-500 cursor-pointer"
          >
            <option value="all" className="text-slate-900 bg-white">All Issue Categories</option>
            <option value="Purchase Order" className="text-slate-900 bg-white">Purchase Order (Live Inventory)</option>
            <option value="Customer Complaint" className="text-slate-900 bg-white">Customer Complaint</option>
            <option value="After-Sales Support" className="text-slate-900 bg-white">After-Sales Support</option>
            <option value="Delivery & Tanker Issue" className="text-slate-900 bg-white">Delivery & Tanker Issue</option>
            <option value="Inventory Discrepancy" className="text-slate-900 bg-white">Inventory Discrepancy</option>
            <option value="Transaction & Billing Issue" className="text-slate-900 bg-white">Transaction & Billing Issue</option>
            <option value="Fuel Quality / Testing Issue" className="text-slate-900 bg-white">Fuel Quality / Testing Issue</option>
            <option value="Internal Operational Request" className="text-slate-900 bg-white">Internal Operational Request</option>
          </select>
        </div>
      </div>

      {/* Main Tickets Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Ticket Ref</th>
                <th className="py-3 px-4">Subject & Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Severity SLA</th>
                <th className="py-3 px-4">Client Account</th>
                <th className="py-3 px-4">Waybill Receipt</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.map(t => {
                const isUrgent = t.priority === 'Urgent';
                const isResolved = t.status === 'Resolved' || t.status === 'Closed';
                const isPo = t.category === 'Purchase Order';

                return (
                  <tr
                    key={t.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isUrgent && !isResolved ? 'bg-rose-50/40' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <div>{t.ticketRef}</div>
                      <div className="text-[10px] text-slate-500 font-sans mt-0.5">{formatDate(t.createdDate)}</div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 line-clamp-1">{t.subject}</div>
                      <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">{t.description}</p>
                      {t.relatedPreviousTicketRef && (
                        <span className="text-[9px] font-mono text-purple-700 bg-purple-50 px-1 py-0.2 rounded border border-purple-200 mt-1 inline-block">
                          Ref Previous: {t.relatedPreviousTicketRef}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        isPo ? 'bg-blue-50 text-blue-800 border-blue-300' : 'bg-slate-100 text-slate-800 border-slate-300'
                      }`}>
                        {t.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(t.priority)}</td>

                    <td className="py-3.5 px-4">
                      {t.customerId ? (
                        <button
                          onClick={() => setInspectedCustomerId(t.customerId!)}
                          className="font-bold text-slate-900 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer text-left"
                          title="Click to view customer transaction statement"
                        >
                          <span className="truncate max-w-[140px]">{t.customerName}</span>
                          <span className="text-[9px] font-mono font-bold text-blue-800 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
                            {t.customerId}
                          </span>
                        </button>
                      ) : (
                        <span className="text-slate-500 italic">Internal Hub</span>
                      )}
                      {t.customerPhone && (
                        <span className="text-[10px] text-slate-500 block font-mono">{t.customerPhone}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {t.waybillReceipt ? (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 w-fit">
                          <FileCheck2 className="w-3 h-3 text-emerald-600" />
                          <span>Uploaded & Synced</span>
                        </div>
                      ) : isPo ? (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-300 w-fit">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>Required for PO</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">Optional</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        {getStatusBadge(t.status)}
                        {t.closedBy && (
                          <span className="text-[9px] text-slate-500 block">By: {t.closedBy}</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedTicket(t)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs transition-colors cursor-pointer border border-blue-200"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>Inspect Desk</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <LifeBuoy className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-slate-700">No matching tickets found</p>
                    <p className="text-[11px] mt-0.5 text-slate-500">Try clearing filters or open a new customer issue.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: CREATE TICKET (With dynamic category flow & quick customer register) */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Open Field Support / Operations Ticket"
        subtitle="Dynamic workflow: Category determines live production order selection or past ticket linking"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
              Ticket Subject *
            </label>
            <input
              type="text"
              value={formSubject}
              onChange={e => setFormSubject(e.target.value)}
              placeholder="E.g. Purchase Order: Bulk AGO Diesel 33,000L / Terminal Dispatch Inquiry"
              required
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 bg-white font-medium focus:outline-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Category (Determines Next Step) *
              </label>
              <select
                value={formCategory}
                onChange={e => setFormCategory(e.target.value as TicketCategory)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-900 font-bold focus:outline-blue-500 cursor-pointer"
              >
                <option value="Purchase Order">Purchase Order (Live Inventory Selection)</option>
                <option value="Customer Complaint">Customer Complaint (Link Past Ticket)</option>
                <option value="After-Sales Support">After-Sales Support (Link Past Ticket)</option>
                <option value="Delivery & Tanker Issue">Delivery & Tanker Issue (Link Waybill)</option>
                <option value="Inventory Discrepancy">Inventory Discrepancy</option>
                <option value="Transaction & Billing Issue">Transaction & Billing Issue</option>
                <option value="Fuel Quality / Testing Issue">Fuel Quality / Testing Issue</option>
                <option value="Internal Operational Request">Internal Operational Request</option>
              </select>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Initial Severity / Priority *
              </label>
              <select
                value={formPriority}
                onChange={e => setFormPriority(e.target.value as TicketPriority)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-900 font-bold focus:outline-blue-500 cursor-pointer"
              >
                <option value="Normal">Normal (24h standard response)</option>
                <option value="High">High (Same-day dispatch response)</option>
                <option value="Urgent">Urgent (Immediate halt & logistics escort)</option>
                <option value="Low">Low (General inquiry / backlog)</option>
              </select>
            </div>
          </div>

          {/* Customer Selection with Quick Register Link */}
          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold uppercase tracking-wider text-slate-800">
                Customer Consignee
              </label>
              <button
                type="button"
                onClick={() => setShowInlineCustomerAdd(prev => !prev)}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{showInlineCustomerAdd ? 'Cancel Quick Register' : '+ Quick Register New Customer'}</span>
              </button>
            </div>

            {/* Inline Quick Customer Creation Form */}
            {showInlineCustomerAdd && (
              <div className="p-3 bg-white border border-blue-300 rounded-lg space-y-2.5 animate-fade-in shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                  <span>Register Customer Directly into Inventory Core</span>
                  <span className="text-[10px] text-blue-600 font-normal">Auto-generates CUST-OG-xxx</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={inlineCustName}
                    onChange={e => setInlineCustName(e.target.value)}
                    placeholder="Company / Facility Name *"
                    className="p-1.5 border border-slate-300 rounded text-xs text-slate-900"
                  />
                  <input
                    type="text"
                    value={inlineCustContact}
                    onChange={e => setInlineCustContact(e.target.value)}
                    placeholder="Contact Officer"
                    className="p-1.5 border border-slate-300 rounded text-xs text-slate-900"
                  />
                  <input
                    type="text"
                    value={inlineCustPhone}
                    onChange={e => setInlineCustPhone(e.target.value)}
                    placeholder="Phone Number *"
                    className="p-1.5 border border-slate-300 rounded text-xs text-slate-900"
                  />
                  <input
                    type="email"
                    value={inlineCustEmail}
                    onChange={e => setInlineCustEmail(e.target.value)}
                    placeholder="Email Address"
                    className="p-1.5 border border-slate-300 rounded text-xs text-slate-900"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleQuickAddCustomerInline}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-xs cursor-pointer shadow-xs"
                  >
                    Save & Auto-Select Client
                  </button>
                </div>
              </div>
            )}

            <select
              value={formCustomerId}
              onChange={e => setFormCustomerId(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-900 font-semibold focus:outline-blue-500 cursor-pointer"
            >
              <option value="">-- Internal Operations / No Customer --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id} className="text-slate-900 bg-white">
                  {c.id} &bull; {c.name} ({c.contactPerson}) - {c.phone}
                </option>
              ))}
            </select>
          </div>

          {/* DYNAMIC FIELD 1: IF PURCHASE ORDER -> PULL LIVE PRODUCTION / INVENTORY ORDER */}
          {formCategory === 'Purchase Order' && (
            <div className="border border-blue-200 rounded-xl p-3.5 bg-blue-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
                  <Boxes className="w-4 h-4 text-blue-700" />
                  <span>Pull Live Petroleum Reserves & Inventory Assets</span>
                </label>
                <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                  Live Stock Pull
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Select Available Product
                  </label>
                  <select
                    value={formProductId}
                    onChange={e => setFormProductId(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-900 font-bold focus:outline-blue-500"
                  >
                    {inventory.map(i => (
                      <option key={i.id} value={i.id} className="text-slate-900 bg-white">
                        {i.stockRef} &bull; {i.name} (Depot Avail: {i.quantity.toLocaleString()} {i.unitOfMeasure} @ {formatCurrency(i.sellingPrice)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Requested Quantity ({selectedInventoryProduct?.unitOfMeasure || 'Units'})
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formPoQuantity}
                    onChange={e => setFormPoQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 text-slate-900 bg-white font-bold"
                  />
                </div>
              </div>

              {selectedInventoryProduct && (
                <div className="p-2.5 bg-white rounded-lg border border-blue-200 text-xs flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-slate-500 text-[11px]">Storage Tank:</span>
                    <p className="font-bold text-slate-900">{selectedInventoryProduct.lifecycle.depotTankLocation}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Refinery Batch:</span>
                    <p className="font-mono font-bold text-slate-800">{selectedInventoryProduct.lifecycle.batchNumber}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Est. Order Value:</span>
                    <p className="font-bold text-emerald-700 font-mono">
                      {formatCurrency(formPoQuantity * selectedInventoryProduct.sellingPrice)}
                    </p>
                  </div>
                </div>
              )}

              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>
                  <strong>Mandatory Policy Notice:</strong> This ticket is a Purchase Order. A signed Waybill Receipt must be uploaded & extracted before this ticket can be resolved or closed.
                </span>
              </div>
            </div>
          )}

          {/* DYNAMIC FIELD 2: IF COMPLAINT OR AFTER-SALES -> PULL PREVIOUS / CLOSED TICKETS */}
          {(formCategory === 'Customer Complaint' || formCategory === 'After-Sales Support') && (
            <div className="border border-purple-200 rounded-xl p-3.5 bg-purple-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold uppercase tracking-wider text-purple-950 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-purple-700" />
                  <span>Attach Exact Previous / Closed Incident Ticket</span>
                </label>
                <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded border border-purple-200">
                  After-Sales Context
                </span>
              </div>

              <select
                value={formPreviousTicketRef}
                onChange={e => setFormPreviousTicketRef(e.target.value)}
                className="w-full text-xs border border-purple-300 rounded-lg p-2.5 bg-white text-slate-900 font-medium focus:outline-purple-500"
              >
                <option value="">-- No Previous Ticket Attached --</option>
                {customerPreviousTickets.map(t => (
                  <option key={t.id} value={t.ticketRef} className="text-slate-900 bg-white">
                    {t.ticketRef} &bull; {t.subject} (Status: {t.status} • {formatDate(t.createdDate)})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-purple-800 italic">
                Links the original ticket where the customer was attended to for full historical audit continuity.
              </p>
            </div>
          )}

          {/* DYNAMIC FIELD 3: IF DELIVERY & TANKER ISSUE -> PULL WAYBILLS */}
          {formCategory === 'Delivery & Tanker Issue' && (
            <div className="border border-amber-200 rounded-xl p-3.5 bg-amber-50/50 space-y-2">
              <label className="font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-amber-700" />
                <span>Link Active Tanker Haulage Waybill</span>
              </label>
              <select
                value={formWbRef}
                onChange={e => setFormWbRef(e.target.value)}
                className="w-full text-xs border border-amber-300 rounded-lg p-2.5 bg-white text-slate-900 font-medium focus:outline-amber-500"
              >
                <option value="">-- Select Waybill Record --</option>
                {waybills.map(w => (
                  <option key={w.id} value={w.waybillNumber} className="text-slate-900 bg-white">
                    {w.waybillNumber} &bull; {w.customerName} (Dest: {w.destination} • {w.validationStatus})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
              Case Details & Communications Notes *
            </label>
            <textarea
              value={formDescription}
              onChange={e => setFormDescription(e.target.value)}
              rows={3}
              placeholder="State what occurred, customer communications details, or order specifications..."
              required
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 bg-white focus:outline-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Register & Synchronize Ticket</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: TICKET DETAIL & COMMUNICATIONS WINDOW */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Ticket ${selectedTicket.ticketRef}: ${selectedTicket.subject}`}
          subtitle={`Category: ${selectedTicket.category} • Created: ${formatDateTime(selectedTicket.createdDate)}`}
          maxWidth="4xl"
        >
          <div className="space-y-5 text-xs text-slate-900">
            {/* Meta & Severity Adjustment Bar */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-slate-600">Current Status:</span>
                  {getStatusBadge(selectedTicket.status)}
                  {selectedTicket.closedBy && (
                    <span className="text-[11px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                      Closed by {selectedTicket.closedBy}
                    </span>
                  )}
                </div>

                {/* Severity SLA Adjuster for Support Team */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-slate-600 flex items-center gap-1">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                    Adjust Severity:
                  </span>
                  {(['Low', 'Normal', 'High', 'Urgent'] as TicketPriority[]).map(p => (
                    <button
                      key={p}
                      onClick={() => handleAdjustPriority(p)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        selectedTicket.priority === p
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Assigned Officer</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedTicket.assignedStaff}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Customer Account</span>
                  {selectedTicket.customerId ? (
                    <button
                      onClick={() => setInspectedCustomerId(selectedTicket.customerId!)}
                      className="font-bold text-blue-700 hover:underline block mt-0.5 cursor-pointer text-left"
                    >
                      {selectedTicket.customerName}
                    </button>
                  ) : (
                    <p className="text-slate-600 mt-0.5">Internal Facility</p>
                  )}
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Contact Channels</span>
                  <p className="font-mono text-slate-800 mt-0.5">{selectedTicket.customerPhone || 'N/A'}</p>
                  {selectedTicket.customerPhone && (
                    <button
                      onClick={() =>
                        setSimulatedCallCustomer({
                          name: selectedTicket.customerName || 'Customer',
                          phone: selectedTicket.customerPhone || '',
                          context: selectedTicket.ticketRef,
                        })
                      }
                      className="text-[10px] text-emerald-700 hover:underline flex items-center gap-1 mt-0.5 font-bold cursor-pointer"
                    >
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>Simulate Call</span>
                    </button>
                  )}
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Previous Ticket Link</span>
                  {selectedTicket.relatedPreviousTicketRef ? (
                    <span className="font-mono font-bold text-purple-700 block mt-0.5">
                      {selectedTicket.relatedPreviousTicketRef}
                    </span>
                  ) : (
                    <span className="text-slate-400 mt-0.5 block">—</span>
                  )}
                </div>
              </div>
            </div>

            {/* Case Details Description */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 text-[11px] uppercase tracking-wide">
                Incident & Operations Description:
              </span>
              <p className="text-slate-800 mt-1 leading-relaxed text-xs">{selectedTicket.description}</p>
            </div>

            {/* MANDATORY WAYBILL RECEIPT SECTION (FOR PURCHASE ORDERS) */}
            <div className={`p-4 rounded-xl border ${
              selectedTicket.waybillReceipt
                ? 'bg-emerald-50/40 border-emerald-300'
                : selectedTicket.category === 'Purchase Order'
                ? 'bg-rose-50/50 border-rose-300'
                : 'bg-slate-50 border-slate-200'
            } space-y-3`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileCheck2 className={`w-5 h-5 ${selectedTicket.waybillReceipt ? 'text-emerald-700' : 'text-slate-700'}`} />
                  <div>
                    <h4 className="font-bold text-slate-900">
                      Consignment Waybill Receipt
                      {selectedTicket.category === 'Purchase Order' && (
                        <span className="ml-2 px-2 py-0.5 text-[10px] font-bold rounded bg-rose-100 text-rose-800 border border-rose-200 uppercase">
                          Mandatory for Purchase Order
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      Auto-extracts required fields into Inventory and enforces 30-day safe retention before automatic purge.
                    </p>
                  </div>
                </div>

                {!selectedTicket.waybillReceipt ? (
                  <button
                    onClick={handleSimulateWaybillUpload}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload & Auto-Extract Waybill Receipt</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Receipt Verified & Assigned
                    </span>
                    <button
                      onClick={() => alert(`Waybill Receipt Document: ${selectedTicket.waybillReceipt?.fileName}\nSize: ${selectedTicket.waybillReceipt?.fileSize}\n\nStored securely until: ${selectedTicket.waybillReceipt?.autoDeleteDate}`)}
                      className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 font-semibold text-xs rounded hover:bg-slate-50 cursor-pointer"
                    >
                      View File
                    </button>
                  </div>
                )}
              </div>

              {/* If Receipt Uploaded: Show Extracted Fields Table */}
              {selectedTicket.waybillReceipt && (
                <div className="bg-white p-3 rounded-lg border border-emerald-200 text-xs space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Waybill Number:</span>
                      <span className="font-mono font-bold text-slate-900">{selectedTicket.waybillReceipt.extractedFields.waybillNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Tanker Driver & Truck:</span>
                      <span className="font-semibold text-slate-800">{selectedTicket.waybillReceipt.extractedFields.tankerDriverAndPlate}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Product Dispatched:</span>
                      <span className="font-semibold text-slate-800">{selectedTicket.waybillReceipt.extractedFields.productDispatched}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Volume / Quantity:</span>
                      <span className="font-mono font-bold text-emerald-700">{selectedTicket.waybillReceipt.extractedFields.volumeOrQuantity}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Depot Tank Bay:</span>
                      <span className="font-semibold text-slate-800">{selectedTicket.waybillReceipt.extractedFields.depotTankLocation}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">NMDPRA Stamp:</span>
                      <span className="font-mono font-semibold text-blue-700">{selectedTicket.waybillReceipt.extractedFields.nmdpraInspectionStamp}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 block">Safe 30-Day Auto Retention:</span>
                      <span className="font-mono font-bold text-amber-800">
                        Scheduled for automatic deletion on {selectedTicket.waybillReceipt.autoDeleteDate}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Resolution Box if resolved or closed */}
            {selectedTicket.resolutionNotes && (
              <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Closure & Resolution Notes ({selectedTicket.resolvedAt || selectedTicket.closedAt}):</span>
                </div>
                <p className="mt-1 text-xs text-emerald-900 font-medium">{selectedTicket.resolutionNotes}</p>
              </div>
            )}

            {/* INTERACTIVE COMMUNICATIONS THREAD */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-slate-600" />
                  <span>Communications & Operations Timeline ({selectedTicket.comments.length})</span>
                </h4>
                <span className="text-[10px] text-slate-500">Public notes notify customer via WhatsApp or Email</span>
              </div>

              {/* Feed */}
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {selectedTicket.comments.map(c => (
                  <div
                    key={c.id}
                    className={`p-3 rounded-lg border ${
                      c.isInternal
                        ? 'bg-amber-50/50 border-amber-200'
                        : 'bg-white border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{c.author}</span>
                        {c.isInternal ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Internal Staff Note
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <Globe className="w-2.5 h-2.5" />
                            <span>Public to Customer ({c.notificationChannel || 'WhatsApp'})</span>
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400 font-mono text-[10px]">{c.timestamp}</span>
                    </div>
                    <p className="text-slate-800 leading-relaxed text-xs">{c.text}</p>
                    {c.notificationSent && c.notificationRecipient && (
                      <p className="text-[10px] text-emerald-700 mt-1 font-semibold">
                        ✓ Dispatched to {c.notificationRecipient}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Post Note Box with Public vs Internal toggle */}
              {selectedTicket.status !== 'Closed' && (
                <form onSubmit={handlePostComment} className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer font-bold text-xs text-slate-700">
                        <input
                          type="radio"
                          name="noteType"
                          checked={!isInternalComment}
                          onChange={() => setIsInternalComment(false)}
                          className="accent-blue-600 cursor-pointer"
                        />
                        <span>Public Note (Communicate to Customer)</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer font-bold text-xs text-amber-800">
                        <input
                          type="radio"
                          name="noteType"
                          checked={isInternalComment}
                          onChange={() => setIsInternalComment(true)}
                          className="accent-amber-600 cursor-pointer"
                        />
                        <span>Internal Note (Staff-Only)</span>
                      </label>
                    </div>

                    {!isInternalComment && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-slate-500 font-medium">Notify via:</span>
                        <select
                          value={commentChannel}
                          onChange={e => setCommentChannel(e.target.value as any)}
                          className="px-2 py-1 text-xs border border-slate-300 rounded bg-white text-slate-900 font-bold"
                        >
                          <option value="WhatsApp">WhatsApp ({selectedTicket.customerPhone || 'Mobile'})</option>
                          <option value="Email">Email ({selectedTicket.customerEmail || 'Client Email'})</option>
                          <option value="Portal">Customer Web Portal</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCommentText}
                      onChange={e => setNewCommentText(e.target.value)}
                      placeholder={
                        isInternalComment
                          ? 'Add internal diagnostic or warehouse staff note...'
                          : `Type update to communicate to ${selectedTicket.customerName || 'customer'}...`
                      }
                      className="flex-1 text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 bg-white font-medium focus:outline-blue-500"
                    />
                    <button
                      type="submit"
                      className={`px-4 py-2 text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs ${
                        isInternalComment ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isInternalComment ? 'Save Internal' : 'Push & Dispatch'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* CLOSING & RESOLUTION ACTION BUTTONS */}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {selectedTicket.status !== 'Closed' && (
                  <>
                    <button
                      onClick={() => handleOpenCloseModal('Support Team')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Close Ticket (Support Desk)</span>
                    </button>

                    <button
                      onClick={() => handleOpenCloseModal('Customer')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold cursor-pointer shadow-xs"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Close Ticket as Customer</span>
                    </button>
                  </>
                )}

                {selectedTicket.status === 'Open' && (
                  <button
                    onClick={() => {
                      updateTicket(selectedTicket.id, { status: 'In Progress' });
                      const updated = tickets.find(t => t.id === selectedTicket.id);
                      if (updated) setSelectedTicket({ ...updated, status: 'In Progress' });
                    }}
                    className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    Mark In Progress
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 cursor-pointer"
              >
                Close Case Window
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: CLOSURE & RESOLUTION NOTES */}
      {isResolveModalOpen && selectedTicket && (
        <Modal
          isOpen={isResolveModalOpen}
          onClose={() => setIsResolveModalOpen(false)}
          title={`Close Ticket ${selectedTicket.ticketRef} (${closeTarget})`}
          subtitle="Mandatory business rule: Detailed closing remarks required before permanent closure"
          maxWidth="md"
        >
          <form onSubmit={handleConfirmClose} className="space-y-4 text-xs">
            {resolutionError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{resolutionError}</span>
              </div>
            )}

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                {closeTarget === 'Customer' ? 'Client Confirmation & Closure Note *' : 'Support Closure & Resolution Remarks *'}
              </label>
              <textarea
                value={resolutionText}
                onChange={e => setResolutionText(e.target.value)}
                rows={4}
                required
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 bg-white font-medium focus:outline-blue-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsResolveModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm Closure as {closeTarget}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
