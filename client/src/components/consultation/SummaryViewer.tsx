import React, { useState } from 'react';
import type { ConsultationSummary } from '../../services/consultationApi';
import {
  Sparkles,
  Compass,
  FileSpreadsheet,
  CalendarDays,
  Smile,
  AlertCircle,
  Hash,
} from 'lucide-react';

interface SummaryViewerProps {
  summary?: ConsultationSummary;
}

export const SummaryViewer: React.FC<SummaryViewerProps> = ({ summary }) => {
  const [activeTab, setActiveTab] = useState<'topics' | 'recommendations' | 'actions' | 'followups'>('topics');

  if (!summary) {
    return (
      <div className="glass-panel p-8 text-center text-slate-500 flex items-center justify-center gap-2">
        <AlertCircle className="h-5 w-5" />
        No AI Summary available for this session.
      </div>
    );
  }

  const tabs = [
    { id: 'topics', name: 'Key Topics', icon: Compass },
    { id: 'recommendations', name: 'Recommendations', icon: Sparkles },
    { id: 'actions', name: 'Action Items', icon: FileSpreadsheet },
    { id: 'followups', name: 'Follow-Ups', icon: CalendarDays },
  ] as const;

  // Sentiment class decorator
  const getSentimentStyles = (sent: string) => {
    const s = sent.toLowerCase();
    if (s.includes('positive') || s.includes('harmonious') || s.includes('optimistic')) {
      return 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20';
    }
    if (s.includes('insightful') || s.includes('hopeful')) {
      return 'bg-astrology-500/10 text-astrology-400 border-astrology-500/20';
    }
    return 'bg-slate-900 text-slate-400 border-slate-800';
  };

  return (
    <div className="glass-panel border-slate-800/80 bg-slate-900/30 overflow-hidden flex flex-col">
      {/* Header bar: Sentiment & Keywords */}
      <div className="px-6 py-4 bg-slate-950/40 border-b border-slate-850 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Smile className="h-4.5 w-4.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sentiment:</span>
          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${getSentimentStyles(summary.sentiment)}`}>
            {summary.sentiment}
          </span>
        </div>

        {summary.keywords && summary.keywords.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Hash className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-xs text-slate-500 font-semibold mr-1">Keywords:</span>
            {summary.keywords.map((kw) => (
              <span
                key={kw}
                className="text-[10px] px-2 py-0.5 bg-slate-950 border border-slate-850 text-slate-400 rounded font-medium"
              >
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-850 bg-slate-950/20">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-4 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all ${
                active
                  ? 'border-astrology-500 text-astrology-400 bg-astrology-600/5'
                  : 'border-transparent text-slate-450 hover:text-slate-200 hover:bg-slate-900/30'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Content panel */}
      <div className="p-6 min-h-60 flex-1">
        {activeTab === 'topics' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <h4 className="text-sm font-bold text-slate-350 uppercase tracking-widest mb-4">Core Planetary Topics</h4>
            <ul className="space-y-3">
              {summary.keyTopics.map((topic, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-astrology-500 mt-2 shrink-0"></span>
                  <span className="leading-relaxed">{topic}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <h4 className="text-sm font-bold text-slate-350 uppercase tracking-widest mb-4">Remedial Suggestions</h4>
            <ul className="space-y-3">
              {summary.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-gold mt-2 shrink-0"></span>
                  <span className="leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <h4 className="text-sm font-bold text-slate-350 uppercase tracking-widest mb-4">Astrologer Action List</h4>
            <ul className="space-y-3">
              {summary.actionItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'followups' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <h4 className="text-sm font-bold text-slate-350 uppercase tracking-widest mb-4">Next Consult Schedule</h4>
            <ul className="space-y-3">
              {summary.followUps.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
export default SummaryViewer;
