import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  User,
  ShieldAlert,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Package,
  Receipt,
  FileText,
  LifeBuoy,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DemoRole } from '../../types';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  onOpenTestModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu, onOpenTestModal }) => {
  const {
    activeTab,
    currentRole,
    setCurrentRole,
    globalSearch,
    setGlobalSearch,
    waybills,
    tickets,
    inventory,
    setActiveTab,
    setAppMode,
    appMode,
  } = useApp();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const titles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Oil & Gas Operations Dashboard', subtitle: 'Real-time overview of petroleum reserves, bulk off-takes, haulage waybills, and SLA tickets' },
    inventory: { title: 'Petroleum Inventory & Refineries', subtitle: 'Manage PMS, AGO, LPG tank volumes, API drilling valves, depot custody, and full lifecycle records' },
    customers: { title: 'Client Directory & Transaction Statements', subtitle: 'Power generation plants, industrial off-takers, marine fleets, and historical purchase statements' },
    transactions: { title: 'Commercial Petroleum Orders & Receipts', subtitle: 'Bulk sales contracts, automated depot stock deductions, and branded receipt printing' },
    waybills: { title: 'Waybills & Tanker Dispatch Verification', subtitle: 'Interstate bulk haulage and automated 7-point discrepancy validation engine' },
    ticketing: { title: 'Ticketing & Field Operations Support', subtitle: 'Resolve client complaints, haulage demurrage, and waybill discrepancy investigations' },
    reports: { title: 'Financial Reports, Analytics & Settings', subtitle: 'Petroleum valuation, gross margin analysis, CSV export, and planned integrations' },
  };

  const currentMeta = titles[activeTab] || { title: 'Cooknow Oil & Gas BMS', subtitle: 'Business Management System' };

  // Calculate unread alerts
  const discrepancyAlerts = waybills.filter(
    w => w.validationStatus === 'Requires Review' || w.validationStatus === 'Rejected'
  );
  const urgentTickets = tickets.filter(t => t.priority === 'Urgent' && t.status !== 'Resolved' && t.status !== 'Closed');

  const roles: DemoRole[] = [
    'Administrator',
    'Operations Manager',
    'Inventory Staff',
    'Customer Support Staff',
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 no-print">
      {/* Topmost Warning & Attribution Banner */}
      <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-center text-xs font-bold tracking-wide flex items-center justify-center gap-2 border-b border-amber-600/20">
        <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
        <span>DEMO ENVIRONMENT — SAMPLE DATA</span>
        <span className="hidden md:inline font-normal text-slate-900">|</span>
        <span className="hidden md:inline font-bold text-slate-950">Cooknow BMS &bull; Designed by FENUCS LTD</span>
      </div>

      {/* Main Header Bar */}
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Section Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {currentMeta.title}
            </h1>
            <p className="hidden sm:block text-xs text-slate-600 font-medium">{currentMeta.subtitle}</p>
          </div>
        </div>

        {/* Center / Right: Global Search & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Launch Standalone Ticketing Desk */}
          <button
            onClick={() => setAppMode(appMode === 'inventory_core' ? 'ticketing_desk' : 'inventory_core')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-300 text-blue-900 hover:bg-blue-100 text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <LifeBuoy className="w-3.5 h-3.5 text-blue-700" />
            <span>{appMode === 'ticketing_desk' ? 'Return to Inventory' : 'Open Ticketing App'}</span>
            <ExternalLink className="w-3 h-3 text-blue-600" />
          </button>

          {/* Global Search Input */}
          <div className="relative w-36 sm:w-56 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              placeholder="Search products, orders, waybills..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100/90 border border-slate-300 rounded-lg focus:bg-white focus:outline-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-500 text-slate-900 font-medium"
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>

          {/* Simulated Role Selector (Simulated Permission View) */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs text-slate-800 transition-colors cursor-pointer"
            >
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                  Simulated View
                </span>
                <span className="font-bold text-slate-900">{currentRole}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
                  <p className="font-bold text-slate-800">Simulated Permission View</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Demonstrates role personas. (Real authorization enforced on backend in production).
                  </p>
                </div>
                {roles.map(r => (
                  <button
                    key={r}
                    onClick={() => {
                      setCurrentRole(r);
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                      currentRole === r ? 'font-bold text-blue-600 bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>{r}</span>
                    {currentRole === r && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="View system alerts"
            >
              <Bell className="w-4 h-4 text-slate-700" />
              {(discrepancyAlerts.length > 0 || urgentTickets.length > 0) && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 text-xs">
                <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">Operational Alerts</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-400/30 font-bold">
                      {discrepancyAlerts.length + urgentTickets.length} Active
                    </span>
                  </div>
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    Close
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {discrepancyAlerts.map(wb => (
                    <div
                      key={wb.id}
                      onClick={() => {
                        setActiveTab('waybills');
                        setNotificationsOpen(false);
                      }}
                      className="p-3 bg-amber-50/50 hover:bg-amber-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-amber-950">Waybill Discrepancy: {wb.waybillNumber}</p>
                          <p className="text-[11px] text-amber-900 mt-0.5 line-clamp-2">
                            {wb.discrepancyDetails[0] || 'Validation exception detected against sales order.'}
                          </p>
                          <span className="text-[10px] text-amber-700 font-semibold mt-1 inline-block">
                            Associated Order: {wb.transactionRef} &rarr;
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {urgentTickets.map(t => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setActiveTab('ticketing');
                        setNotificationsOpen(false);
                      }}
                      className="p-3 bg-rose-50/40 hover:bg-rose-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-rose-950">Urgent Ticket: {t.ticketRef}</p>
                          <p className="text-[11px] text-rose-900 mt-0.5 line-clamp-1">{t.subject}</p>
                          <span className="text-[10px] text-rose-700 font-semibold mt-1 inline-block">
                            Priority: Urgent &bull; Assigned: {t.assignedStaff} &rarr;
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {discrepancyAlerts.length === 0 && urgentTickets.length === 0 && (
                    <div className="p-6 text-center text-slate-500">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                      <p className="font-medium text-slate-700">No Critical Discrepancies</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">All fleet waybills match active sales orders.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Capsule (Personal name removed, replaced with Operations Officer) */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              OO
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight">Operations Officer</p>
              <p className="text-[10px] text-slate-600 font-medium">FENUCS Engineering</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
