import React, { useState } from 'react';
import {
  BarChart4,
  Download,
  Building2,
  Coins,
  ShieldCheck,
  RotateCcw,
  BookOpen,
  CreditCard,
  PhoneCall,
  Server,
  Layers,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, exportToCSV } from '../../utils/formatters';
import { ResetDataModal } from '../common/ResetDataModal';
import { TestVerificationModal } from '../common/TestVerificationModal';

export const ReportsSettingsModule: React.FC = () => {
  const {
    inventory,
    transactions,
    waybills,
    tickets,
    suppliers,
    customers,
    currentRole,
    setCurrentRole,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'settings' | 'future_gl' | 'future_pay'>('analytics');
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);

  // Derived financial & inventory metrics
  const totalStockUnits = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const totalCostValuation = inventory.reduce((sum, item) => sum + item.costPrice * item.quantity, 0);
  const totalRetailValuation = inventory.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
  const projectedGrossMargin = totalRetailValuation - totalCostValuation;

  const completedTx = transactions.filter(t => t.transactionStatus === 'Completed');
  const completedSalesTotal = completedTx.reduce((sum, t) => sum + t.totalAmount, 0);
  const collectedCash = transactions
    .filter(t => t.paymentStatus === 'Paid')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const waybillPassCount = waybills.filter(w => w.validationStatus === 'Validation Passed').length;
  const waybillReviewCount = waybills.filter(w => w.validationStatus === 'Requires Review' || w.validationStatus === 'Rejected').length;
  const waybillPassRate = waybills.length > 0 ? Math.round((waybillPassCount / waybills.length) * 100) : 100;

  const resolvedTicketsCount = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

  const handleExportFullOperationalReport = () => {
    const summaryData = [
      { Metric: 'Total Catalog Items', Value: inventory.length },
      { Metric: 'Total Warehouse Units', Value: totalStockUnits },
      { Metric: 'Total Inventory Wholesale Cost (NGN)', Value: totalCostValuation },
      { Metric: 'Total Inventory Retail Value (NGN)', Value: totalRetailValuation },
      { Metric: 'Completed Sales Orders', Value: completedTx.length },
      { Metric: 'Total Completed Sales Revenue (NGN)', Value: completedSalesTotal },
      { Metric: 'Waybills Validated', Value: waybills.length },
      { Metric: 'Waybill Compliance Rate (%)', Value: `${waybillPassRate}%` },
      { Metric: 'Total Support Tickets Logged', Value: tickets.length },
      { Metric: 'Total Tickets Resolved', Value: resolvedTicketsCount },
    ];
    exportToCSV(summaryData, 'Cooknow_Executive_Business_Summary');
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'analytics'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Operational Reports & Metrics
          </button>
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'settings'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Prototype Settings & Controls
          </button>
          <button
            onClick={() => setActiveSubTab('future_gl')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'future_gl'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Accounting & General Ledger (Planned)
          </button>
          <button
            onClick={() => setActiveSubTab('future_pay')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'future_pay'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Payments & Telephony (Planned)
          </button>
        </div>

        {activeSubTab === 'analytics' && (
          <button
            onClick={handleExportFullOperationalReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Executive Summary CSV</span>
          </button>
        )}
      </div>

      {/* --- SUB TAB 1: OPERATIONAL REPORTS --- */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Warehouse Stock Valuation (Cost)
              </span>
              <p className="text-xl font-bold font-mono text-slate-900 mt-1">
                {formatCurrency(totalCostValuation)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">{totalStockUnits} total equipment units on hand</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Projected Wholesale Realisation
              </span>
              <p className="text-xl font-bold font-mono text-blue-700 mt-1">
                {formatCurrency(totalRetailValuation)}
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                +{formatCurrency(projectedGrossMargin)} gross spread
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Completed Sales Revenue
              </span>
              <p className="text-xl font-bold font-mono text-emerald-700 mt-1">
                {formatCurrency(completedSalesTotal)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">{completedTx.length} settled customer orders</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Waybill Verification Rate
              </span>
              <p className="text-xl font-bold font-mono text-slate-900 mt-1">
                {waybillPassRate}% Pass
              </p>
              <p className="text-[11px] text-amber-700 font-semibold mt-1">
                {waybillReviewCount} discrepancy exception(s)
              </p>
            </div>
          </div>

          {/* Detailed Breakdown Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Stock Valuation Breakdown */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">Inventory Valuation by Category</h3>
                <span className="text-xs text-slate-400 font-mono">Real-time counts</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-center">Units</th>
                      <th className="py-2.5 px-3 text-right">Cost Value</th>
                      <th className="py-2.5 px-3 text-right">Retail Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {Array.from(new Set(inventory.map(i => i.category))).map(cat => {
                      const catItems = inventory.filter(i => i.category === cat);
                      const catUnits = catItems.reduce((s, i) => s + i.quantity, 0);
                      const catCost = catItems.reduce((s, i) => s + i.costPrice * i.quantity, 0);
                      const catRetail = catItems.reduce((s, i) => s + i.sellingPrice * i.quantity, 0);

                      return (
                        <tr key={cat} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-sans font-medium text-slate-900">{cat}</td>
                          <td className="py-2.5 px-3 text-center text-slate-700">{catUnits}</td>
                          <td className="py-2.5 px-3 text-right text-slate-600">{formatCurrency(catCost)}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-blue-700">{formatCurrency(catRetail)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sales by Customer Breakdown */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">Commercial Client Volume Leaders</h3>
                <span className="text-xs text-slate-400 font-mono">8 active partners</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Client</th>
                      <th className="py-2.5 px-3 text-center">Orders</th>
                      <th className="py-2.5 px-3 text-right">Total Recorded Spend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customers
                      .sort((a, b) => b.totalSpend - a.totalSpend)
                      .slice(0, 6)
                      .map(c => {
                        const count = transactions.filter(t => t.customerId === c.id).length;
                        return (
                          <tr key={c.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3">
                              <span className="font-semibold text-slate-900">{c.name}</span>
                              <span className="text-[10px] text-slate-400 block">{c.cityState}</span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">{count}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                              {formatCurrency(c.totalSpend)}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SUB TAB 2: PROTOTYPE SETTINGS & CONTROLS --- */}
      {activeSubTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Cooknow Prototype Demonstration Settings</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configured specifically for the FENUCS GROUP LTD client validation presentation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
              {/* Profile */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Business Entity Profile
                </h4>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <p><strong>Client Organization:</strong> Cooknow Commercial Solutions Ltd</p>
                  <p><strong>Operating Currency:</strong> Nigerian Naira (NGN - ₦)</p>
                  <p><strong>Demonstration VAT Rate:</strong> 7.5% (Configurable setting, not fiscal invoice)</p>
                  <p><strong>Primary Warehouse:</strong> Central Hub, Ikeja Industrial Estate, Lagos</p>
                  <p><strong>Fleet Tracking:</strong> Interstate Haulage & Regional Dispatch</p>
                </div>
              </div>

              {/* Developer Attribution */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Software Architecture & Developer
                </h4>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <p><strong>Developed By:</strong> Designed by FENUCS LTD</p>
                  <p><strong>Prototype Build:</strong> v2.0.0-oil-and-gas-edition</p>
                  <p><strong>Target Delivery:</strong> Proposed 8-week production implementation cycle</p>
                  <p><strong>Technical Architecture:</strong> FENUCS Software Engineering Team</p>
                </div>
              </div>
            </div>

            {/* Simulated Role Persona Switcher */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Simulated Permission Persona (Demonstration View)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Allows Cooknow decision makers to preview the system from different staff perspectives.
                  (Production will enforce strict JWT/OAuth token verification on backend).
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  'Administrator',
                  'Operations Manager',
                  'Inventory Staff',
                  'Customer Support Staff',
                ].map(r => (
                  <button
                    key={r}
                    onClick={() => setCurrentRole(r as any)}
                    className={`p-3 rounded-lg border text-xs font-semibold text-left transition-all cursor-pointer ${
                      currentRole === r
                        ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>{r}</div>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {currentRole === r ? 'Active Persona' : 'Click to preview'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reset & Test Audit Buttons */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Integrity Verification & Data Reset
                </h4>
                <p className="text-xs text-slate-500">
                  Run the 20-point business logic suite or restore original demonstration dataset.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTestModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Run System Audit (20 Tests)</span>
                </button>

                <button
                  onClick={() => setResetModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Demo Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SUB TAB 3: PLANNED ACCOUNTING / GENERAL LEDGER CONCEPT --- */}
      {activeSubTab === 'future_gl' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Accounting & General Ledger Synchronization (Planned Production Integration)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                  Phase 2 Architecture
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Illustrative architectural mapping showing how eligible Cooknow transactions map to standard double-entry journal postings.
              </p>
            </div>
          </div>

          {/* Honest Boundary Notice */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-blue-950">Architectural Pre-Condition Requirements</p>
              <p className="mt-1 leading-relaxed text-blue-900/90">
                To activate production GL sync, Cooknow will confirm its target ERP/accounting system (e.g. QuickBooks Online, Sage 50, Microsoft Dynamics, or SAP Business One). FENUCS GROUP LTD will establish sandbox OAuth credentials, chart-of-accounts mapping, and an idempotent sync queue preventing duplicate journals.
              </p>
            </div>
          </div>

          {/* Conceptual Mapping Preview Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Illustrative Posting Schema for Bulk AGO Sale TRX-OG-8801 (Sahara Power & Energy)
            </h4>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-2.5 px-4">Account Code & Name</th>
                    <th className="py-2.5 px-4">Ledger Type</th>
                    <th className="py-2.5 px-4 text-right">Debit (NGN)</th>
                    <th className="py-2.5 px-4 text-right">Credit (NGN)</th>
                    <th className="py-2.5 px-4">Memo / Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  <tr>
                    <td className="py-2.5 px-4 font-sans font-semibold text-slate-900">
                      1200 - Accounts Receivable / Petroleum Collections
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-600">Asset</td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">₦48,375,000.00</td>
                    <td className="py-2.5 px-4 text-right text-slate-400">—</td>
                    <td className="py-2.5 px-4 font-sans text-slate-500">TRX-OG-8801 Invoice Sahara Power Egbin Station</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-sans font-semibold text-slate-900">
                      4010 - Automotive Gas Oil (AGO Diesel) Off-take Revenue
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-600">Revenue</td>
                    <td className="py-2.5 px-4 text-right text-slate-400">—</td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">₦45,000,000.00</td>
                    <td className="py-2.5 px-4 font-sans text-slate-500">Gross revenue for 40,000 Litres AGO Diesel</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-sans font-semibold text-slate-900">
                      2150 - Value Added Tax Payable (VAT 7.5%)
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-600">Liability</td>
                    <td className="py-2.5 px-4 text-right text-slate-400">—</td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">₦3,375,000.00</td>
                    <td className="py-2.5 px-4 font-sans text-slate-500">Output VAT on bulk commercial petroleum supply</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="py-2.5 px-4 font-sans font-semibold text-slate-900">
                      5010 - Cost of Goods Sold (COGS - Petroleum Depot Storage)
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-600">Expense</td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">₦38,000,000.00</td>
                    <td className="py-2.5 px-4 text-right text-slate-400">—</td>
                    <td className="py-2.5 px-4 font-sans text-slate-500">Inventory cost valuation (40,000L @ ₦950/L Dangote Refinery)</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="py-2.5 px-4 font-sans font-semibold text-slate-900">
                      1300 - Bulk Petroleum Depot Stock
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-600">Asset</td>
                    <td className="py-2.5 px-4 text-right text-slate-400">—</td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">₦38,000,000.00</td>
                    <td className="py-2.5 px-4 font-sans text-slate-500">Depot tank discharge deduction to tanker haulage</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-400 italic mt-2">
              Note: This is an architectural preview only. No external general ledger software has been synchronized in this prototype.
            </p>
          </div>
        </div>
      )}

      {/* --- SUB TAB 4: PAYMENTS & TELEPHONY CONCEPT --- */}
      {activeSubTab === 'future_pay' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">
                Payment Gateway Integration (Planned Production Feature)
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              In this prototype, payment statuses are recorded for demonstration workflows (Paid, Partially Paid, Unpaid). In production, Cooknow will integrate Paystack / Flutterwave automated checkout and virtual NUBAN accounts with webhook verification.
            </p>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <p><strong>Proposed Providers:</strong> Paystack (Nigeria), Flutterwave, Direct Corporate Bank NIP APIs</p>
              <p><strong>Security Requirements:</strong> Zero raw card handling; PCI-DSS tokenization; Webhook signature validation with HMAC-SHA512.</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                Telephony & Call Center Integration (Planned Production Feature)
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cooknow customer and ticket screens include a working interactive call simulator. In production, this will connect to WebRTC telephony (Twilio Voice or Infobip) allowing support agents to dial customer phone numbers with call recording and automated ticket attachment.
            </p>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <p><strong>Proposed Engine:</strong> WebRTC Softphone / Twilio Voice SDK</p>
              <p><strong>Compliance & Consent:</strong> NDPR compliant call recording disclaimers and retention policy.</p>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ResetDataModal isOpen={resetModalOpen} onClose={() => setResetModalOpen(false)} />
      <TestVerificationModal isOpen={testModalOpen} onClose={() => setTestModalOpen(false)} />
    </div>
  );
};
