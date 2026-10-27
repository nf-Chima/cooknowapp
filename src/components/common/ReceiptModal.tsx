import React from 'react';
import { Printer, CheckCircle2, ShieldAlert, X } from 'lucide-react';
import { Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getStatusBadge } from './Badge';

interface ReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptNo = transaction.receiptNumber || `RCP-${transaction.reference}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-xs">
      {/* Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Receipt Preview</span>
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
              Demo Watermark Active
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div id="printable-receipt" className="p-8 sm:p-10 bg-white relative">
          {/* Subtle Diagonal Demo Watermark */}
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.06] select-none"
            style={{ transform: 'rotate(-30deg)' }}
          >
            <span className="text-6xl font-black uppercase tracking-widest text-slate-900">
              SAMPLE DEMO DATA
            </span>
          </div>

          {/* Receipt Header */}
          <div className="border-b-2 border-slate-900 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black tracking-tight text-slate-900">COOKNOW</span>
                  <span className="text-xs px-2 py-0.5 font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 rounded">
                    Commercial Solutions
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 font-medium">Cooknow Commercial Kitchen Systems Ltd</p>
                <p className="text-xs text-slate-500">Commercial Operations Hub, Lagos & Abuja, Nigeria</p>
                <p className="text-xs text-slate-500">Tel: +234 1 800 COOKNOW | billing@cooknow.ng</p>
              </div>

              <div className="sm:text-right">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Official Sales Receipt</span>
                <p className="text-lg font-bold font-mono text-slate-900 mt-0.5">{receiptNo}</p>
                <p className="text-xs text-slate-600 mt-1">Date: {formatDate(transaction.date)}</p>
                <p className="text-xs text-slate-500 font-mono">Ref: {transaction.reference}</p>
              </div>
            </div>
          </div>

          {/* Customer & Order Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 py-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Bill To Customer</p>
              <p className="text-sm font-semibold text-slate-900 mt-1">{transaction.customerName}</p>
              <p className="text-xs text-slate-600 mt-0.5">{transaction.deliveryAddress}</p>
              <p className="text-xs text-slate-500 mt-0.5">Contact: {transaction.customerPhone}</p>
            </div>

            <div className="sm:text-right">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Payment & Operator</p>
              <div className="mt-1 sm:flex sm:justify-end">
                {getStatusBadge(transaction.paymentStatus)}
              </div>
              <p className="text-xs text-slate-600 mt-1.5">
                Status: <span className="font-medium text-slate-900">{transaction.transactionStatus}</span>
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Handled by: <span className="font-medium text-slate-700">{transaction.operator}</span>
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Amount (NGN)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transaction.items.map((line, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-medium text-slate-800">{line.itemName}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{line.stockRef}</td>
                    <td className="py-2.5 px-3 text-center font-medium text-slate-700">{line.quantity}</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">{formatCurrency(line.unitPrice)}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-900">{formatCurrency(line.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="mt-5 flex justify-end">
            <div className="w-full sm:w-64 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between py-1">
                <span>Subtotal:</span>
                <span className="font-medium text-slate-900">{formatCurrency(transaction.subtotal)}</span>
              </div>
              {transaction.discount > 0 && (
                <div className="flex justify-between py-1 text-emerald-600">
                  <span>Commercial Discount:</span>
                  <span className="font-medium">-{formatCurrency(transaction.discount)}</span>
                </div>
              )}
              <div className="flex justify-between py-1">
                <span className="flex items-center gap-1">
                  VAT (7.5% Demo):
                  <span className="text-[10px] text-slate-400">demo</span>
                </span>
                <span className="font-medium text-slate-900">{formatCurrency(transaction.tax)}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm font-bold text-slate-900">
                <span>Total Amount:</span>
                <span className="text-blue-700">{formatCurrency(transaction.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Legal / Prototype Disclaimer Box */}
          <div className="mt-8 pt-4 border-t border-slate-200">
            <div className="rounded-lg bg-amber-50/80 border border-amber-200/60 p-3 text-amber-900 text-[11px] flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">PROTOTYPE DEMONSTRATION NOTICE:</span> This document is generated for interactive demonstration of the Cooknow Business Management System built by FENUCS GROUP LTD. It utilizes fictional seed data and does not represent a legally compliant fiscal invoice or audited financial instrument.
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
              <p>System Software: Cooknow BMS • Prototype v1.0.0</p>
              <p>Built by FENUCS GROUP LTD</p>
            </div>
          </div>
        </div>

        {/* Bottom Actions (Hidden on print) */}
        <div className="no-print px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Use the print button or browser shortcut (Ctrl+P / Cmd+P) to generate clean PDF.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
