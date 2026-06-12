import React from 'react';
import { Link } from 'react-router-dom';
import type { ConsultationData } from '../../services/consultationApi';
import { Clock, Calendar, User, Tag, ArrowRight, RotateCcw, Trash } from 'lucide-react';

interface ConsultationCardProps {
  session: ConsultationData;
  onRestore?: (id: string) => void;
  onHardDelete?: (id: string) => void;
}

export const ConsultationCard: React.FC<ConsultationCardProps> = ({
  session,
  onRestore,
  onHardDelete,
}) => {
  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}m ${remainingSecs}s`;
  };

  const id = session._id;

  return (
    <div className="glass-panel glass-panel-hover p-6 flex flex-col justify-between gap-5 relative group overflow-hidden">
      {/* Visual top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-astrology-600 to-indigo-650 opacity-20 group-hover:opacity-100 transition-opacity duration-300"></div>

      <div className="space-y-4">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
              Recorded Session
            </span>
            {session.isDeleted && (
              <span className="text-[9px] px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold tracking-wider uppercase">
                In Bin
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-100 truncate group-hover:text-astrology-350 transition-colors">
            {session.title}
          </h3>
        </div>

        {/* Client details & meta */}
        <div className="space-y-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-500 shrink-0" />
            <span className="font-semibold text-slate-300">{session.clientId?.name || 'Deleted Client'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-500 shrink-0" />
            <span>{new Date(session.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-500 shrink-0" />
            <span>{formatDuration(session.duration)}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/60">
          {session.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-950 border border-slate-850 text-slate-400 font-semibold"
            >
              <Tag className="h-2.5 w-2.5 text-astrology-500" />
              {tag}
            </span>
          ))}
          {session.tags.length > 3 && (
            <span className="text-[9px] text-slate-500 font-bold self-center">
              +{session.tags.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-850">
        {session.isDeleted ? (
          <>
            <button
              onClick={() => onRestore && onRestore(id)}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-300 py-2 rounded-lg text-xs font-bold transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5 text-emerald-450" />
              Restore
            </button>
            <button
              onClick={() => onHardDelete && onHardDelete(id)}
              className="p-2 bg-slate-900 border border-slate-800 hover:bg-rose-950/20 hover:border-rose-900 text-slate-400 hover:text-rose-450 rounded-lg transition-colors"
              title="Delete Permanently"
            >
              <Trash className="h-4 w-4" />
            </button>
          </>
        ) : (
          <Link
            to={`/consultations/${id}`}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-astrology-950 to-indigo-950 hover:from-astrology-900 hover:to-indigo-900 text-astrology-300 border border-astrology-850 hover:border-astrology-700 text-xs font-bold py-2 rounded-lg transition-all active:scale-98"
          >
            Review Prediction Details
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
};
export default ConsultationCard;
