import React from 'react';
import {
  Users,
  Receipt,
  Download,
  Phone,
  Mail,
  MapPin,
  Calendar,
  X,
  CreditCard,
  Truck,
  LifeBuoy,
  Printer,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, exportToCSV } from '../../utils/formatters';
import { getStatusBadge } from './Badge';

interface CustomerReportModalProps {
  customerId: string | null;
  onClose: () => void;
}

export const CustomerReportModal: React.FC<CustomerReportModalProps> = ({
  customerId,
  onClose,
}) => {
  const { customers, transactions, waybills, tickets, setActiveReceiptTransaction } = useApp();

  if (!customerId) return null;

  const customer = customers.find(c => c.id === customerId);
  if (!customer) return null;

  const customerTransactions = transactions.filter(t => t.customerId === customerId);
  const customerWaybills = waybills.filter(w => w.customerId === customerId);
  const customerTickets = tickets.filter(t => t.customerId === customerId);

  const totalSpend = customerTransactions
    .filter(t => t.transactionStatus === 'Completed')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const totalOutstanding = customerTransactions
    .filter(t => t.paymentStatus === 'Unpaid' && t.transactionStatus !== 'Cancelled')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const handleExportStatement = () => {
    const data = customerTransactions.map(tx => ({
      Customer_ID: customer.id,
      Customer_Name: customer.name,
      Transaction_Ref: tx.reference,
      Date: tx.date,
      Products: tx.items.map(i => `${i.quantity}x ${i.itemName}`).join('; '),
      Subtotal_NGN: tx.subtotal,
      VAT_7_5_NGN: tx.tax,
      Total_NGN: tx.totalAmount,
      Payment_Status: tx.paymentStatus,
      Order_Status: tx.transactionStatus,
      Waybill_Ref: tx.receiptNumber ? `WB-${tx.reference}` : 'Pending',
      Operator: tx.operator,
    }));
    exportToCSV(data, `${customer.id}_Transaction_Audit_Statement`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs no-print">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800">
                  {customer.id}
                </span>
                <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Comprehensive Transaction & Account Ledger
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{customer.name} &bull; {customer.industrySector}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportStatement}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition-colors cursor-pointer border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Statement CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[calc(85vh-120px)] overflow-y-auto text-xs text-slate-700">
          {/* Customer Metadata Profile */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Contact Officer</span>
              <p className="font-bold text-slate-900 text-xs mt-0.5">{customer.contactPerson}</p>
              <p className="text-[11px] text-slate-500">{customer.phone}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Facility Location</span>
              <p className="font-bold text-slate-900 text-xs mt-0.5 truncate">{customer.address}</p>
              <p className="text-[11px] text-slate-500">{customer.cityState}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Lifetime Settled Revenue</span>
              <p className="font-mono font-bold text-emerald-700 text-sm mt-0.5">{formatCurrency(totalSpend)}</p>
              <span className="text-[10px] text-slate-500">{customerTransactions.length} total orders recorded</span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pending Payables</span>
              <p className="font-mono font-bold text-rose-700 text-sm mt-0.5">{formatCurrency(totalOutstanding)}</p>
              <span className="text-[10px] text-slate-500">{getStatusBadge(customer.status)}</span>
            </div>
          </div>

          {/* Complete Transaction Statement */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-sm text-slate-900">
                  Full Transaction Audit Statement ({customerTransactions.length} Orders)
                </h4>
              </div>
              <span className="text-xs text-slate-500 font-mono">Ledger History</span>
            </div>

            {customerTransactions.length > 0 ? (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Order Ref</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Petroleum Products & Hardware</th>
                      <th className="py-2.5 px-3 text-right">Order Total (NGN)</th>
                      <th className="py-2.5 px-3">Payment</th>
                      <th className="py-2.5 px-3">Order Status</th>
                      <th className="py-2.5 px-3 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {customerTransactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{tx.reference}</td>
                        <td className="py-2.5 px-3 font-sans text-slate-600">{formatDate(tx.date)}</td>
                        <td className="py-2.5 px-3 font-sans">
                          {tx.items.map((line, idx) => (
                            <div key={idx} className="text-slate-800 text-[11px]">
                              <span className="font-bold text-slate-900">{line.quantity.toLocaleString()} {line.unit}</span> &bull; {line.itemName}
                            </div>
                          ))}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {formatCurrency(tx.totalAmount)}
                        </td>
                        <td className="py-2.5 px-3 font-sans">{getStatusBadge(tx.paymentStatus)}</td>
                        <td className="py-2.5 px-3 font-sans">{getStatusBadge(tx.transactionStatus)}</td>
                        <td className="py-2.5 px-3 text-right font-sans">
                          {tx.receiptNumber || tx.transactionStatus === 'Completed' ? (
                            <button
                              onClick={() => setActiveReceiptTransaction(tx)}
                              className="text-blue-600 hover:underline font-semibold cursor-pointer"
                            >
                              View Receipt
                            </button>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 bg-slate-50 text-center rounded-lg text-slate-500">
                <p className="font-semibold text-slate-800">No transactions recorded for this customer yet</p>
              </div>
            )}
          </div>

          {/* Associated Waybills & Tickets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs space-y-2">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-600" />
                <span>Associated Fleet Waybills ({customerWaybills.length})</span>
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {customerWaybills.map(wb => (
                  <div key={wb.id} className="p-2 rounded bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px]">
                    <div>
                      <span className="font-mono font-bold text-slate-900">{wb.waybillNumber}</span>
                      <span className="text-slate-400 block">{wb.destination}</span>
                    </div>
                    <div>{getStatusBadge(wb.validationStatus)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs space-y-2">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <LifeBuoy className="w-4 h-4 text-blue-600" />
                <span>Support & Operations Tickets ({customerTickets.length})</span>
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {customerTickets.map(t => (
                  <div key={t.id} className="p-2 rounded bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px]">
                    <div>
                      <span className="font-mono font-bold text-slate-900">{t.ticketRef}</span>
                      <span className="text-slate-500 block truncate max-w-[180px]">{t.subject}</span>
                    </div>
                    <div>{getStatusBadge(t.status)}</div>
                  </div>
                ))}
                {customerTickets.length === 0 && (
                  <p className="text-[11px] text-slate-400 italic">No tickets opened for this client.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Cooknow Energy Operations &bull; Designed by FENUCS LTD</span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
