import React, { useState } from 'react';
import {
  Compass,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Package,
  FileCheck2,
  AlertTriangle,
  LifeBuoy,
  BarChart3,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DemoScenarioGuide: React.FC = () => {
  const { setActiveTab, loadScenario } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [activeScenario, setActiveScenario] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('C');

  const scenarios = [
    {
      id: 'A' as const,
      title: 'Scenario A: Petroleum Order to Sale & Receipt',
      icon: Package,
      badge: 'Depot Stock & Lifecycle Reversal',
      description:
        'Demonstrates how petroleum sales orders automatically deduct depot storage, append customer sales records to the product lifecycle ledger, and generate branded receipts.',
      steps: [
        'Open Transactions tab and click "+ New Sales Order".',
        'Select a registered client (e.g. Sahara Power & Energy Utilities Ltd) and petroleum product (e.g. AGO Automotive Gas Oil).',
        'Mark transaction as "Completed" — observe depot tank volume deduction and lifecycle sales appending.',
        'Click "View Official Receipt" to inspect branded breakdown and test browser printing.',
      ],
      targetTab: 'transactions',
    },
    {
      id: 'B' as const,
      title: 'Scenario B: Tanker Haulage & Valid Waybill',
      icon: FileCheck2,
      badge: 'Fleet Haulage Dispatch',
      description:
        'Validates outgoing road tanker waybills against sales contract reference, off-taker account, destination depot, and exact volumes.',
      steps: [
        'Open Waybills tab and locate waybill WB-OG-8801-A or click "Record New Waybill".',
        'Review the 7-point validation result: transaction exists, customer matches, tanker discharge volumes match.',
        'Status displays green "Validation Passed".',
      ],
      targetTab: 'waybills',
    },
    {
      id: 'C' as const,
      title: 'Scenario C: Incorrect Waybill Discrepancy & Ticket',
      icon: AlertTriangle,
      badge: 'Critical Discrepancy Alert',
      description:
        'Cooknow high-priority requirement: Automated alerts for mismatched waybills with 1-click ticket escalation for manual audit.',
      steps: [
        'Open Waybills tab and view flagged record WB-8805-ERR (associated with TRX-OG-8805).',
        'Notice prominent amber discrepancy alert: Customer Mismatch (West African Bulk Haulage vs Transcorp Power) and Volume Mismatch (66,000L vs 33,000L authorized).',
        'Click "Escalate to Ticketing" to auto-route into Ticketing with prefilled details.',
        'Click "Edit & Revalidate" to correct to 33,000L & matching customer, then run re-validation to verify pass!',
      ],
      targetTab: 'waybills',
    },
    {
      id: 'D' as const,
      title: 'Scenario D: Client Complaint & Telephony Log',
      icon: LifeBuoy,
      badge: 'Customer Resolution',
      description:
        'Demonstrates complaint triage, staff assignment, simulated phone call log, and mandatory resolution notes before closure.',
      steps: [
        'Open Ticketing module to view active issues.',
        'Click on ticket TCK-OG-501 or TCK-OG-502.',
        'Click "Simulate Call" to test the telephony dialer preview and record a call outcome note.',
        'Click "Resolve Ticket" — enter mandatory resolution remarks and watch open ticket counts decrement across the dashboard.',
      ],
      targetTab: 'ticketing',
    },
    {
      id: 'E' as const,
      title: 'Scenario E: Executive Dashboard & Reporting',
      icon: BarChart3,
      badge: 'Business Summary',
      description:
        'Live summary metrics derived from application state, CSV data exports, and General Ledger concept previews.',
      steps: [
        'Inspect Dashboard KPI cards for real-time stock units, low stock alerts, pending orders, and open tickets.',
        'Navigate to Reports tab to review monthly order volumes and inventory valuation by category.',
        'Click "Export CSV" to test raw data extraction for external analytics.',
        'Review the planned "General Ledger Accounting Mapping" architectural preview.',
      ],
      targetTab: 'dashboard',
    },
  ];

  const current = scenarios.find(s => s.id === activeScenario)!;

  const handleRunScenario = (sc: typeof current) => {
    setActiveTab(sc.targetTab);
    loadScenario(sc.id);
  };

  return (
    <div className="no-print bg-slate-900 border-b border-slate-800 text-white transition-all">
      {/* Bar Trigger */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Interactive Demonstration Walkthrough Guide
            </span>
            <span className="hidden sm:inline-block text-xs text-slate-300 ml-2">
              — 5 guided workflows prepared for Cooknow decision makers
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer border border-slate-700"
          >
            <span>{isOpen ? 'Collapse Guide' : 'Open Scenario Guide'}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Scenario Panel */}
      {isOpen && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-2 pb-5 border-t border-slate-800/80">
          {/* Scenario Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
            {scenarios.map(sc => {
              const Icon = sc.icon;
              const isSelected = sc.id === activeScenario;
              return (
                <button
                  key={sc.id}
                  onClick={() => setActiveScenario(sc.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-lg text-left text-xs transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-blue-600/30 border-blue-400 text-white font-semibold shadow-xs'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span className="truncate">{sc.title.split(':')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Active Scenario Detail Card */}
          <div className="bg-slate-800/90 rounded-xl p-4 sm:p-5 border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">{current.title}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase">
                  {current.badge}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{current.description}</p>

              <div className="pt-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Suggested Action Sequence:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {current.steps.map((st, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-slate-300">
                      <span className="w-4 h-4 rounded-full bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{st}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="shrink-0 flex flex-col gap-2">
              <button
                onClick={() => handleRunScenario(current)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <span>Launch This Scenario</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[10px] text-slate-400 text-center">Navigates directly to target screen</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
