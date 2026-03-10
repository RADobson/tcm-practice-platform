'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subDays,
} from 'date-fns';
import toast from 'react-hot-toast';

type TimeRange = 'week' | 'month' | 'quarter' | 'year' | 'custom';

interface AnalyticsData {
  totalPatients: number;
  totalAppointments: number;
  completedAppointments: number;
  totalRevenue: number;
  avgPerVisit: number;
  appointmentsByType: Record<string, number>;
  appointmentsByDay: Record<string, number>;
  appointmentsByHour: Record<string, number>;
  revenueByMonth: Record<string, number>;
  commonComplaints: { complaint: string; count: number }[];
  commonPatterns: { pattern: string; count: number }[];
  newPatients: number;
  returningPatients: number;
  volumeByDate: Record<string, number>;
}

export default function AnalyticsPage() {
  const { practice } = useAppStore();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const dateRange = useMemo(() => {
    const now = new Date();
    switch (timeRange) {
      case 'week':
        return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'quarter':
        return { start: startOfQuarter(now), end: endOfQuarter(now) };
      case 'year':
        return { start: startOfYear(now), end: endOfYear(now) };
      case 'custom':
        return {
          start: customStart ? new Date(customStart) : subDays(now, 30),
          end: customEnd ? new Date(customEnd) : now,
        };
    }
  }, [timeRange, customStart, customEnd]);

  useEffect(() => {
    if (!practice) return;
    loadAnalytics();
  }, [practice, dateRange]);

  async function loadAnalytics() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        practice_id: practice!.id,
        start_date: format(dateRange.start, 'yyyy-MM-dd'),
        end_date: format(dateRange.end, 'yyyy-MM-dd'),
      });

      const res = await fetch(`/api/analytics?${params}`);
      if (!res.ok) throw new Error('Failed to load analytics');
      const result = await res.json();
      setData(result);
    } catch {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }

  const rangeLabel = useMemo(() => {
    return `${format(dateRange.start, 'MMM d, yyyy')} - ${format(dateRange.end, 'MMM d, yyyy')}`;
  }, [dateRange]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400">Loading analytics...</div>
      </div>
    );
  }

  const maxVolume = data ? Math.max(...Object.values(data.volumeByDate), 1) : 1;
  const maxRevenue = data ? Math.max(...Object.values(data.revenueByMonth), 1) : 1;
  const maxByType = data ? Math.max(...Object.values(data.appointmentsByType), 1) : 1;
  const maxByDay = data ? Math.max(...Object.values(data.appointmentsByDay), 1) : 1;
  const maxByHour = data ? Math.max(...Object.values(data.appointmentsByHour), 1) : 1;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-gray-400">{rangeLabel}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['week', 'month', 'quarter', 'year', 'custom'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={
                timeRange === range
                  ? 'px-3 py-1.5 rounded-lg text-sm font-medium bg-earth-300 text-dark-700'
                  : 'px-3 py-1.5 rounded-lg text-sm font-medium bg-dark-200 text-gray-400 hover:text-white border border-dark-50'
              }
            >
              {range === 'week'
                ? 'This Week'
                : range === 'month'
                ? 'This Month'
                : range === 'quarter'
                ? 'This Quarter'
                : range === 'year'
                ? 'This Year'
                : 'Custom'}
            </button>
          ))}
        </div>
      </div>

      {/* Custom date range */}
      {timeRange === 'custom' && (
        <div className="card mb-6 flex flex-wrap gap-4 items-end">
          <div>
            <label className="input-label">Start Date</label>
            <input
              type="date"
              className="input-field"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
            />
          </div>
          <div>
            <label className="input-label">End Date</label>
            <input
              type="date"
              className="input-field"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
            />
          </div>
        </div>
      )}

      {data && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="stat-card">
              <div className="stat-value">{data.totalPatients}</div>
              <div className="stat-label">Total Patients</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{data.totalAppointments}</div>
              <div className="stat-label">Appointments This Period</div>
            </div>
            <div className="stat-card">
              <div className="stat-value text-emerald-400">
                ${data.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="stat-label">Revenue This Period</div>
            </div>
            <div className="stat-card">
              <div className="stat-value text-cyan-400">
                ${data.avgPerVisit.toFixed(2)}
              </div>
              <div className="stat-label">Average per Visit</div>
            </div>
          </div>

          {/* Patient Volume Chart */}
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Patient Volume</h2>
            {Object.keys(data.volumeByDate).length === 0 ? (
              <p className="text-gray-500 text-sm">No appointment data for this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <div className="flex items-end gap-1 min-w-fit" style={{ height: '200px' }}>
                  {Object.entries(data.volumeByDate)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([date, count]) => {
                      const heightPct = (count / maxVolume) * 100;
                      return (
                        <div
                          key={date}
                          className="flex flex-col items-center gap-1 flex-shrink-0"
                          style={{ width: '32px' }}
                        >
                          <span className="text-[10px] text-gray-400">{count}</span>
                          <div
                            className="w-5 rounded-t bg-cyan-400/70 hover:bg-cyan-400 transition-colors"
                            style={{ height: `${Math.max(heightPct, 2)}%` }}
                            title={`${date}: ${count} appointments`}
                          />
                          <span className="text-[9px] text-gray-500 -rotate-45 origin-top-left whitespace-nowrap">
                            {format(new Date(date + 'T12:00:00'), 'M/d')}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          {/* Revenue Chart */}
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Revenue by Month</h2>
            {Object.keys(data.revenueByMonth).length === 0 ? (
              <p className="text-gray-500 text-sm">No revenue data for this period.</p>
            ) : (
              <div className="flex items-end gap-3" style={{ height: '200px' }}>
                {Object.entries(data.revenueByMonth)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([month, amount]) => {
                    const heightPct = (amount / maxRevenue) * 100;
                    return (
                      <div key={month} className="flex flex-col items-center gap-1 flex-1 min-w-[40px]">
                        <span className="text-xs text-gray-400">
                          ${amount >= 1000 ? `${(amount / 1000).toFixed(1)}k` : amount.toFixed(0)}
                        </span>
                        <div
                          className="w-full max-w-[48px] rounded-t bg-emerald-500/60 hover:bg-emerald-500/80 transition-colors"
                          style={{ height: `${Math.max(heightPct, 2)}%` }}
                          title={`${month}: $${amount.toFixed(2)}`}
                        />
                        <span className="text-xs text-gray-500">{month}</span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Common Presentations */}
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">Common Presentations</h2>
              {data.commonComplaints.length === 0 && data.commonPatterns.length === 0 ? (
                <p className="text-gray-500 text-sm">No data available.</p>
              ) : (
                <div className="space-y-4">
                  {data.commonComplaints.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-earth-300 mb-2">Chief Complaints</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-dark-50">
                              <th className="table-header">Complaint</th>
                              <th className="table-header text-right">Count</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-dark-50">
                            {data.commonComplaints.map((item, i) => (
                              <tr key={i} className="hover:bg-dark-300/30">
                                <td className="table-cell">{item.complaint}</td>
                                <td className="table-cell text-right">
                                  <span className="badge-earth">{item.count}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  {data.commonPatterns.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-cyan-400 mb-2">Pattern Diagnoses</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-dark-50">
                              <th className="table-header">Pattern</th>
                              <th className="table-header text-right">Count</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-dark-50">
                            {data.commonPatterns.map((item, i) => (
                              <tr key={i} className="hover:bg-dark-300/30">
                                <td className="table-cell">{item.pattern}</td>
                                <td className="table-cell text-right">
                                  <span className="badge-cyan">{item.count}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Appointment Types Breakdown */}
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">Appointment Types</h2>
              {Object.keys(data.appointmentsByType).length === 0 ? (
                <p className="text-gray-500 text-sm">No appointment data.</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(data.appointmentsByType)
                    .sort((a, b) => b[1] - a[1])
                    .map(([type, count]) => {
                      const widthPct = (count / maxByType) * 100;
                      return (
                        <div key={type}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-300">{type}</span>
                            <span className="text-gray-400">{count}</span>
                          </div>
                          <div className="w-full bg-dark-200 rounded-full h-2.5">
                            <div
                              className="bg-earth-300 h-2.5 rounded-full transition-all duration-500"
                              style={{ width: `${widthPct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Patient Retention */}
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">Patient Retention</h2>
              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-end gap-4 justify-center" style={{ height: '140px' }}>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm text-gray-400">{data.newPatients}</span>
                      <div
                        className="w-16 rounded-t bg-cyan-400/60"
                        style={{
                          height: `${
                            data.newPatients + data.returningPatients > 0
                              ? (data.newPatients / (data.newPatients + data.returningPatients)) * 120
                              : 10
                          }px`,
                        }}
                      />
                      <span className="text-xs text-gray-400">New</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm text-gray-400">{data.returningPatients}</span>
                      <div
                        className="w-16 rounded-t bg-earth-300/60"
                        style={{
                          height: `${
                            data.newPatients + data.returningPatients > 0
                              ? (data.returningPatients / (data.newPatients + data.returningPatients)) * 120
                              : 10
                          }px`,
                        }}
                      />
                      <span className="text-xs text-gray-400">Returning</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {data.newPatients + data.returningPatients > 0
                      ? Math.round(
                          (data.returningPatients /
                            (data.newPatients + data.returningPatients)) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <div className="text-sm text-gray-400">Retention Rate</div>
                </div>
              </div>
            </div>

            {/* Busiest Days */}
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">Busiest Days</h2>
              <div className="flex items-end gap-2 justify-between" style={{ height: '140px' }}>
                {Object.entries(data.appointmentsByDay).map(([day, count]) => {
                  const heightPct = maxByDay > 0 ? (count / maxByDay) * 100 : 0;
                  return (
                    <div key={day} className="flex flex-col items-center gap-1 flex-1">
                      <span className="text-xs text-gray-400">{count}</span>
                      <div
                        className="w-full max-w-[36px] rounded-t bg-earth-300/50 hover:bg-earth-300/70 transition-colors"
                        style={{ height: `${Math.max(heightPct, 3)}%` }}
                      />
                      <span className="text-xs text-gray-500">{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Busiest Hours Heatmap */}
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Appointment Heatmap by Hour</h2>
            <div className="grid grid-cols-7 gap-1">
              {/* Header row: days */}
              <div className="text-xs text-gray-500 text-center py-1">Hour</div>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="text-xs text-gray-500 text-center py-1 hidden md:block">
                  {day}
                </div>
              ))}
            </div>
            <div className="space-y-1">
              {Object.entries(data.appointmentsByHour).map(([hour, count]) => {
                return (
                  <div key={hour} className="flex items-center gap-1">
                    <div className="w-12 text-xs text-gray-500 text-right pr-2 flex-shrink-0">
                      {hour}
                    </div>
                    <div className="flex-1 grid grid-cols-7 gap-1">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                        const dayHourCount = count > 0 ? Math.ceil(count / 7) : 0;
                        const cellOpacity = maxByHour > 0 ? dayHourCount / maxByHour : 0;
                        return (
                          <div
                            key={`${hour}-${day}`}
                            className="h-5 rounded-sm transition-colors"
                            style={{
                              backgroundColor:
                                cellOpacity > 0
                                  ? `rgba(0, 240, 255, ${Math.max(cellOpacity * 0.8, 0.08)})`
                                  : 'rgba(42, 42, 42, 0.5)',
                            }}
                            title={`${day} ${hour}: ~${dayHourCount} appointments`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2 mt-3 justify-end">
              <span className="text-xs text-gray-500">Less</span>
              {[0.1, 0.3, 0.5, 0.7, 0.9].map((op) => (
                <div
                  key={op}
                  className="w-4 h-4 rounded-sm"
                  style={{ backgroundColor: `rgba(0, 240, 255, ${op})` }}
                />
              ))}
              <span className="text-xs text-gray-500">More</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
