/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppShell } from './components/layout/AppShell';
import { DashboardModule } from './components/modules/DashboardModule';
import { InventoryModule } from './components/modules/InventoryModule';
import { CustomerModule } from './components/modules/CustomerModule';
import { TransactionModule } from './components/modules/TransactionModule';
import { WaybillModule } from './components/modules/WaybillModule';
import { TicketingModule } from './components/modules/TicketingModule';
import { ReportsSettingsModule } from './components/modules/ReportsSettingsModule';
import { TicketingPortalApp } from './components/modules/TicketingPortalApp';
import { ProductLifecycleModal } from './components/common/ProductLifecycleModal';
import { CustomerReportModal } from './components/common/CustomerReportModal';
import { ReceiptModal } from './components/common/ReceiptModal';
import { SimulatedCallModal } from './components/common/SimulatedCallModal';

function AppContent() {
  const {
    activeTab,
    appMode,
    activeReceiptTransaction,
    setActiveReceiptTransaction,
    simulatedCallCustomer,
    setSimulatedCallCustomer,
    inspectedCustomerId,
    setInspectedCustomerId,
    inspectedProductLifecycleId,
    setInspectedProductLifecycleId,
  } = useApp();

  // If user opened the Standalone Ticketing Application
  if (appMode === 'ticketing_desk') {
    return (
      <div className="min-h-screen bg-slate-900 font-sans antialiased text-slate-900">
        <TicketingPortalApp />

        {/* Global Modals active in Ticketing App too */}
        <ProductLifecycleModal
          productId={inspectedProductLifecycleId}
          onClose={() => setInspectedProductLifecycleId(null)}
        />
        <CustomerReportModal
          customerId={inspectedCustomerId}
          onClose={() => setInspectedCustomerId(null)}
        />
        <ReceiptModal
          transaction={activeReceiptTransaction}
          onClose={() => setActiveReceiptTransaction(null)}
        />
        <SimulatedCallModal
          customer={simulatedCallCustomer}
          onClose={() => setSimulatedCallCustomer(null)}
        />
      </div>
    );
  }

  const renderModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardModule />;
      case 'inventory':
        return <InventoryModule />;
      case 'customers':
        return <CustomerModule />;
      case 'transactions':
        return <TransactionModule />;
      case 'waybills':
        return <WaybillModule />;
      case 'ticketing':
        return <TicketingModule />;
      case 'reports':
        return <ReportsSettingsModule />;
      default:
        return <DashboardModule />;
    }
  };

  return <AppShell>{renderModule()}</AppShell>;
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
