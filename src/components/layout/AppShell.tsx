import React, { useState, ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DemoScenarioGuide } from '../common/DemoScenarioGuide';
import { ReceiptModal } from '../common/ReceiptModal';
import { SimulatedCallModal } from '../common/SimulatedCallModal';
import { ResetDataModal } from '../common/ResetDataModal';
import { TestVerificationModal } from '../common/TestVerificationModal';
import { ProductLifecycleModal } from '../common/ProductLifecycleModal';
import { CustomerReportModal } from '../common/CustomerReportModal';
import { useApp } from '../../context/AppContext';

interface AppShellProps {
  children: ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const {
    activeReceiptTransaction,
    setActiveReceiptTransaction,
    simulatedCallCustomer,
    setSimulatedCallCustomer,
    inspectedCustomerId,
    setInspectedCustomerId,
    inspectedProductLifecycleId,
    setInspectedProductLifecycleId,
  } = useApp();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased">
      {/* Interactive Scenario Walkthrough Guide at the very top */}
      <DemoScenarioGuide />

      <div className="flex flex-1">
        {/* Navigation Sidebar */}
        <Sidebar
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          onOpenResetModal={() => setResetModalOpen(true)}
          onOpenTestModal={() => setTestModalOpen(true)}
        />

        {/* Content Wrapper */}
        <div className="flex-1 flex flex-col lg:pl-68 min-w-0">
          {/* Main Top Header */}
          <Header
            onToggleMobileMenu={() => setMobileOpen(prev => !prev)}
            onOpenTestModal={() => setTestModalOpen(true)}
          />

          {/* Main Viewport Content Region */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>

          {/* Subtle Application Shell Footer */}
          <footer className="no-print border-t border-slate-200 bg-white py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <span className="font-semibold text-slate-700">Cooknow Oil & Gas BMS</span> &bull; Client Demonstration Edition
            </div>
            <div className="flex items-center gap-4 text-slate-500">
              <span>Currency: <strong>NGN (₦)</strong></span>
              <span>&bull;</span>
              <span><strong>Designed by FENUCS LTD</strong></span>
            </div>
          </footer>
        </div>
      </div>

      {/* Modals */}
      <ReceiptModal
        transaction={activeReceiptTransaction}
        onClose={() => setActiveReceiptTransaction(null)}
      />

      <SimulatedCallModal
        customer={simulatedCallCustomer}
        onClose={() => setSimulatedCallCustomer(null)}
      />

      <ProductLifecycleModal
        productId={inspectedProductLifecycleId}
        onClose={() => setInspectedProductLifecycleId(null)}
      />

      <CustomerReportModal
        customerId={inspectedCustomerId}
        onClose={() => setInspectedCustomerId(null)}
      />

      <ResetDataModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
      />

      <TestVerificationModal
        isOpen={testModalOpen}
        onClose={() => setTestModalOpen(false)}
      />
    </div>
  );
};
