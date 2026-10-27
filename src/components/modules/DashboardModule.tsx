import React from 'react';
import {
  Boxes,
  AlertTriangle,
  Receipt,
  CheckCircle2,
  Truck,
  LifeBuoy,
  Clock,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { getStatusBadge } from '../common/Badge';

export const DashboardModule: React.FC = () => {
  const {
    inventory,
    transactions,
    waybills,
    tickets,
    auditLogs,
    setActiveTab,
  } = useApp();

  // Dynamic calculations strictly from application state
  const totalStockUnits = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock');
  const outOfStockItems = inventory.filter(i => i.status === 'Out of Stock');

  const pendingTransactions = transactions.filter(t => t.transactionStatus === 'Pending' || t.transactionStatus === 'Draft');
  const completedTransactions = transactions.filter(t => t.transactionStatus === 'Completed');
  const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.totalAmount, 0);

  const awaitingDeliveries = waybills.filter(
    w => w.deliveryStatus === 'Awaiting Dispatch' || w.deliveryStatus === 'In Transit' || w.deliveryStatus === 'Draft'
  );
  const discrepancyWaybills = waybills.filter(
    w => w.validationStatus === 'Requires Review' || w.validationStatus === 'Rejected'
  );

  const openTickets = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress');
  const urgentTickets = tickets.filter(
    t => (t.priority === 'Urgent' || t.priority === 'High') && t.status !== 'Resolved' && t.status !== 'Closed'
  );

  // Group inventory by category for category chart
  const categoryCounts = inventory.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.quantity;
    return acc;
  }, {} as Record<string, number>);

  const categoryEntries = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  // Group tickets by priority
  const priorityCounts = {
    Urgent: tickets.filter(t => t.priority === 'Urgent' && t.status !== 'Resolved' && t.status !== 'Closed').length,
    High: tickets.filter(t => t.priority === 'High' && t.status !== 'Resolved' && t.status !== 'Closed').length,
    Normal: tickets.filter(t => t.priority === 'Normal' && t.status !== 'Resolved' && t.status !== 'Closed').length,
    Low: tickets.filter(t => t.priority === 'Low' && t.status !== 'Resolved' && t.status !== 'Closed').length,
  };

  return (
    <div className="space-y-6">
      {/* Waybill Discrepancy Alert Banner if any exist */}
      {discrepancyWaybills.length > 0 && (
        <div className="rounded-xl bg-amber-500/10 border-2 border-amber-500/40 p-4 sm:p-5 text-amber-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500 text-slate-950 font-bold shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-amber-950">
                  Waybill Verification Alert: {discrepancyWaybills.length} Discrepancy Flagged
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500 text-slate-950 uppercase">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-amber-900/90 mt-1">
                Automated multi-point inspection detected mismatch between dispatch documentation and authorized sales orders (e.g. {discrepancyWaybills[0].waybillNumber}).
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('waybills')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            <span>Audit Waybills</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards Grid (8 Core Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Inventory Units"
          value={totalStockUnits.toLocaleString()}
          subtext={`${inventory.length} distinct catalog items`}
          icon={Boxes}
          variant="blue"
          onClick={() => setActiveTab('inventory')}
          actionText="Inspect inventory"
        />

        <StatCard
          label="Low / Zero Stock Items"
          value={lowStockItems.length}
          subtext={`${outOfStockItems.length} depleted, ${lowStockItems.length - outOfStockItems.length} below threshold`}
          icon={AlertTriangle}
          variant={lowStockItems.length > 0 ? 'amber' : 'emerald'}
          onClick={() => setActiveTab('inventory')}
          actionText="Review reorder requisitions"
        />

        <StatCard
          label="Completed Revenue"
          value={formatCurrency(totalRevenue)}
          subtext={`${completedTransactions.length} settled orders`}
          icon={Receipt}
          variant="emerald"
          onClick={() => setActiveTab('transactions')}
          actionText="View transactions"
        />

        <StatCard
          label="Pending Sales Orders"
          value={pendingTransactions.length}
          subtext="Awaiting approval or dispatch"
          icon={Clock}
          variant="purple"
          onClick={() => setActiveTab('transactions')}
          actionText="Process pending orders"
        />

        <StatCard
          label="Fleet Deliveries In Progress"
          value={awaitingDeliveries.length}
          subtext={`${waybills.length} total logged waybills`}
          icon={Truck}
          variant="blue"
          onClick={() => setActiveTab('waybills')}
          actionText="Track deliveries"
        />

        <StatCard
          label="Discrepancy Alerts"
          value={discrepancyWaybills.length}
          subtext="Waybill mismatches requiring review"
          icon={ShieldAlert}
          variant={discrepancyWaybills.length > 0 ? 'rose' : 'emerald'}
          onClick={() => setActiveTab('waybills')}
          actionText="Resolve discrepancies"
        />

        <StatCard
          label="Active Support Tickets"
          value={openTickets.length}
          subtext={`${tickets.filter(t => t.status === 'Resolved').length} resolved to date`}
          icon={LifeBuoy}
          variant="blue"
          onClick={() => setActiveTab('ticketing')}
          actionText="Open ticketing desk"
        />

        <StatCard
          label="High / Urgent Tickets"
          value={urgentTickets.length}
          subtext="Priority escalation queue"
          icon={AlertTriangle}
          variant={urgentTickets.length > 0 ? 'rose' : 'slate'}
          onClick={() => setActiveTab('ticketing')}
          actionText="View urgent issues"
        />
      </div>

      {/* Quick Launchpad & Workflow Triggers */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Executive Operational Quick Actions</h3>
            <p className="text-xs text-slate-500">Perform direct cross-module operations with immediate state reactivity</p>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Interactive Workflows
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={() => setActiveTab('inventory')}
            className="flex flex-col items-center justify-center p-3.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-700 hover:text-blue-700 transition-all text-center cursor-pointer group"
          >
            <Boxes className="w-5 h-5 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">Add / Adjust Stock</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Inventory Module</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className="flex flex-col items-center justify-center p-3.5 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-slate-700 hover:text-emerald-700 transition-all text-center cursor-pointer group"
          >
            <TrendingUp className="w-5 h-5 text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">Register Customer</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Corporate Directory</span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className="flex flex-col items-center justify-center p-3.5 rounded-lg border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 text-slate-700 hover:text-purple-700 transition-all text-center cursor-pointer group"
          >
            <Receipt className="w-5 h-5 text-purple-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">Create Sales Order</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Deducts Stock & Invoices</span>
          </button>

          <button
            onClick={() => setActiveTab('waybills')}
            className="flex flex-col items-center justify-center p-3.5 rounded-lg border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 text-slate-700 hover:text-amber-700 transition-all text-center cursor-pointer group"
          >
            <Truck className="w-5 h-5 text-amber-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">Record Fleet Waybill</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Run 7-Point Audit</span>
          </button>

          <button
            onClick={() => setActiveTab('ticketing')}
            className="flex flex-col items-center justify-center p-3.5 rounded-lg border border-slate-200 hover:border-rose-400 hover:bg-rose-50/50 text-slate-700 hover:text-rose-700 transition-all text-center cursor-pointer group"
          >
            <LifeBuoy className="w-5 h-5 text-rose-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">Open Support Ticket</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Client & Fleet Issues</span>
          </button>
        </div>
      </div>

      {/* Visual Breakdowns: Stock Distribution & Ticket Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Stock Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Inventory Distribution by Category</h3>
              <p className="text-xs text-slate-500">Live units registered in Cooknow warehouse</p>
            </div>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              View catalog
            </button>
          </div>

          <div className="space-y-3">
            {categoryEntries.map(([cat, qty]) => {
              const percentage = totalStockUnits > 0 ? Math.round((qty / totalStockUnits) * 100) : 0;
              return (
                <div key={cat}>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>{cat}</span>
                    <span className="text-slate-500 font-mono">
                      {qty} units ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ticket Distribution by Priority & SLA Queue */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Active Support & Discrepancy Queue</h3>
              <p className="text-xs text-slate-500">Unresolved operational tickets by urgency</p>
            </div>
            <button
              onClick={() => setActiveTab('ticketing')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Open desk
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Urgent SLA</span>
              <p className="text-xl font-bold text-rose-900 mt-1">{priorityCounts.Urgent}</p>
              <p className="text-[10px] text-rose-600 mt-0.5">Waybill & stock emergencies</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">High Priority</span>
              <p className="text-xl font-bold text-amber-900 mt-1">{priorityCounts.High}</p>
              <p className="text-[10px] text-amber-600 mt-0.5">Interstate delivery delays</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Normal Priority</span>
              <p className="text-xl font-bold text-blue-900 mt-1">{priorityCounts.Normal}</p>
              <p className="text-[10px] text-blue-600 mt-0.5">Invoice clarifications</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-100 border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Low Priority</span>
              <p className="text-xl font-bold text-slate-800 mt-1">{priorityCounts.Low}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">General commercial inquiries</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>Resolved Tickets This Period:</span>
            <span className="font-bold text-emerald-700">
              {tickets.filter(t => t.status === 'Resolved').length} cases
            </span>
          </div>
        </div>
      </div>

      {/* Recent Operational Audit History Feed */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Operational Activity & Audit Trail</h3>
            <p className="text-xs text-slate-500">Live traceable logs of stock issuance, orders, waybill audits, and resolutions</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">{auditLogs.length} events logged</span>
        </div>

        <div className="divide-y divide-slate-100">
          {auditLogs.slice(0, 6).map(log => (
            <div key={log.id} className="py-3 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    log.type === 'warning'
                      ? 'bg-amber-100 text-amber-700'
                      : log.type === 'create'
                      ? 'bg-blue-100 text-blue-700'
                      : log.type === 'validation'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {log.type === 'warning' ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : log.type === 'validation' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : log.type === 'create' ? (
                    <PlusCircle className="w-4 h-4" />
                  ) : (
                    <Layers className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900">{log.title}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {log.module}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{log.description}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] text-slate-400 block font-mono">{log.timestamp}</span>
                <span className="text-[10px] text-slate-500">{log.user}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
