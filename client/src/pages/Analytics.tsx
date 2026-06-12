import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../services/analyticsApi';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { Calendar, Clock, Sparkles } from 'lucide-react';

export const Analytics: React.FC = () => {
  const { data: chartData, isLoading, error } = useQuery({
    queryKey: ['analytics-charts'],
    queryFn: analyticsApi.getCharts,
  });

  const uploadsOverTime = chartData?.uploadsOverTime || [];
  const categoriesDistribution = chartData?.categoriesDistribution || [];
  const durationTrends = chartData?.durationTrends || [];

  // Theme colors matching premium Purples / Golds
  const COLORS = ['#8b5cf6', '#a855f7', '#c084fc', '#fbbf24', '#f43f5e', '#10b981'];

  // Tooltip custom style
  const customTooltipStyle = {
  contentStyle: {
    backgroundColor: '#334155', // slate-700 (much lighter)
    border: '#64748b',
    borderRadius: '7px',
    color: '#ffffff',
    boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
  },
  itemStyle: {
    color: '#ffffff',
    fontWeight: 500,
  },
  labelStyle: {
    color: '#f8fafc',
    fontWeight: 700,
  },
};

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 font-sans">
          Analytics & Insights
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor your upload frequencies, consultation categories, and session duration patterns.
        </p>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-astrology-500 border-t-transparent"></div>
          <p className="text-slate-400 text-sm font-medium">Aggregating chart datasets...</p>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-6 rounded-2xl text-center">
          <p className="font-semibold">Failed to fetch analytics</p>
          <p className="text-sm mt-1">{(error as any).message || 'Connection timed out'}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart 1: Uploads over time */}
          <div className="glass-panel p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-slate-300">
              <Calendar className="h-5 w-5 text-astrology-400" />
              <h3 className="font-bold">Uploads Per Month</h3>
            </div>
            
            <div className="w-full h-80 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={uploadsOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" style={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip {...customTooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="recordings"
                    stroke="#a855f7"
                    strokeWidth={3}
                    activeDot={{ r: 8 }}
                    name="Recordings"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Category Distribution */}
          <div className="glass-panel p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-slate-300">
              <Sparkles className="h-5 w-5 text-accent-gold" />
              <h3 className="font-bold">Consultation Categories</h3>
            </div>
            
            <div className="w-full h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoriesDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                  >
                    {categoriesDistribution.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...customTooltipStyle} />
                  <Legend verticalAlign="bottom" height={36} iconSize={10} style={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Duration trends */}
          <div className="glass-panel p-6 lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="h-5 w-5 text-emerald-450" />
              <h3 className="font-bold">Consultation Duration Trends</h3>
            </div>
            
            <div className="w-full h-80 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={durationTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" style={{ fontSize: 11 }} unit="m" />
                  <Tooltip {...customTooltipStyle} formatter={(v) => [`${v} mins`, 'Average Duration']} />
                  <Bar dataKey="avgMinutes" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Average Minutes">
                    {durationTrends.map((d, index) => (
                      <Cell key={`cell-${index}`} fill={d.avgMinutes > 30 ? '#c084fc' : '#8b5cf6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Analytics;
