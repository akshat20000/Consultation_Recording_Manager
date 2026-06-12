import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { analyticsApi } from '../services/analyticsApi';
import { consultationApi } from '../services/consultationApi';
import {
  Mic,
  FolderOpen,
  Users,
  Clock,
  Calendar,
  Sparkles,
  ArrowRight,
  UserCheck,
  PlayCircle,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  // 1. Fetch metrics
  const { data: metrics, isLoading: isMetricsLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: analyticsApi.getMetrics,
  });

  // 2. Fetch recent consultations
  const { data: recentConsultations = [], isLoading: isRecentLoading } = useQuery({
    queryKey: ['recent-consultations'],
    queryFn: () => consultationApi.list({}),
  });

  const cards = [
    {
      title: 'Total Recordings',
      value: metrics?.totalRecordings ?? 0,
      icon: FolderOpen,
      color: 'from-astrology-500 to-indigo-650',
      textColor: 'text-astrology-400',
    },
    {
      title: 'Active Clients',
      value: metrics?.totalClients ?? 0,
      icon: Users,
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-400',
    },
    {
      title: 'Consultation Hours',
      value: `${metrics?.totalHours ?? 0} hrs`,
      icon: Clock,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-400',
    },
    {
      title: 'Sessions This Month',
      value: metrics?.recordingsThisMonth ?? 0,
      icon: Calendar,
      color: 'from-sky-500 to-indigo-600',
      textColor: 'text-sky-400',
    },
  ];

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Welcome banner */}
      <div className="glass-panel p-8 bg-gradient-to-r from-slate-900/60 to-indigo-950/20 border-slate-800/80 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 text-accent-gold">
            <Sparkles className="h-5 w-5 fill-accent-gold" />
            <span className="text-xs uppercase tracking-wider font-extrabold">AstroRecord Insights</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-sans m-0">
            Welcome to Your Astrology Workspace
          </h2>
          <p className="text-sm text-slate-400 max-w-xl">
            Record, upload, and search your client consultation audio recordings. Access AI-generated transcripts, summaries, and recommendations instantly.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 relative z-10 shrink-0">
          <Link to="/record" className="astro-button-primary flex items-center gap-2">
            <Mic className="h-5 w-5 text-accent-gold" />
            New Recording
          </Link>
          <Link to="/clients" className="astro-button-secondary flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-slate-400" />
            Add Client
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div>
        <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest mb-4">Core Statistics</h3>
        {isMetricsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-panel h-32 animate-pulse bg-slate-900/40 border-slate-850" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="glass-panel glass-panel-hover p-6 flex items-center justify-between relative overflow-hidden group"
                >
                  {/* Subtle hover background radial glow */}
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-slate-800/10 group-hover:bg-astrology-600/5 blur-2xl transition-all duration-300"></div>
                  
                  <div className="space-y-2 relative z-10">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.title}</p>
                    <h4 className="text-3xl font-extrabold text-slate-100 tracking-tight">{card.value}</h4>
                  </div>
                  
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} shadow-lg shadow-black/25 relative z-10`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Consultations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-900">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest">Recent Consultations</h3>
            <Link to="/consultations" className="text-xs text-astrology-400 hover:text-astrology-300 font-bold flex items-center gap-1 group">
              View All
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {isRecentLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="glass-panel h-24 animate-pulse bg-slate-900/40 border-slate-850" />
              ))}
            </div>
          ) : (
            <>
              {recentConsultations.length === 0 ? (
                <div className="glass-panel p-12 text-center flex flex-col items-center justify-center">
                  <FolderOpen className="h-10 w-10 text-slate-700 mb-2" />
                  <p className="text-sm font-semibold text-slate-400">No recordings found</p>
                  <p className="text-xs text-slate-500 mt-0.5">Start by recording a live session.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentConsultations.slice(0, 3).map((session) => (
                    <div
                      key={session._id}
                      className="glass-panel glass-panel-hover p-5 flex items-center justify-between gap-4 relative group"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center text-astrology-400 shadow-inner">
                          <PlayCircle className="h-6 w-6 text-accent-gold" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-200 group-hover:text-astrology-350 transition-colors truncate">
                            {session.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500 mt-1">
                            <span className="font-medium text-slate-350">{session.clientId?.name || 'Unknown Client'}</span>
                            <span>•</span>
                            <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{Math.floor(session.duration / 60)}m {session.duration % 60}s</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {session.tags.slice(0, 1).map((tag: string) => (
                          <span
                            key={tag}
                            className="hidden sm:inline-block text-[10px] px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-850 text-slate-400 font-semibold"
                          >
                            {tag}
                          </span>
                        ))}
                        <Link
                          to={`/consultations/${session._id}`}
                          className="p-2.5 bg-slate-900 border border-slate-850 hover:bg-slate-800 hover:text-slate-100 hover:border-slate-700 text-slate-400 rounded-xl transition-all"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Quick Tips */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest pb-2 border-b border-slate-900">
            Astro tips
          </h3>
          <div className="glass-panel p-6 space-y-4 bg-gradient-to-br from-slate-900/60 to-slate-950/20 border-slate-800/80">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 shrink-0 rounded-lg bg-astrology-600/10 border border-astrology-500/20 flex items-center justify-center text-astrology-400 text-sm font-bold">
                1
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Obtain Consent First</h5>
                <p className="text-xs text-slate-450 mt-1 leading-relaxed">
                  Always confirm client consent. AstroRecord checks this prior to microphone activation and logs timestamps.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 shrink-0 rounded-lg bg-astrology-600/10 border border-astrology-500/20 flex items-center justify-center text-astrology-400 text-sm font-bold">
                2
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Use Keywords and Tags</h5>
                <p className="text-xs text-slate-450 mt-1 leading-relaxed">
                  Add tags like Career or Match to organize records. They feed into category graphs and search indexers.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 shrink-0 rounded-lg bg-astrology-600/10 border border-astrology-500/20 flex items-center justify-center text-astrology-400 text-sm font-bold">
                3
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Export Summaries</h5>
                <p className="text-xs text-slate-450 mt-1 leading-relaxed">
                  Export report cards in Markdown directly to share predictions with your clients.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
