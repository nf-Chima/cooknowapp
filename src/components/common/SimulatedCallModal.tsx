import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, Clock, ShieldAlert, CheckCircle, FileText, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SimulatedCallModalProps {
  customer: { name: string; phone: string; context?: string } | null;
  onClose: () => void;
}

export const SimulatedCallModal: React.FC<SimulatedCallModalProps> = ({ customer, onClose }) => {
  const { addTicketComment, tickets } = useApp();
  const [callState, setCallState] = useState<'dialing' | 'connected' | 'ended'>('dialing');
  const [seconds, setSeconds] = useState(0);
  const [callNotes, setCallNotes] = useState('');
  const [disposition, setDisposition] = useState('Delivery Confirmed with Customer');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!customer) return;
    setCallState('dialing');
    setSeconds(0);
    setSavedSuccess(false);

    // Simulate answering after 2.5 seconds
    const timer = setTimeout(() => {
      setCallState('connected');
    }, 2500);

    return () => clearTimeout(timer);
  }, [customer]);

  useEffect(() => {
    let interval: any;
    if (callState === 'connected') {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  if (!customer) return null;

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallState('ended');
  };

  const handleSaveCallLog = () => {
    // If ticket context is provided, attach to ticket comments
    if (customer.context && customer.context.startsWith('TCK-')) {
      const matched = tickets.find(t => t.ticketRef === customer.context || t.id === customer.context);
      if (matched) {
        addTicketComment(
          matched.id,
          `📞 Simulated Call Log (${formatTimer(seconds)}) to ${customer.phone}: [${disposition}] ${callNotes || 'No additional notes entered.'}`,
          false
        );
      }
    }
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header with Simulation Banner */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold">Simulated Telephony Integration</span>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clear Prototype Disclaimer */}
        <div className="px-5 py-2.5 bg-blue-50/80 border-b border-blue-100 flex items-start gap-2 text-[11px] text-blue-900">
          <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            <strong>PLANNED INTEGRATION PREVIEW:</strong> This is an illustrative simulation. No live cellular or VoIP call is placed. Twilio/Vonage WebRTC integration is scheduled for production.
          </span>
        </div>

        {/* Call Visualizer */}
        <div className="p-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center relative">
            {callState === 'dialing' && (
              <span className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-ping" />
            )}
            {callState === 'connected' && (
              <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-20 animate-pulse" />
            )}
            <Phone
              className={`w-7 h-7 ${
                callState === 'dialing'
                  ? 'text-blue-600 animate-bounce'
                  : callState === 'connected'
                  ? 'text-emerald-600'
                  : 'text-slate-400'
              }`}
            />
          </div>

          <h4 className="mt-3 text-base font-bold text-slate-900">{customer.name}</h4>
          <p className="text-xs font-mono text-slate-500 mt-0.5">{customer.phone}</p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            {callState === 'dialing' && <span className="text-blue-600 font-semibold">Ringing customer line...</span>}
            {callState === 'connected' && (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-700 font-mono font-semibold">Connected: {formatTimer(seconds)}</span>
              </>
            )}
            {callState === 'ended' && (
              <span className="text-slate-500 font-mono">Call Ended ({formatTimer(seconds)})</span>
            )}
          </div>

          {/* Action buttons */}
          {callState !== 'ended' ? (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleEndCall}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Hang Up Call</span>
              </button>
            </div>
          ) : (
            <div className="mt-5 text-left border-t border-slate-100 pt-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Record Call Disposition & Outcome
              </label>
              <select
                value={disposition}
                onChange={e => setDisposition(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-blue-500 mb-2.5"
              >
                <option value="Delivery Confirmed with Customer">Delivery Confirmed with Customer</option>
                <option value="Waybill Discrepancy Clarified">Waybill Discrepancy Clarified</option>
                <option value="Delivery Rescheduled on Customer Request">Delivery Rescheduled on Customer Request</option>
                <option value="Customer Inquired on Stock Availability">Customer Inquired on Stock Availability</option>
                <option value="Left Voicemail / No Answer">Left Voicemail / No Answer</option>
              </select>

              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Operator Notes (Appends to Customer / Ticket Record)
              </label>
              <textarea
                value={callNotes}
                onChange={e => setCallNotes(e.target.value)}
                placeholder="E.g. Spoke with Chef Ken, verified kitchen loading dock will be open at 8 AM..."
                rows={3}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-blue-500"
              />

              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Discard
                </button>
                <button
                  onClick={handleSaveCallLog}
                  disabled={savedSuccess}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs cursor-pointer"
                >
                  {savedSuccess ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Logged!</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5" />
                      <span>Save Call Log</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
