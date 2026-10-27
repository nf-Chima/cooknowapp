import React from 'react';
import {
  Calendar,
  User,
  Building2,
  FileCheck2,
  Layers,
  Truck,
  Receipt,
  LifeBuoy,
  X,
  TrendingUp,
  MapPin,
  Clock,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getStatusBadge } from './Badge';

interface ProductLifecycleModalProps {
  productId: string | null;
  onClose: () => void;
}

export const ProductLifecycleModal: React.FC<ProductLifecycleModalProps> = ({
  productId,
  onClose,
}) => {
  const { inventory, setInspectedCustomerId } = useApp();

  if (!productId) return null;

  const product = inventory.find(i => i.id === productId || i.stockRef === productId);
  if (!product) return null;

  const lc = product.lifecycle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs no-print">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800">
                  {product.stockRef}
                </span>
                <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Product Lifecycle & Custody Ledger
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{product.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[calc(85vh-120px)] overflow-y-auto text-xs text-slate-700">
          {/* Top High-Level Lifecycle Status Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Depot Batch Number
              </span>
              <p className="font-mono font-bold text-slate-900 text-xs mt-0.5">{lc.batchNumber}</p>
              <span className="text-[10px] text-slate-500">{lc.depotTankLocation}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Initial Consignment Received
              </span>
              <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                {lc.initialQuantityReceived.toLocaleString()} {product.unitOfMeasure}
              </p>
              <span className="text-[10px] text-slate-500">Cost: {formatCurrency(lc.totalPurchaseCost)}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Current Available Balance
              </span>
              <p className="font-mono font-bold text-emerald-700 text-sm mt-0.5">
                {product.quantity.toLocaleString()} {product.unitOfMeasure}
              </p>
              <span className="text-[10px] text-slate-500">{getStatusBadge(product.status)}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Total Units Dispatched
              </span>
              <p className="font-mono font-bold text-blue-700 text-sm mt-0.5">
                {lc.totalQuantityDispatched.toLocaleString()} {product.unitOfMeasure}
              </p>
              <span className="text-[10px] text-slate-500">{lc.salesHistory.length} customer sales orders</span>
            </div>
          </div>

          {/* STAGE 1: INBOUND PURCHASE & REFINERY PROCUREMENT */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                  1
                </span>
                <h4 className="font-bold text-sm text-slate-900">
                  Inbound Purchase & Refinery Procurement Details
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {lc.qaQcTestStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Supplier / Refinery:</span>
                <p className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{lc.supplierName}</span>
                </p>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Date Purchased:</span>
                <p className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{formatDate(lc.purchaseDate)}</span>
                </p>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Purchased By (Officer):</span>
                <p className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>{lc.purchasedBy}</span>
                </p>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Inbound Purchase Unit Cost:</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">
                  {formatCurrency(lc.purchaseCostUnit)} per {product.unitOfMeasure}
                </p>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Total Inbound Purchase Capital:</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">
                  {formatCurrency(lc.totalPurchaseCost)}
                </p>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Inspection & Quality Cert #:</span>
                <p className="font-mono font-bold text-blue-700 mt-0.5 flex items-center gap-1">
                  <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>{lc.inspectionCertNumber}</span>
                </p>
              </div>
            </div>
          </div>

          {/* STAGE 2: SALES HISTORY & DISPATCHES (Whom it was sold to, when, amount, and ticket ID) */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                  2
                </span>
                <h4 className="font-bold text-sm text-slate-900">
                  Outbound Sales Dispatches & Fulfillment Journey ({lc.salesHistory.length})
                </h4>
              </div>
              <span className="text-xs text-slate-500">Every customer dispatch linked to this product batch</span>
            </div>

            {lc.salesHistory.length > 0 ? (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Date Sold</th>
                      <th className="py-2.5 px-3">Whom Sold To (Customer)</th>
                      <th className="py-2.5 px-3 text-center">Quantity Sold</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Total Amount (NGN)</th>
                      <th className="py-2.5 px-3">Order Ref / Waybill</th>
                      <th className="py-2.5 px-3">Associated Ticket ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {lc.salesHistory.map(sale => (
                      <tr key={sale.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-sans text-slate-600">{formatDate(sale.saleDate)}</td>
                        <td className="py-2.5 px-3 font-sans">
                          <button
                            onClick={() => {
                              onClose();
                              setInspectedCustomerId(sale.customerId);
                            }}
                            className="font-bold text-blue-700 hover:underline text-left cursor-pointer"
                          >
                            {sale.customerName}
                          </button>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                          {sale.quantitySold.toLocaleString()} {sale.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-700">{formatCurrency(sale.unitSellingPrice)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatCurrency(sale.totalSalesAmount)}</td>
                        <td className="py-2.5 px-3 text-slate-700">
                          <div className="font-bold">{sale.transactionRef}</div>
                          {sale.associatedWaybillNumber && (
                            <span className="text-[10px] text-slate-500 block font-normal">
                              WB: {sale.associatedWaybillNumber}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {sale.associatedTicketId ? (
                            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-blue-50 text-blue-700 border border-blue-200">
                              {sale.associatedTicketId}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-sans italic text-[11px]">Direct Sale</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 bg-slate-50 text-center rounded-lg text-slate-500">
                <Receipt className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                <p className="font-semibold text-slate-800">No outbound customer dispatches yet</p>
                <p className="text-[11px] text-slate-500">This consignment is fully intact in depot storage tank.</p>
              </div>
            )}
          </div>

          {/* STAGE 3: LINKED SUPPORT & OPERATIONAL TICKETS */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                  3
                </span>
                <h4 className="font-bold text-sm text-slate-900">
                  Associated Support & Field Operations Tickets ({lc.linkedTickets.length})
                </h4>
              </div>
              <span className="text-xs text-slate-500">Cross-application synchronization index</span>
            </div>

            {lc.linkedTickets.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {lc.linkedTickets.map(tRef => (
                  <div
                    key={tRef}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800"
                  >
                    <LifeBuoy className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-mono font-bold">{tRef}</span>
                    <span className="text-[10px] text-slate-500">Logged on Support Desk</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                No active operational complaints or testing discrepancies logged against this product SKU.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Cooknow Oil & Gas Core &bull; Custody Transfer Ledger</span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            Close Lifecycle Inspection
          </button>
        </div>
      </div>
    </div>
  );
};
