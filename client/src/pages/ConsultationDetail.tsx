import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consultationApi } from '../services/consultationApi';
import type { ConsultationData } from '../services/consultationApi';
import { AudioPlayer } from '../components/audio/AudioPlayer';
import { SummaryViewer } from '../components/consultation/SummaryViewer';
import {
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Download,
  Trash2,
  ArrowLeft,
  Edit2,
  FileText,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export const ConsultationDetail: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editTags, setEditTags] = useState('');

  // 1. Fetch consultation data
  const { data: session, isLoading, error } = useQuery({
    queryKey: ['consultation', id],
    queryFn: () => consultationApi.getById(id),
    enabled: !!id,
  });

  // 2. Update mutation
  const updateMutation = useMutation({
    mutationFn: (body: Partial<ConsultationData>) => consultationApi.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultation', id] });
      setIsEditing(false);
    },
  });

  // 3. Soft-delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => consultationApi.softDelete(id),
    onSuccess: () => {
      navigate('/consultations');
    },
  });

  const handleEditOpen = () => {
    if (session) {
      setEditTitle(session.title);
      setEditNotes(session.notes || '');
      setEditTags(session.tags.join(', '));
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (!editTitle) return;
    const tags = editTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    updateMutation.mutate({
      title: editTitle,
      notes: editNotes,
      tags,
    });
  };

  const handleDelete = () => {
    if (confirm('Move this consultation to trash?')) {
      deleteMutation.mutate();
    }
  };

  const handleExport = async (format: 'md' | 'txt') => {
    try {
      const content = await consultationApi.exportFile(id, format);
      const mime = format === 'txt' ? 'text/plain' : 'text/markdown';
      const blob = new Blob([content], { type: mime });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `consultation-${id}.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to generate export file');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-astrology-500 border-t-transparent"></div>
        <p className="text-slate-400 text-sm font-medium">Reconstructing consultation chart...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-455 p-8 rounded-2xl text-center max-w-xl mx-auto">
        <p className="font-semibold">Consultation details not found</p>
        <p className="text-sm mt-1">{(error as any)?.message || 'Access denied or deleted'}</p>
        <Link to="/consultations" className="astro-button-secondary mt-6 inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Back button & Action list */}
      <div className="flex items-center justify-between">
        <Link
          to="/consultations"
          className="text-slate-400 hover:text-slate-200 text-sm font-medium flex items-center gap-2"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          Back to Sessions
        </Link>

        <div className="flex items-center gap-2">
          {!isEditing && (
            <>
              <button
                onClick={handleEditOpen}
                className="astro-button-secondary py-2 px-3 text-xs flex items-center gap-1.5 hover:bg-slate-800"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit Details
              </button>
              <button
                onClick={handleDelete}
                className="p-2 bg-slate-900 hover:bg-rose-950/20 text-slate-400 hover:text-rose-450 border border-slate-800 hover:border-rose-950/30 rounded-lg transition-colors"
                title="Trash"
              >
                <Trash2 className="h-4.5 w-4.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Overview Block */}
      <div className="glass-panel p-8 bg-gradient-to-br from-slate-900/60 to-slate-950/20 border-slate-800/80">
        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="astro-input text-lg font-bold"
              placeholder="Consultation Title"
            />
            <input
              type="text"
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              className="astro-input text-sm"
              placeholder="Tags (comma separated)"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsEditing(false)}
                className="astro-button-secondary py-2 px-3 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="astro-button-primary py-2 px-3 text-xs"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {session.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2.5 py-0.5 rounded-full bg-astrology-600/10 border border-astrology-550/20 text-astrology-400 font-bold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight leading-snug">
                {session.title}
              </h2>
            </div>

            {/* Meta tags grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-400 pt-4 border-t border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <User className="h-4.5 w-4.5 text-slate-500" />
                <div>
                  <p className="text-[10px] text-slate-550 font-bold uppercase tracking-wider">Client</p>
                  <Link to="/clients" className="font-semibold text-slate-350 hover:underline">
                    {session.clientId?.name || 'Deleted Client'}
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Calendar className="h-4.5 w-4.5 text-slate-500" />
                <div>
                  <p className="text-[10px] text-slate-550 font-bold uppercase tracking-wider">Date</p>
                  <span className="font-semibold text-slate-350">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="h-4.5 w-4.5 text-slate-500" />
                <div>
                  <p className="text-[10px] text-slate-550 font-bold uppercase tracking-wider">Duration</p>
                  <span className="font-semibold text-slate-350">
                    {Math.floor(session.duration / 60)}m {session.duration % 60}s
                  </span>
                </div>
              </div>

              {/* Consent check status (Display Consent Status on detail page) */}
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-450" />
                <div>
                  <p className="text-[10px] text-slate-550 font-bold uppercase tracking-wider">Consent Verified</p>
                  <span className="text-xs font-semibold text-emerald-400" title={`Logged at ${new Date(session.consentTimestamp).toLocaleString()}`}>
                    Yes ({new Date(session.consentTimestamp).toLocaleDateString()})
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Audio Player */}
      <AudioPlayer src={session.recordingUrl} />

      {/* Main Insights and transcripts structure */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Summary Viewer (Tabs) & Export triggers */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-900">
            <div className="flex items-center gap-2 text-slate-350">
              <Sparkles className="h-4.5 w-4.5 text-accent-gold" />
              <h3 className="font-bold text-sm uppercase tracking-wider">AI Structured Report</h3>
            </div>
            
            {/* Export triggers */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleExport('md')}
                className="text-[10px] py-1 px-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded font-semibold flex items-center gap-1.5 transition-all"
              >
                <Download className="h-3 w-3" />
                Markdown
              </button>
              <button
                onClick={() => handleExport('txt')}
                className="text-[10px] py-1 px-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded font-semibold flex items-center gap-1.5 transition-all"
              >
                <Download className="h-3 w-3" />
                Plain Text
              </button>
            </div>
          </div>

          <SummaryViewer summary={session.summary} />

          {/* Transcript Viewer */}
          <div className="glass-panel p-6 space-y-4 bg-slate-900/10 border-slate-850">
            <div className="flex items-center gap-2 text-slate-350 pb-2 border-b border-slate-850">
              <MessageSquare className="h-4.5 w-4.5 text-astrology-400" />
              <h3 className="font-bold text-sm uppercase tracking-wider">Full Session Transcript</h3>
            </div>
            
            <div className="max-h-72 overflow-y-auto pr-2 space-y-4">
              {session.transcript ? (
                session.transcript.split('\n\n').map((para, i) => {
                  const isAstrologer = para.startsWith('Astrologer:');
                  return (
                    <div
                      key={i}
                      className={`p-3.5 rounded-xl border text-sm leading-relaxed ${
                        isAstrologer
                          ? 'bg-astrology-600/5 border-astrology-550/15 text-slate-250 ml-6'
                          : 'bg-slate-950/40 border-slate-850 text-slate-350 mr-6'
                      }`}
                    >
                      {para}
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-500 text-sm italic">No transcript generated.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Personal Notes & Metadata updates */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-slate-350 pb-2 border-b border-slate-900">
            <FileText className="h-4.5 w-4.5 text-slate-500" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Astrologer Notes</h3>
          </div>

          {isEditing ? (
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              className="astro-input min-h-60 resize-y text-sm"
              placeholder="Astrologer notes..."
            />
          ) : (
            <div className="glass-panel p-6 bg-slate-900/20 border-slate-850 min-h-40">
              {session.notes ? (
                <p className="text-xs text-slate-350 leading-relaxed whitespace-pre-line">
                  {session.notes}
                </p>
              ) : (
                <p className="text-xs text-slate-550 italic">
                  No notes recorded for this consultation. Click 'Edit Details' above to add notes.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ConsultationDetail;
