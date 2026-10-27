import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Printer,
  Truck,
  AlertTriangle,
  RotateCcw,
  Download,
  Trash2,
  FileCheck2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Transaction, TransactionStatus, PaymentStatus } from '../../types';
import { formatCurrency, formatDate, exportToCSV } from '../../utils/formatters';
import { getStatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const TransactionModule: React.FC = () => {
  const {
    transactions,
    customers,
    inventory,
    createTransaction,
    updateTransactionStatus,
    setActiveReceiptTransaction,
    setInspectedCustomerId,
    setInspectedProductLifecycleId,
    setActiveTab,
    globalSearch,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formError, setFormError] = useState('');

  // Form states for new Transaction
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [lineItems, setLineItems] = useState<{ itemId: string; quantity: number }[]>([
    { itemId: inventory[0]?.id || '', quantity: 1 },
  ]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Paid');
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>('Completed');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [txNotes, setTxNotes] = useState('');

  const effectiveSearch = globalSearch || searchTerm;

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch =
        effectiveSearch === '' ||
        tx.reference.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        tx.customerName.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        tx.items.some(i => i.itemName.toLowerCase().includes(effectiveSearch.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || tx.transactionStatus === statusFilter;
      const matchesPayment = paymentFilter === 'all' || tx.paymentStatus === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [transactions, effectiveSearch, statusFilter, paymentFilter]);

  const handleOpenCreateModal = () => {
    setFormError('');
    setSelectedCustomerId(customers[0]?.id || '');
    setLineItems([{ itemId: inventory[0]?.id || '', quantity: 1 }]);
    setDiscountAmount(0);
    setPaymentStatus('Paid');
    setTransactionStatus('Completed');
    setDeliveryAddress(customers[0]?.address || '');
    setTxNotes('Standard commercial sales agreement.');
    setIsCreateModalOpen(true);
  };

  const handleAddLineItem = () => {
    setLineItems(prev => [...prev, { itemId: inventory[0]?.id || '', quantity: 1 }]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateLineItem = (index: number, itemId: string, quantity: number) => {
    setLineItems(prev =>
      prev.map((item, i) => (i === index ? { itemId, quantity: Math.max(1, quantity) } : item))
    );
  };

  // Preview totals calculation
  const calculatedSubtotal = useMemo(() => {
    return lineItems.reduce((sum, line) => {
      const invItem = inventory.find(i => i.id === line.itemId);
      return sum + (invItem?.sellingPrice || 0) * (line.quantity || 1);
    }, 0);
  }, [lineItems, inventory]);

  const calculatedTax = Math.round(Math.max(0, calculatedSubtotal - discountAmount) * 0.075);
  const calculatedTotal = Math.max(0, calculatedSubtotal - discountAmount) + calculatedTax;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const res = createTransaction({
      customerId: selectedCustomerId,
      items: lineItems,
      discount: Number(discountAmount),
      paymentStatus,
      transactionStatus,
      deliveryAddress,
      notes: txNotes,
    });

    if (!res.success) {
      setFormError(res.message);
      return;
    }

    setIsCreateModalOpen(false);

    // If completed immediately, open receipt modal automatically!
    if (res.transaction && transactionStatus === 'Completed') {
      setActiveReceiptTransaction(res.transaction);
    }
  };

  const handleExportCSV = () => {
    const data = filteredTransactions.map(tx => ({
      OrderRef: tx.reference,
      Date: tx.date,
      Customer: tx.customerName,
      ItemsSummary: tx.items.map(i => `${i.quantity}x ${i.itemName}`).join('; '),
      Subtotal_NGN: tx.subtotal,
      Discount_NGN: tx.discount,
      VAT_7_5_NGN: tx.tax,
      Total_NGN: tx.totalAmount,
      PaymentStatus: tx.paymentStatus,
      TransactionStatus: tx.transactionStatus,
      Operator: tx.operator,
      ReceiptNumber: tx.receiptNumber || 'None',
    }));
    exportToCSV(data, 'Cooknow_Transactions_Report');
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Commercial Sales & Orders Workflow</h2>
          <p className="text-xs text-slate-500">
            Completing an order automatically deducts stock; cancellations trigger reversible restorations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Orders CSV</span>
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Sales Order</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search order reference, customer, or equipment..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-medium placeholder-slate-400 focus:outline-blue-500 shadow-xs"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-blue-500 shadow-xs cursor-pointer"
          >
            <option value="all">All Order Statuses</option>
            <option value="Completed">Completed (Stock Deducted)</option>
            <option value="Pending">Pending (Draft Approval)</option>
            <option value="Draft">Draft Quotation</option>
            <option value="Cancelled">Cancelled (Stock Restored)</option>
          </select>
        </div>

        <div>
          <select
            value={paymentFilter}
            onChange={e => setPaymentFilter(e.target.value)}
            className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-blue-500 shadow-xs cursor-pointer"
          >
            <option value="all">All Payment Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Client Account & Destination</th>
                <th className="py-3 px-4">Petroleum & Consignment Line Items</th>
                <th className="py-3 px-4 text-right">Order Total (NGN)</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Order Lifecycle</th>
                <th className="py-3 px-4 text-right">Receipt / Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-slate-900">{tx.reference}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{formatDate(tx.date)}</div>
                    {tx.receiptNumber && (
                      <span className="text-[9px] font-mono text-blue-700 font-semibold block mt-0.5">
                        {tx.receiptNumber}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => setInspectedCustomerId(tx.customerId)}
                      className="font-bold text-slate-900 hover:text-blue-700 hover:underline flex items-center gap-1.5 cursor-pointer text-left"
                      title="Click to view complete customer transaction statement"
                    >
                      <span>{tx.customerName}</span>
                      <span className="text-[9px] font-mono font-bold text-blue-800 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
                        {tx.customerId}
                      </span>
                    </button>
                    <div className="text-[10px] text-slate-500 truncate max-w-[200px] mt-0.5">
                      {tx.deliveryAddress}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="space-y-1.5">
                      {tx.items.map((line, idx) => (
                        <div key={idx} className="text-slate-800 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 truncate max-w-[220px]">
                            <span className="font-bold text-slate-950 font-mono">{line.quantity.toLocaleString()}x</span>
                            <span className="truncate font-medium">{line.itemName}</span>
                          </div>
                          <button
                            onClick={() => setInspectedProductLifecycleId(line.itemId)}
                            title="Inspect product lifecycle ledger"
                            className="text-[9px] font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded cursor-pointer shrink-0"
                          >
                            Lifecycle
                          </button>
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono">
                    <div className="text-sm font-bold text-slate-900">{formatCurrency(tx.totalAmount)}</div>
                    <div className="text-[10px] text-slate-500 font-sans">
                      Incl. 7.5% VAT: {formatCurrency(tx.tax)}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    {getStatusBadge(tx.paymentStatus)}
                    {tx.paymentStatus === 'Unpaid' && (
                      <button
                        onClick={() => updateTransactionStatus(tx.id, tx.transactionStatus, 'Paid')}
                        className="text-[10px] text-blue-600 hover:underline block mt-1 cursor-pointer font-medium"
                      >
                        Mark as Paid (Demo)
                      </button>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      {getStatusBadge(tx.transactionStatus)}
                      {tx.transactionStatus === 'Pending' && (
                        <button
                          onClick={() => updateTransactionStatus(tx.id, 'Completed')}
                          className="text-[10px] text-emerald-700 font-bold hover:underline block cursor-pointer"
                        >
                          Complete & Deduct Stock &rarr;
                        </button>
                      )}
                      {tx.transactionStatus === 'Completed' && (
                        <button
                          onClick={() => {
                            if (confirm(`Cancel ${tx.reference}? This will automatically restore warehouse stock.`)) {
                              updateTransactionStatus(tx.id, 'Cancelled');
                            }
                          }}
                          className="text-[10px] text-rose-600 hover:underline block cursor-pointer"
                        >
                          Cancel & Restore Stock
                        </button>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex flex-col items-end gap-1">
                      {tx.receiptNumber || tx.transactionStatus === 'Completed' ? (
                        <button
                          onClick={() => setActiveReceiptTransaction(tx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          <Printer className="w-3 h-3" />
                          <span>View Receipt</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">Receipt pending</span>
                      )}

                      <button
                        onClick={() => {
                          setActiveTab('waybills');
                        }}
                        className="text-[10px] text-slate-500 hover:text-slate-800 hover:underline flex items-center gap-0.5"
                      >
                        <Truck className="w-3 h-3 text-amber-500" />
                        <span>Dispatch Waybill</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-medium text-slate-600">No matching transactions found</p>
                    <p className="text-[11px] mt-0.5">Try adjusting your filters or create a new order.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: CREATE NEW SALES ORDER */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Commercial Sales Order"
        subtitle="Validates stock levels in real time and automatically creates inventory deduction movements"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Customer Selection */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
              Select Corporate Client *
            </label>
            <select
              value={selectedCustomerId}
              onChange={e => {
                const cId = e.target.value;
                setSelectedCustomerId(cId);
                const cust = customers.find(c => c.id === cId);
                if (cust) setDeliveryAddress(cust.address);
              }}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-blue-500"
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.contactPerson} - {c.cityState})
                </option>
              ))}
            </select>
          </div>

          {/* Line Items Builder */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold uppercase tracking-wider text-slate-600">
                Equipment Line Items
              </label>
              <button
                type="button"
                onClick={handleAddLineItem}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item Line</span>
              </button>
            </div>

            <div className="space-y-2 border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              {lineItems.map((line, idx) => {
                const invItem = inventory.find(i => i.id === line.itemId);
                const lineTotal = (invItem?.sellingPrice || 0) * (line.quantity || 1);

                return (
                  <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded border border-slate-200">
                    <div className="flex-1">
                      <select
                        value={line.itemId}
                        onChange={e => handleUpdateLineItem(idx, e.target.value, line.quantity)}
                        className="w-full text-xs border border-slate-300 rounded p-1.5 bg-white"
                      >
                        {inventory.map(inv => (
                          <option key={inv.id} value={inv.id}>
                            {inv.name} — {formatCurrency(inv.sellingPrice)} (Avail: {inv.quantity})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-20">
                      <input
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={e => handleUpdateLineItem(idx, line.itemId, Number(e.target.value))}
                        className="w-full text-xs font-mono font-bold text-center border border-slate-300 rounded p-1.5"
                        placeholder="Qty"
                      />
                    </div>

                    <div className="w-28 text-right font-mono font-bold text-slate-800 text-xs">
                      {formatCurrency(lineTotal)}
                    </div>

                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span>Subtotal:</span>
              <span className="font-mono font-semibold">{formatCurrency(calculatedSubtotal)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">Commercial Discount (₦):</span>
              <input
                type="number"
                min={0}
                value={discountAmount}
                onChange={e => setDiscountAmount(Number(e.target.value))}
                className="w-32 text-xs font-mono border border-slate-300 rounded p-1 text-right bg-white"
              />
            </div>

            <div className="flex items-center justify-between text-slate-500">
              <span>Demo VAT (7.5%):</span>
              <span className="font-mono">{formatCurrency(calculatedTax)}</span>
            </div>

            <div className="flex items-center justify-between text-sm font-bold border-t border-slate-200 pt-2 text-slate-900">
              <span>Total Payable:</span>
              <span className="font-mono text-blue-700 text-base">{formatCurrency(calculatedTotal)}</span>
            </div>
          </div>

          {/* Status & Lifecycle Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Transaction Lifecycle State
              </label>
              <select
                value={transactionStatus}
                onChange={e => setTransactionStatus(e.target.value as TransactionStatus)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-blue-500"
              >
                <option value="Completed">Completed (Deducts stock immediately & issues receipt)</option>
                <option value="Pending">Pending Approval (Stock reserved)</option>
                <option value="Draft">Draft Quotation (No stock impact)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Payment Status (Demo Recording)
              </label>
              <select
                value={paymentStatus}
                onChange={e => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-blue-500"
              >
                <option value="Paid">Mark as Paid — Demo Only</option>
                <option value="Partially Paid">Partially Paid (Deposit recorded)</option>
                <option value="Unpaid">Unpaid (Awaiting payment verification)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
              Destination Delivery Address
            </label>
            <input
              type="text"
              value={deliveryAddress}
              onChange={e => setDeliveryAddress(e.target.value)}
              placeholder="Full site destination for waybill release"
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
              Order Notes & Commercial Terms
            </label>
            <textarea
              value={txNotes}
              onChange={e => setTxNotes(e.target.value)}
              rows={2}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs cursor-pointer"
            >
              Confirm Sales Order & Generate Receipt
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
