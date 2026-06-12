import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { clientApi } from '../services/clientApi';
import { consultationApi } from '../services/consultationApi';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { AudioRecorder } from '../components/audio/AudioRecorder';
import { ConsentModal } from '../components/consultation/ConsentModal';
import {
  FileText,
  AlertCircle,
  Save,
  ShieldCheck,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

export const RecordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialClientId = searchParams.get('clientId') || '';

  // Form states
  const [clientId, setClientId] = useState(initialClientId);
  const [title, setTitle] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [notes, setNotes] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [consentTimestamp, setConsentTimestamp] = useState('');
  const [consentModalOpen, setConsentModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Audio recording hook
  const recorder = useAudioRecorder();

  // Fetch clients to populate dropdown
  const { data: clients = [], isLoading: isClientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientApi.list(),
  });

  const selectedClient = clients.find((c) => (c._id || c.id) === clientId);

  // Sync client name with default title
  useEffect(() => {
    if (selectedClient && !title) {
      const dateStr = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      setTitle(`${selectedClient.name} - Consultation (${dateStr})`);
    }
  }, [selectedClient, title]);

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: consultationApi.create,
    onSuccess: (data) => {
      recorder.clearAudio();
      navigate(`/consultations/${data._id}`);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to upload and save session');
    },
  });

  const handleConsentConfirm = (timestamp: string) => {
    setConsentGiven(true);
    setConsentTimestamp(timestamp);
    setErrorMsg('');
  };
  const handleSave = () => {
    setErrorMsg('');

    if (!clientId) {
      setErrorMsg('Please select a client.');
      return;
    }
    if (!title) {
      setErrorMsg('Please enter a consultation title.');
      return;
    }
    if (!consentGiven) {
      setErrorMsg('Client recording consent is required. Please verify consent.');
      return;
    }
    if (!recorder.audioBlob) {
      setErrorMsg('No audio recording found. Please record a session first.');
      return;
    }

    // Split tags
    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    // Default tag based on category if empty
    if (tags.length === 0) {
      tags.push('General');
    }

    // Prepare FormData
    const formData = new FormData();
    formData.append('clientId', clientId);
    formData.append('title', title);
    formData.append('notes', notes);
    formData.append('tags', JSON.stringify(tags));
    formData.append('consentGiven', 'true');
    formData.append('consentTimestamp', consentTimestamp);
    formData.append('duration', String(recorder.recordingTime));
    formData.append('audio', recorder.audioBlob, 'recording.webm');

    uploadMutation.mutate(formData);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 font-sans">
          Record Consultation
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Record a live consultation session and process it into structured AI prediction reports.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Form: Details */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-panel p-6 space-y-5">
            <h3 className="text-sm font-bold text-slate-350 uppercase tracking-widest pb-3 border-b border-slate-800">
              Session Metadata
            </h3>

            {/* Select Client */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Associate Client
              </label>
              <div className="relative">
                <select
                  value={clientId}
                  onChange={(e) => {
                    setClientId(e.target.value);
                    setTitle(''); // Trigger title recalculation
                  }}
                  className="astro-input pl-11 pr-8 appearance-none cursor-pointer"
                  disabled={isClientsLoading}
                >
                  <option value="">-- Choose Client --</option>
                  {clients.map((client) => (
                    <option key={client._id || client.id} value={client._id || client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Consultation Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="astro-input"
                placeholder="e.g. Career Prediction Reading"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Tags (Comma Separated)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="astro-input pl-11"
                  placeholder="e.g. Career, SaturnTransit, Gemstone"
                />
              </div>
            </div>

            {/* Consent check status */}
            <div className="pt-3 border-t border-slate-800/80">
              <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                Recording Consent
              </label>
              {consentGiven ? (
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg">
                  <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                  Consent logged successfully
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (!clientId) {
                      setErrorMsg('Please select a client first.');
                      return;
                    }
                    setConsentModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 py-2.5 px-4 rounded-xl text-xs font-bold transition-all"
                >
                  <ShieldCheck className="h-4 w-4 text-accent-gold" />
                  Verify Client Consent
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Form: Audio Recorder & Upload Action */}
        <div className="md:col-span-2 space-y-6">
          {/* Recorder hub */}
          <AudioRecorder recorder={recorder} clientName={selectedClient?.name || ''} />

          {/* Session Notes */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-350">
              <FileText className="h-4 w-4 text-astrology-400" />
              <h3 className="font-bold text-sm uppercase tracking-wider">Live Session Notes</h3>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="astro-input min-h-28 resize-y"
              placeholder="Jot down quick details here during the live conversation..."
            />
          </div>

          {/* Save/Upload Action Block */}
          {recorder.audioBlob && (
            <div className="glass-panel p-6 border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-3 duration-250">
              <div>
                <h4 className="font-bold text-slate-200">Recording Completed!</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Audio file ready. Ready to run mock AI processing and generate report cards.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={uploadMutation.isPending}
                className="astro-button-primary flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                {uploadMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 animate-spin text-accent-gold" />
                    Analyzing planetary alignments...
                  </span>
                ) : (
                  <>
                    <Save className="h-5 w-5 text-accent-gold" />
                    Process & Save Session
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Consent Check Modal */}
      {selectedClient && (
        <ConsentModal
          isOpen={consentModalOpen}
          onClose={() => setConsentModalOpen(false)}
          onConfirm={handleConsentConfirm}
          clientName={selectedClient.name}
        />
      )}
    </div>
  );
};
export default RecordPage;
