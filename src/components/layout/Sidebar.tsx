import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  Users,
  Receipt,
  Truck,
  LifeBuoy,
  BarChart4,
  RotateCcw,
  ShieldCheck,
  Fuel,
  ExternalLink,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  onOpenResetModal: () => void;
  onOpenTestModal: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenResetModal,
  onOpenTestModal,
  mobileOpen,
  setMobileOpen,
}) => {
  const { activeTab, setActiveTab, inventory, waybills, tickets, setAppMode, appMode } = useApp();

  // Dynamic badge counts
  const lowStockCount = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock').length;
  const discrepancyCount = waybills.filter(w => w.validationStatus === 'Requires Review' || w.validationStatus === 'Rejected').length;
  const openTicketCount = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory & Suppliers', icon: Boxes, badge: lowStockCount > 0 ? lowStockCount : undefined, badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/30' },
    { id: 'customers', label: 'Customers & Statements', icon: Users },
    { id: 'transactions', label: 'Transactions & Orders', icon: Receipt },
    {
      id: 'waybills',
      label: 'Waybills & Tankers',
      icon: Truck,
      badge: discrepancyCount > 0 ? `${discrepancyCount} Alert` : undefined,
      badgeColor: 'bg-rose-500/30 text-rose-300 border-rose-400/40 animate-pulse',
    },
    {
      id: 'ticketing',
      label: 'Ticketing (Embedded)',
      icon: LifeBuoy,
      badge: openTicketCount > 0 ? openTicketCount : undefined,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
    },
    { id: 'reports', label: 'Reports & Settings', icon: BarChart4 },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden no-print"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-68 bg-[#0B1528] text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Fuel className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-wider text-white">COOKNOW</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  O&G
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Oil & Gas Energy Operations</p>
            </div>
          </div>
        </div>

        {/* Standalone Ticketing App Switcher Card */}
        <div className="p-3 mx-3 my-2 rounded-xl bg-gradient-to-r from-blue-950/80 to-slate-900 border border-blue-800/60">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
              <LifeBuoy className="w-3.5 h-3.5" />
              Separate Sub-App
            </span>
            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-1 py-0.2 rounded font-mono">
              Live Sync
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug mb-2 font-normal">
            Ticketing runs as its own standalone application with full inventory & customer data sync.
          </p>
          <button
            onClick={() => setAppMode('ticketing_desk')}
            className="w-full py-1.5 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <span>Open Standalone Desk</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Inventory Core Modules
          </p>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${
                      isActive ? 'bg-white/20 text-white border-white/30' : item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick System Tools */}
          <div className="pt-4 mt-2 border-t border-slate-800/60">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Verification & Audit
            </p>

            <button
              onClick={onOpenTestModal}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800/70 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verify 20 Business Rules</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Audit
              </span>
            </button>

            <button
              onClick={onOpenResetModal}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800/70 hover:text-rose-400 transition-colors cursor-pointer mt-1"
            >
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-rose-400" />
                <span>Reset Demo Data</span>
              </div>
            </button>
          </div>
        </div>

        {/* Developer Attribution Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="rounded-lg p-2.5 bg-slate-900/60 border border-slate-800 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Interactive Prototype
            </p>
            <p className="text-xs font-semibold text-white mt-0.5">Designed by FENUCS LTD</p>
            <p className="text-[10px] text-slate-400 mt-1">Cooknow Oil & Gas Division</p>
          </div>
        </div>
      </aside>
    </>
  );
};
