import React from 'react';

interface BadgeProps {
  variant?: 'emerald' | 'amber' | 'rose' | 'blue' | 'purple' | 'slate' | 'cyan';
  text: string;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'slate', text, size = 'md', dot = false }) => {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold',
    amber: 'bg-amber-100 text-amber-950 border-amber-300 font-semibold',
    rose: 'bg-rose-50 text-rose-900 border-rose-300 font-semibold',
    blue: 'bg-blue-50 text-blue-900 border-blue-300 font-semibold',
    purple: 'bg-purple-50 text-purple-950 border-purple-300 font-semibold',
    slate: 'bg-slate-100 text-slate-900 border-slate-300 font-semibold',
    cyan: 'bg-cyan-50 text-cyan-950 border-cyan-300 font-semibold',
  };

  const dotColorMap = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    slate: 'bg-slate-500',
    cyan: 'bg-cyan-500',
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium tracking-tight ${colorMap[variant]} ${sizeClass}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColorMap[variant]}`} />}
      {text}
    </span>
  );
};

export function getStatusBadge(status: string) {
  switch (status) {
    // Inventory
    case 'In Stock':
      return <Badge variant="emerald" text="In Stock" dot />;
    case 'Low Stock':
      return <Badge variant="amber" text="Low Stock" dot />;
    case 'Out of Stock':
      return <Badge variant="rose" text="Out of Stock" dot />;

    // Transactions
    case 'Completed':
      return <Badge variant="emerald" text="Completed" dot />;
    case 'Pending':
      return <Badge variant="amber" text="Pending" dot />;
    case 'Draft':
      return <Badge variant="slate" text="Draft" dot />;
    case 'Cancelled':
      return <Badge variant="rose" text="Cancelled" dot />;

    // Payments
    case 'Paid':
      return <Badge variant="emerald" text="Paid" />;
    case 'Partially Paid':
      return <Badge variant="amber" text="Partially Paid" />;
    case 'Unpaid':
      return <Badge variant="rose" text="Unpaid" />;
    case 'Refunded':
      return <Badge variant="purple" text="Refunded" />;

    // Waybill validation
    case 'Validation Passed':
      return <Badge variant="emerald" text="Validation Passed" dot />;
    case 'Requires Review':
      return <Badge variant="amber" text="Requires Review" dot />;
    case 'Rejected':
      return <Badge variant="rose" text="Rejected" dot />;
    case 'Not Checked':
      return <Badge variant="slate" text="Not Checked" dot />;

    // Delivery status
    case 'Delivered':
      return <Badge variant="emerald" text="Delivered" />;
    case 'In Transit':
      return <Badge variant="blue" text="In Transit" />;
    case 'Dispatched':
      return <Badge variant="cyan" text="Dispatched" />;
    case 'Awaiting Dispatch':
      return <Badge variant="amber" text="Awaiting Dispatch" />;
    case 'Delivery Exception':
      return <Badge variant="rose" text="Delivery Exception" dot />;

    // Tickets
    case 'Open':
      return <Badge variant="blue" text="Open" dot />;
    case 'In Progress':
      return <Badge variant="purple" text="In Progress" dot />;
    case 'Pending Response':
      return <Badge variant="amber" text="Pending Response" dot />;
    case 'Resolved':
      return <Badge variant="emerald" text="Resolved" dot />;
    case 'Closed':
      return <Badge variant="slate" text="Closed" />;

    // Priority
    case 'Urgent':
      return <Badge variant="rose" text="Urgent" />;
    case 'High':
      return <Badge variant="amber" text="High" />;
    case 'Normal':
      return <Badge variant="blue" text="Normal" />;
    case 'Low':
      return <Badge variant="slate" text="Low" />;

    default:
      return <Badge variant="slate" text={status} />;
  }
}
