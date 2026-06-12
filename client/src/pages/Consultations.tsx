import React from 'react';
import { ConsultationList } from '../components/consultation/ConsultationList';

export const Consultations: React.FC = () => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 font-sans">
          Consultation History
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Review, filter, and export astrological summaries and full recorded transcripts.
        </p>
      </div>

      <ConsultationList />
    </div>
  );
};
export default Consultations;
