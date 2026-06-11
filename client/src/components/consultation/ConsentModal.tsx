import React, { useState } from 'react';
import { ShieldAlert, CheckSquare, Square, X } from 'lucide-react';

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (timestamp: string) => void;
  clientName: string;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  clientName,
}) => {
  const [consentChecked, setConsentChecked] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (consentChecked) {
      onConfirm(new Date().toISOString());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
      <div className="glass-panel w-full max-w-md p-6 border-indigo-500/30 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5 text-astrology-400">
            <ShieldAlert className="h-5 w-5 text-accent-gold" />
            <span className="font-bold text-slate-200">Recording Consent Required</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <p className="text-sm text-slate-450 leading-relaxed">
            Astrological consultations often contain highly personal, private information. 
            Before recording this session with <strong className="text-slate-200">{clientName}</strong>, 
            please confirm you have obtained their explicit permission.
          </p>

          <div
            onClick={() => setConsentChecked(!consentChecked)}
            className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer select-none transition-all ${
              consentChecked
                ? 'bg-astrology-600/10 border-astrology-500/50 text-slate-250'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
            }`}
          >
            <div className="mt-0.5 shrink-0 text-astrology-400">
              {consentChecked ? (
                <CheckSquare className="h-5 w-5 text-accent-gold" />
              ) : (
                <Square className="h-5 w-5 text-slate-600" />
              )}
            </div>
            <p className="text-xs font-medium leading-relaxed">
              I certify that <strong className="text-slate-350">{clientName}</strong> has consented to having this 
              consultation recorded and analyzed for summary predictions.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button onClick={onClose} className="astro-button-secondary py-2.5 px-4 text-sm">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!consentChecked}
            className="astro-button-primary py-2.5 px-4 text-sm"
          >
            Proceed to Recording
          </button>
        </div>
      </div>
    </div>
  );
};
export default ConsentModal;
