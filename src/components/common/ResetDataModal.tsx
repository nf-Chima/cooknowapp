import React from 'react';
import { RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Modal } from './Modal';
import { useApp } from '../../context/AppContext';

interface ResetDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResetDataModal: React.FC<ResetDataModalProps> = ({ isOpen, onClose }) => {
  const { resetAllDemoData } = useApp();

  const handleConfirm = () => {
    resetAllDemoData();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reset Demonstration Environment Data"
      subtitle="Restore all Cooknow BMS demo data back to factory seed defaults"
      maxWidth="md"
      actions={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            Cancel & Keep Changes
          </button>
          <button
            onClick={handleConfirm}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Confirm Factory Reset</span>
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-950">Confirm Prototype Data Reset</p>
            <p className="mt-1 text-rose-800 leading-relaxed">
              This will discard all recently created transactions, inventory stock movements, edited waybills, and logged support tickets. The application will restore the initial benchmark seed dataset prepared for Cooknow.
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-600 space-y-2">
          <p className="font-medium text-slate-900">What will be restored:</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>11 commercial equipment items with baseline stock counts</li>
            <li>4 verified Nigerian commercial kitchen suppliers</li>
            <li>8 corporate customer profiles (hotels, bakeries, restaurants)</li>
            <li>12 demonstration transactions and sample receipts</li>
            <li>6 fleet waybills (including deliberate discrepancy case WB-8805-ERR)</li>
            <li>10 support & discrepancy resolution tickets</li>
          </ul>
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Local prototype storage only. No external server data is impacted.</span>
        </div>
      </div>
    </Modal>
  );
};
