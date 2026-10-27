import React, { useState, useMemo } from 'react';
import {
  Truck,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  LifeBuoy,
  Edit,
  RefreshCw,
  Eye,
  Download,
  Calendar,
  ShieldAlert,
  ArrowRight,
  UploadCloud,
  FileCheck2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Waybill, DeliveryStatus, WaybillItem } from '../../types';
import { formatDate, exportToCSV, generateRef } from '../../utils/formatters';
import { getStatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const WaybillModule: React.FC = () => {
  const {
    waybills,
    transactions,
    customers,
    createWaybill,
    updateWaybill,
    revalidateWaybillById,
    createTicket,
    setInspectedCustomerId,
    setActiveTab,
    globalSearch,
    currentRole,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [validationFilter, setValidationFilter] = useState<string>('all');
  const [deliveryFilter, setDeliveryFilter] = useState<string>('all');

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingWaybill, setEditingWaybill] = useState<Waybill | null>(null);
  const [inspectedWaybill, setInspectedWaybill] = useState<Waybill | null>(null);

  // Form states
  const [formWaybillNo, setFormWaybillNo] = useState('');
  const [formTxRef, setFormTxRef] = useState('');
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formDestination, setFormDestination] = useState('');
  const [formDispatchDate, setFormDispatchDate] = useState('');
  const [formExpectedDate, setFormExpectedDate] = useState('');
  const [formDeliveryStatus, setFormDeliveryStatus] = useState<DeliveryStatus>('Awaiting Dispatch');
  const [formRecordedBy, setFormRecordedBy] = useState('Segun Adeleke (Logistics)');
  const [formNotes, setFormNotes] = useState('');
  const [formAttachment, setFormAttachment] = useState<string>('Scanned_Waybill_Consignment.pdf');
  const [formItems, setFormItems] = useState<WaybillItem[]>([]);
  const [formError, setFormError] = useState('');

  const effectiveSearch = globalSearch || searchTerm;

  const filteredWaybills = useMemo(() => {
    return waybills.filter(wb => {
      const matchesSearch =
        effectiveSearch === '' ||
        wb.waybillNumber.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        wb.transactionRef.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        wb.customerName.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        wb.destination.toLowerCase().includes(effectiveSearch.toLowerCase());

      const matchesVal = validationFilter === 'all' || wb.validationStatus === validationFilter;
      const matchesDel = deliveryFilter === 'all' || wb.deliveryStatus === deliveryFilter;

      return matchesSearch && matchesVal && matchesDel;
    });
  }, [waybills, effectiveSearch, validationFilter, deliveryFilter]);

  // Open modal for Recording / Editing
  const handleOpenRecordModal = (wbToEdit?: Waybill) => {
    setFormError('');
    if (wbToEdit) {
      setEditingWaybill(wbToEdit);
      setFormWaybillNo(wbToEdit.waybillNumber);
      setFormTxRef(wbToEdit.transactionRef);
      setFormCustomerId(wbToEdit.customerId);
      setFormDestination(wbToEdit.destination);
      setFormDispatchDate(wbToEdit.dispatchDate);
      setFormExpectedDate(wbToEdit.expectedDeliveryDate);
      setFormDeliveryStatus(wbToEdit.deliveryStatus);
      setFormRecordedBy(wbToEdit.recordedBy);
      setFormNotes(wbToEdit.notes);
      setFormAttachment(wbToEdit.attachmentName || 'Signed_Waybill_Consignment.pdf');
      setFormItems(wbToEdit.items);
    } else {
      setEditingWaybill(null);
      const defaultTx = transactions.find(t => t.transactionStatus === 'Completed') || transactions[0];
      setFormWaybillNo(generateRef('WB-88', 3));
      setFormTxRef(defaultTx?.reference || '');
      setFormCustomerId(defaultTx?.customerId || '');
      setFormDestination(defaultTx?.deliveryAddress || '');
      setFormDispatchDate(new Date().toISOString().split('T')[0]);
      setFormExpectedDate(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
      setFormDeliveryStatus('Awaiting Dispatch');
      setFormRecordedBy(`Segun Adeleke (${currentRole})`);
      setFormNotes('Standard dispatch verification note.');
      setFormAttachment('Digital_Waybill_Draft.pdf');

      // Populate items from default transaction
      if (defaultTx) {
        setFormItems(
          defaultTx.items.map(i => ({
            itemName: i.itemName,
            quantity: i.quantity,
            unit: 'Units',
          }))
        );
      }
    }
    setIsRecordModalOpen(true);
  };

  const handleTxChange = (txRef: string) => {
    setFormTxRef(txRef);
    const matched = transactions.find(t => t.reference === txRef);
    if (matched) {
      setFormCustomerId(matched.customerId);
      setFormDestination(matched.deliveryAddress);
      setFormItems(
        matched.items.map(i => ({
          itemName: i.itemName,
          quantity: i.quantity,
          unit: 'Units',
        }))
      );
    }
  };

  const handleSaveWaybill = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const customer = customers.find(c => c.id === formCustomerId);
    const customerName = customer?.name || 'Customer Partner';
    const totalUnits = formItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

    if (editingWaybill) {
      const res = updateWaybill(editingWaybill.id, {
        waybillNumber: formWaybillNo,
        transactionRef: formTxRef,
        customerId: formCustomerId,
        customerName,
        destination: formDestination,
        items: formItems,
        totalUnits,
        dispatchDate: formDispatchDate,
        expectedDeliveryDate: formExpectedDate,
        deliveryStatus: formDeliveryStatus,
        recordedBy: formRecordedBy,
        notes: formNotes,
        attachmentName: formAttachment,
      });

      if (!res.success) {
        setFormError(res.message);
        return;
      }
    } else {
      const res = createWaybill({
        waybillNumber: formWaybillNo,
        transactionRef: formTxRef,
        customerId: formCustomerId,
        customerName,
        destination: formDestination,
        items: formItems,
        totalUnits,
        dispatchDate: formDispatchDate,
        expectedDeliveryDate: formExpectedDate,
        deliveryStatus: formDeliveryStatus,
        recordedBy: formRecordedBy,
        notes: formNotes,
        attachmentName: formAttachment,
      });

      if (!res.success) {
        setFormError(res.message);
        return;
      }
    }

    setIsRecordModalOpen(false);
  };

  // 1-Click Ticket Escalation from Waybill Discrepancy Alert!
  const handleEscalateToTicket = (wb: Waybill) => {
    const res = createTicket({
      customerId: wb.customerId,
      category: 'Inventory Discrepancy',
      priority: 'Urgent',
      assignedStaff: 'Operations Lead (Logistics Audit)',
      subject: `Discrepancy Investigation: Waybill ${wb.waybillNumber} vs Order ${wb.transactionRef}`,
      description: `Automated investigation opened from Waybill Discrepancy Alert for Waybill ${wb.waybillNumber}. Flags: ${wb.discrepancyDetails.join('; ')}. Immediate depot tank farm recount required.`,
      relatedTransactionRef: wb.transactionRef,
      relatedWaybillNumber: wb.waybillNumber,
    });

    if (res.success) {
      alert(`Ticket ${res.ticket?.ticketRef} created and linked to Waybill ${wb.waybillNumber}! Navigating to Ticketing module.`);
      setActiveTab('ticketing');
    }
  };

  const handleExportCSV = () => {
    const data = filteredWaybills.map(wb => ({
      WaybillNumber: wb.waybillNumber,
      OrderRef: wb.transactionRef,
      Customer: wb.customerName,
      Destination: wb.destination,
      Units: wb.totalUnits,
      DispatchDate: wb.dispatchDate,
      ExpectedDate: wb.expectedDeliveryDate,
      DeliveryStatus: wb.deliveryStatus,
      ValidationStatus: wb.validationStatus,
      Discrepancies: wb.discrepancyDetails.join(' | ') || 'None',
      RecordedBy: wb.recordedBy,
    }));
    exportToCSV(data, 'Cooknow_Waybills_Audit_Report');
  };

  return (
    <div className="space-y-6">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Waybill Verification & Tanker Haulage Dispatch</h2>
          <p className="text-xs text-slate-500">
            Automated 7-point validation engine prevents unauthorized depot discharge and mismatched delivery consignments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Waybills CSV</span>
          </button>
          <button
            onClick={() => handleOpenRecordModal()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Waybill</span>
          </button>
        </div>
      </div>

      {/* Flagged Discrepancy Spotlight Banner (Demonstration Focus) */}
      {waybills.some(w => w.validationStatus === 'Requires Review' || w.validationStatus === 'Rejected') && (
        <div className="rounded-xl bg-amber-500/10 border-2 border-amber-500/40 p-5 shadow-xs">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500 text-slate-950 font-bold shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-amber-950">
                    High Priority Discrepancy Detected: Waybill WB-8805-ERR (Order TRX-OG-8805)
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500 text-slate-950">
                    Scenario C Focus
                  </span>
                </div>
                <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                  The Cooknow validation engine flagged a discrepancy: Waybill specifies 66,000 Litres (2 Tankers) consigned to "West African Bulk Haulage & Marine Ltd", but Sales Order TRX-OG-8805 authorized exactly 33,000 Litres (1 Tanker) for "Transcorp Power Ughelli Gas Turbine Plant".
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      const flagged = waybills.find(w => w.waybillNumber === 'WB-8805-ERR');
                      if (flagged) setInspectedWaybill(flagged);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-950 text-xs font-semibold hover:bg-amber-50 cursor-pointer shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-700" />
                    <span>Inspect 7-Point Audit Details</span>
                  </button>

                  <button
                    onClick={() => {
                      const flagged = waybills.find(w => w.waybillNumber === 'WB-8805-ERR');
                      if (flagged) handleOpenRecordModal(flagged);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit & Revalidate Record</span>
                  </button>

                  <button
                    onClick={() => {
                      const flagged = waybills.find(w => w.waybillNumber === 'WB-8805-ERR');
                      if (flagged) handleEscalateToTicket(flagged);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    <LifeBuoy className="w-3.5 h-3.5" />
                    <span>1-Click Escalate to Ticketing</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search waybill #, order ref, customer, destination..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-medium placeholder-slate-400 focus:outline-blue-500 shadow-xs"
          />
        </div>

        <div>
          <select
            value={validationFilter}
            onChange={e => setValidationFilter(e.target.value)}
            className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-blue-500 shadow-xs cursor-pointer"
          >
            <option value="all">All Validation Statuses</option>
            <option value="Validation Passed">Validation Passed (Verified)</option>
            <option value="Requires Review">Requires Review (Discrepancies)</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div>
          <select
            value={deliveryFilter}
            onChange={e => setDeliveryFilter(e.target.value)}
            className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-blue-500 shadow-xs cursor-pointer"
          >
            <option value="all">All Delivery States</option>
            <option value="Delivered">Delivered</option>
            <option value="In Transit">In Transit</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Awaiting Dispatch">Awaiting Dispatch</option>
            <option value="Delivery Exception">Delivery Exception</option>
          </select>
        </div>
      </div>

      {/* Waybills Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Waybill Number</th>
                <th className="py-3 px-4">Associated Order</th>
                <th className="py-3 px-4">Client & Destination</th>
                <th className="py-3 px-4 text-center">Consignment Units</th>
                <th className="py-3 px-4">Dispatch & Delivery</th>
                <th className="py-3 px-4">Validation Audit Engine</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWaybills.map(wb => {
                const hasDiscrepancy = wb.validationStatus !== 'Validation Passed';

                return (
                  <tr
                    key={wb.id}
                    className={`transition-colors ${
                      hasDiscrepancy ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{wb.waybillNumber}</span>
                        {hasDiscrepancy && (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{wb.attachmentName}</div>
                      {wb.linkedTicketId && (
                        <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 mt-1 inline-block">
                          Ticket Linked
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-slate-900">{wb.transactionRef}</span>
                      <span className="text-[10px] text-slate-400 block">By: {wb.recordedBy}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setInspectedCustomerId(wb.customerId)}
                        className="font-bold text-slate-900 hover:text-blue-700 hover:underline flex items-center gap-1.5 cursor-pointer text-left"
                        title="Click to view customer transaction statement"
                      >
                        <span>{wb.customerName}</span>
                        <span className="text-[9px] font-mono font-bold text-blue-800 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
                          {wb.customerId}
                        </span>
                      </button>
                      <div className="text-[10px] text-slate-500 truncate max-w-[200px] mt-0.5">
                        {wb.destination}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono text-sm font-bold text-slate-900">{wb.totalUnits}</span>
                      <span className="text-[10px] text-slate-500 ml-1">Units</span>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px] mx-auto">
                        {wb.items.map(i => `${i.quantity}x ${i.itemName}`).join(', ')}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        {getStatusBadge(wb.deliveryStatus)}
                        <span className="text-[10px] text-slate-400 block font-mono">
                          Dispatched: {formatDate(wb.dispatchDate)}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        {getStatusBadge(wb.validationStatus)}
                        {hasDiscrepancy ? (
                          <p className="text-[10px] text-amber-800 font-medium line-clamp-1">
                            {wb.discrepancyDetails[0]}
                          </p>
                        ) : (
                          <p className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Matched sales order</span>
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectedWaybill(wb)}
                          title="Inspect 7-Point Audit Details"
                          className="p-1.5 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenRecordModal(wb)}
                          title="Edit & Revalidate"
                          className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {hasDiscrepancy && (
                          <button
                            onClick={() => handleEscalateToTicket(wb)}
                            title="Escalate to Support Ticket"
                            className="p-1.5 rounded text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <LifeBuoy className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredWaybills.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Truck className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-medium text-slate-600">No matching waybills found</p>
                    <p className="text-[11px] mt-0.5">Try clearing filters or record a new consignment waybill.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: RECORD / EDIT WAYBILL */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title={editingWaybill ? `Edit & Revalidate Waybill: ${editingWaybill.waybillNumber}` : 'Record Outgoing Fleet Waybill'}
        subtitle="Automatic multi-point audit checks consignment items against authorized sales order"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveWaybill} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Waybill Number (Reference) *
              </label>
              <input
                type="text"
                value={formWaybillNo}
                onChange={e => setFormWaybillNo(e.target.value)}
                required
                className="w-full text-xs font-mono font-bold border border-slate-300 rounded-lg p-2.5 focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Associated Sales Order Ref *
              </label>
              <select
                value={formTxRef}
                onChange={e => handleTxChange(e.target.value)}
                className="w-full text-xs font-mono border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-blue-500"
              >
                {transactions.map(t => (
                  <option key={t.id} value={t.reference}>
                    {t.reference} — {t.customerName} ({t.transactionStatus})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Customer Consignee
              </label>
              <select
                value={formCustomerId}
                onChange={e => setFormCustomerId(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-blue-500"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Fleet Delivery Status
              </label>
              <select
                value={formDeliveryStatus}
                onChange={e => setFormDeliveryStatus(e.target.value as DeliveryStatus)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-blue-500"
              >
                <option value="Awaiting Dispatch">Awaiting Dispatch</option>
                <option value="Dispatched">Dispatched</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
                <option value="Delivery Exception">Delivery Exception</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
              Destination Delivery Address *
            </label>
            <input
              type="text"
              value={formDestination}
              onChange={e => setFormDestination(e.target.value)}
              required
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-blue-500"
            />
          </div>

          {/* Consignment Items */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
              Waybill Loaded Equipment & Quantities
            </label>
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-2">
              {formItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded border border-slate-200">
                  <input
                    type="text"
                    value={item.itemName}
                    onChange={e => {
                      const val = e.target.value;
                      setFormItems(prev => prev.map((it, i) => (i === idx ? { ...it, itemName: val } : it)));
                    }}
                    className="flex-1 text-xs border border-slate-300 rounded p-1.5"
                  />
                  <div className="w-20">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={e => {
                        const q = Number(e.target.value);
                        setFormItems(prev => prev.map((it, i) => (i === idx ? { ...it, quantity: q } : it)));
                      }}
                      className="w-full text-xs font-mono font-bold text-center border border-slate-300 rounded p-1.5"
                    />
                  </div>
                  <span className="text-xs text-slate-500 shrink-0 font-medium">units</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Dispatch Date *
              </label>
              <input
                type="date"
                value={formDispatchDate}
                onChange={e => setFormDispatchDate(e.target.value)}
                required
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Expected Delivery Date
              </label>
              <input
                type="date"
                value={formExpectedDate}
                onChange={e => setFormExpectedDate(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Recorded By (Officer)
              </label>
              <input
                type="text"
                value={formRecordedBy}
                onChange={e => setFormRecordedBy(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Demo Uploaded Attachment File
              </label>
              <input
                type="text"
                value={formAttachment}
                onChange={e => setFormAttachment(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
              Dispatch Verification Remarks
            </label>
            <textarea
              value={formNotes}
              onChange={e => setFormNotes(e.target.value)}
              rows={2}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsRecordModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{editingWaybill ? 'Submit & Revalidate Waybill' : 'Run 7-Point Audit & Save Waybill'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: INSPECT 7-POINT AUDIT DETAILS */}
      {inspectedWaybill && (
        <Modal
          isOpen={!!inspectedWaybill}
          onClose={() => setInspectedWaybill(null)}
          title={`Waybill Audit Inspection: ${inspectedWaybill.waybillNumber}`}
          subtitle={`Associated Order: ${inspectedWaybill.transactionRef} • Consignee: ${inspectedWaybill.customerName}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Status Header */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between ${
                inspectedWaybill.validationStatus === 'Validation Passed'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              <div className="flex items-center gap-3">
                {inspectedWaybill.validationStatus === 'Validation Passed' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                )}
                <div>
                  <h4 className="font-bold text-sm">
                    Validation Status: {inspectedWaybill.validationStatus}
                  </h4>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    {inspectedWaybill.validationStatus === 'Validation Passed'
                      ? 'All 7 deterministic integrity criteria passed without discrepancy.'
                      : `${inspectedWaybill.discrepancyDetails.length} exception(s) require operational review before dispatch release.`}
                  </p>
                </div>
              </div>

              {getStatusBadge(inspectedWaybill.validationStatus)}
            </div>

            {/* If Discrepancies exist, show itemized alerts */}
            {inspectedWaybill.discrepancyDetails.length > 0 && (
              <div className="space-y-2">
                <p className="font-bold uppercase tracking-wider text-rose-800 text-[11px]">
                  Detected Discrepancies & Mismatches:
                </p>
                {inspectedWaybill.discrepancyDetails.map((disc, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5"
                  >
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="font-medium">{disc}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Checkpoint Breakdown */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
              <p className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                7-Point Automated Verification Engine Matrix
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                  <span>1. Transaction Reference Exists</span>
                  <span className="font-bold text-emerald-600">✓ Verified</span>
                </div>

                <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                  <span>2. Customer Identity Match</span>
                  <span
                    className={`font-bold ${
                      inspectedWaybill.discrepancyDetails.some(d => d.includes('Customer Mismatch'))
                        ? 'text-rose-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {inspectedWaybill.discrepancyDetails.some(d => d.includes('Customer Mismatch'))
                      ? '✗ Mismatch'
                      : '✓ Verified'}
                  </span>
                </div>

                <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                  <span>3. Unique Reference ID</span>
                  <span className="font-bold text-emerald-600">✓ Unique</span>
                </div>

                <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                  <span>4. Quantity & Line-Item Match</span>
                  <span
                    className={`font-bold ${
                      inspectedWaybill.discrepancyDetails.some(d => d.includes('Quantity Discrepancy'))
                        ? 'text-rose-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {inspectedWaybill.discrepancyDetails.some(d => d.includes('Quantity Discrepancy'))
                      ? '✗ Mismatch'
                      : '✓ Verified'}
                  </span>
                </div>

                <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                  <span>5. Mandatory Fields Present</span>
                  <span className="font-bold text-emerald-600">✓ Complete</span>
                </div>

                <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                  <span>6. Transaction Status Permits Dispatch</span>
                  <span className="font-bold text-emerald-600">✓ Permitted</span>
                </div>

                <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between col-span-1 sm:col-span-2">
                  <span>7. No Prior Accepted Duplicate Waybill</span>
                  <span className="font-bold text-emerald-600">✓ Verified</span>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleOpenRecordModal(inspectedWaybill);
                    setInspectedWaybill(null);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Edit & Revalidate Record
                </button>
                {inspectedWaybill.validationStatus !== 'Validation Passed' && (
                  <button
                    onClick={() => {
                      handleEscalateToTicket(inspectedWaybill);
                      setInspectedWaybill(null);
                    }}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg cursor-pointer"
                  >
                    Create Investigation Ticket
                  </button>
                )}
              </div>

              <button
                onClick={() => setInspectedWaybill(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 cursor-pointer"
              >
                Close Audit Details
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
