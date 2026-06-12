import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consultationApi } from '../../services/consultationApi';
import { clientApi } from '../../services/clientApi';
import { ConsultationCard } from './ConsultationCard';
import {
  SlidersHorizontal,
  FolderLock,
  Trash2,
} from 'lucide-react';

export const ConsultationList: React.FC = () => {
  const queryClient = useQueryClient();
  const [showFilters, setShowFilters] = useState(false);

  // Filters state
  const [search, setSearch] = useState('');
  const [clientId, setClientId] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [durationRange, setDurationRange] = useState(''); // 'short', 'medium', 'long'
  const [showDeleted, setShowDeleted] = useState(false);
  const [sortOrder, setSortOrder] = useState('latest'); // 'latest', 'oldest', 'duration'

  // Fetch clients for dropdown
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientApi.list(),
  });

  // Calculate duration min/max based on range selection
  let minDuration: number | undefined;
  let maxDuration: number | undefined;
  if (durationRange === 'short') {
    maxDuration = 300; // < 5 mins
  } else if (durationRange === 'medium') {
    minDuration = 300;
    maxDuration = 1800; // 5 - 30 mins
  } else if (durationRange === 'long') {
    minDuration = 1800; // > 30 mins
  }

  // Fetch consultations
  const { data: sessions = [], isLoading, error } = useQuery({
    queryKey: [
      'consultations',
      search,
      clientId,
      tagInput,
      startDate,
      endDate,
      durationRange,
      showDeleted,
    ],
    queryFn: () =>
      consultationApi.list({
        search,
        clientId,
        tags: tagInput,
        startDate,
        endDate,
        minDuration,
        maxDuration,
        showDeleted,
      }),
  });

  // Sort sessions client-side
  const sortedSessions = [...sessions].sort((a, b) => {
    if (sortOrder === 'latest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortOrder === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortOrder === 'duration') {
      return b.duration - a.duration;
    }
    return 0;
  });

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: consultationApi.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
    },
  });

  // Hard delete mutation
  const hardDeleteMutation = useMutation({
    mutationFn: consultationApi.hardDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="astro-input pl-11"
            placeholder="Search title, tags, summaries..."
          />
        </div>

        {/* Filter Toggle & Bin Toggle */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-end">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`astro-button-secondary py-2.5 px-4 text-xs font-semibold flex items-center gap-2 ${
              showFilters ? 'bg-slate-800 border-slate-700' : ''
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>

          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`astro-button-secondary py-2.5 px-4 text-xs font-semibold flex items-center gap-2 ${
              showDeleted
                ? 'bg-rose-950/20 text-rose-400 border-rose-900/40 hover:bg-rose-950/30'
                : 'hover:bg-slate-850'
            }`}
          >
            <Trash2 className="h-4 w-4" />
            {showDeleted ? 'Active Sessions' : 'Trash Bin'}
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="glass-panel p-6 border-slate-800 bg-slate-900/30 grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-3 duration-200">
          {/* Client Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">
              Filter By Client
            </label>
            <div className="relative">
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="astro-input py-2 pl-10 pr-6 text-xs"
              >
                <option value="">All Clients</option>
                {clients.map((c) => (
                  <option key={c._id || c.id} value={c._id || c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tag Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-2">
              Filter By Tag
            </label>
            <div className="relative">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="astro-input py-2 pl-10 text-xs"
                placeholder="e.g. Career"
              />
            </div>
          </div>

          {/* Date range */}
          <div className="md:col-span-2 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">
                From Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="astro-input py-2 pl-10 text-xs"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-2">
                To Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="astro-input py-2 pl-10 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Duration range */}
          <div>
            <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">
              Session Duration
            </label>
            <div className="relative">
              <select
                value={durationRange}
                onChange={(e) => setDurationRange(e.target.value)}
                className="astro-input py-2 pl-10 pr-6 text-xs"
              >
                <option value="">Any Duration</option>
                <option value="short">Short (&lt; 5m)</option>
                <option value="medium">Medium (5m - 30m)</option>
                <option value="long">Long (&gt; 30m)</option>
              </select>
            </div>
          </div>

          {/* Sorting */}
          <div>
            <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-2">
              Sort Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="astro-input py-2 text-xs"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
              <option value="duration">Longest Duration</option>
            </select>
          </div>
        </div>
      )}

      {/* List content states */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-astrology-500 border-t-transparent"></div>
          <p className="text-slate-400 text-sm font-medium">Seeking matching sessions...</p>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-6 rounded-2xl text-center">
          <p className="font-semibold">Failed to fetch consultations</p>
          <p className="text-sm mt-1">{(error as any).message || 'Connection timed out'}</p>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {sortedSessions.length === 0 ? (
            <div className="glass-panel p-16 text-center flex flex-col items-center justify-center">
              <FolderLock className="h-14 w-14 text-slate-700 mb-4" />
              <h3 className="text-lg font-bold text-slate-350">
                {showDeleted ? 'Trash bin is empty' : 'No consultations matched your search'}
              </h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">
                {showDeleted
                  ? 'Soft-deleted consultations will appear here and can be restored.'
                  : 'Try adjusting your text search filters or client criteria.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedSessions.map((session) => (
                <ConsultationCard
                  key={session._id}
                  session={session}
                  onRestore={(id) => restoreMutation.mutate(id)}
                  onHardDelete={(id) => {
                    if (confirm('Are you sure you want to permanently delete this session? This action is irreversible.')) {
                      hardDeleteMutation.mutate(id);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default ConsultationList;
