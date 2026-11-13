import React, { useState } from 'react';
import Layout from '../../components/Layout';
import {
  FileDown,
  BarChart3,
  Star,
  AlertCircle,
  Trash2,
  CheckCircle,
  ClipboardList,
  TrendingUp,
  Loader2,
  Sparkles,
  ShieldCheck,
  Clock,
  Info,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { api } from '../../lib/axios';

interface ReportData {
  totalMealsAttended: number;
  avgAttendance: number;
  avgRating: number;
  totalComplaints: number;
  resolvedComplaints: number;
  avgFoodWaste: number;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const AdminReports = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-indexed (1 to 12)

  const [month, setMonth] = useState(String(currentMonth));
  const [year, setYear] = useState(String(currentYear));
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');

  // Dynamically generate year options: past 4 years up to currentYear + 2
  // Future years (> currentYear) will be marked disabled and non-clickable
  const yearOptions = [
    currentYear - 4,
    currentYear - 3,
    currentYear - 2,
    currentYear - 1,
    currentYear,
    currentYear + 1,
    currentYear + 2,
  ];

  const handleGenerate = async () => {
    setError('');
    setNoticeMessage('');

    const selectedYear = Number(year);
    const selectedMonth = Number(month);

    // Guard against future dates
    if (selectedYear > currentYear || (selectedYear === currentYear && selectedMonth > currentMonth)) {
      setError('Cannot generate report for future periods.');
      return;
    }

    // Inform user for current ongoing month
    if (selectedYear === currentYear && selectedMonth === currentMonth) {
      setNoticeMessage('Month-to-Date (MTD) preview: includes all records logged so far this month.');
    }

    setLoading(true);
    try {
      const res = await api.get('/reports/monthly', { params: { year, month } });
      setReportData(res.data);
      setGenerated(true);
    } catch {
      // Fallback demo data so the UI is still useful offline
      setReportData({
        totalMealsAttended: 12450,
        avgAttendance: 83,
        avgRating: 4.1,
        totalComplaints: 45,
        resolvedComplaints: 40,
        avgFoodWaste: 14.2,
      });
      setGenerated(true);
      setError('Could not reach server — showing demo data.');
    } finally {
      setLoading(false);
    }
  };

  const resolvedPct = reportData
    ? reportData.totalComplaints > 0
      ? Math.round((reportData.resolvedComplaints / reportData.totalComplaints) * 100)
      : 100
    : 0;

  const metrics = reportData
    ? [
      {
        label: 'Total Meals Served',
        value: reportData.totalMealsAttended.toLocaleString(),
        icon: <ClipboardList className="w-5 h-5" />,
        bg: 'bg-orange-50 dark:bg-orange-950/60',
        iconColor: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-200/60 dark:border-orange-800/60',
      },
      {
        label: 'Avg Attendance',
        value: `${Number(reportData.avgAttendance).toFixed(1)}%`,
        icon: <TrendingUp className="w-5 h-5" />,
        bg: 'bg-amber-50 dark:bg-amber-950/60',
        iconColor: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-200/60 dark:border-amber-800/60',
      },
      {
        label: 'Avg Meal Rating',
        value: `${Number(reportData.avgRating).toFixed(1)} / 5`,
        icon: <Star className="w-5 h-5" />,
        bg: 'bg-yellow-50 dark:bg-yellow-950/60',
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        border: 'border-yellow-200/60 dark:border-yellow-800/60',
      },
      {
        label: 'Total Complaints',
        value: reportData.totalComplaints,
        icon: <AlertCircle className="w-5 h-5" />,
        bg: 'bg-red-50 dark:bg-red-950/60',
        iconColor: 'text-red-500 dark:text-red-400',
        border: 'border-red-200/60 dark:border-red-800/60',
      },
      {
        label: 'Complaints Resolved',
        value: `${reportData.resolvedComplaints} (${resolvedPct}%)`,
        icon: <CheckCircle className="w-5 h-5" />,
        bg: 'bg-emerald-50 dark:bg-emerald-950/60',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-200/60 dark:border-emerald-800/60',
      },
      {
        label: 'Avg Food Waste / Day',
        value: `${Number(reportData.avgFoodWaste).toFixed(1)} kg`,
        icon: <Trash2 className="w-5 h-5" />,
        bg: 'bg-stone-100 dark:bg-stone-800',
        iconColor: 'text-stone-500 dark:text-stone-400',
        border: 'border-stone-200/60 dark:border-stone-700',
      },
    ]
    : [];

  return (
    <Layout title="Monthly Reports">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 text-xs font-semibold border border-orange-200/50 dark:border-orange-800/60">
            <BarChart3 className="w-3.5 h-3.5" /> Reports
          </span>
        </div>
        <h1 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100">Monthly Report</h1>
        <p className="text-stone-500 dark:text-stone-400 text-sm mt-0.5">Generate verified analytics for completed months to audit dining operations.</p>
      </div>

      {/* Controls card: Calendar & Period Selection */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs p-6 sm:p-7 mb-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-100 dark:border-stone-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/60 border border-orange-200/60 dark:border-orange-800/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 shadow-2xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-stone-900 dark:text-stone-100">
                Monthly Audit Calendar
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Select a completed month to compile dining metrics and waste logs.
              </p>
            </div>
          </div>

          {/* Year Navigator (Theme-aware with Orange Accents) */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-stone-50 dark:bg-stone-800/80 p-1.5 rounded-2xl border border-stone-200/80 dark:border-stone-700">
            <button
              type="button"
              onClick={() => {
                const prev = Number(year) - 1;
                if (prev >= currentYear - 4) {
                  setYear(String(prev));
                  setNoticeMessage('');
                  setError('');
                }
              }}
              disabled={Number(year) <= currentYear - 4}
              className="p-1.5 rounded-xl text-stone-600 dark:text-stone-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-white dark:hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Previous Year"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 text-xs font-bold font-mono text-stone-900 dark:text-stone-100">
              {year}
            </span>

            <button
              type="button"
              onClick={() => {
                const next = Number(year) + 1;
                if (next <= currentYear) {
                  setYear(String(next));
                  setNoticeMessage('');
                  setError('');
                  if (next === currentYear && Number(month) > currentMonth) {
                    setMonth(String(currentMonth));
                  }
                }
              }}
              disabled={Number(year) >= currentYear}
              className="p-1.5 rounded-xl text-stone-600 dark:text-stone-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-white dark:hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              title={Number(year) >= currentYear ? "Future years are disabled" : "Next Year"}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 12-Month Calendar Grid Styled in Website's Orange Theme */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3 mb-6">
          {MONTH_NAMES.map((m, i) => {
            const monthNum = i + 1;
            const isSelectedYearCurrent = Number(year) === currentYear;
            const isFutureMonth = Number(year) > currentYear || (isSelectedYearCurrent && monthNum > currentMonth);
            const isCurrentMonth = isSelectedYearCurrent && monthNum === currentMonth;
            const isSelected = Number(month) === monthNum;

            if (isFutureMonth) {
              return (
                <div
                  key={monthNum}
                  className="p-3 sm:p-3.5 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 bg-stone-100/40 dark:bg-stone-800/30 text-stone-400 dark:text-stone-600 opacity-40 cursor-not-allowed select-none flex flex-col justify-between min-h-[72px]"
                  title="Future month (Disabled)"
                >
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase">{m.slice(0, 3)}</span>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold">{m}</span>
                    <span className="text-[10px]">🔒</span>
                  </div>
                </div>
              );
            }

            return (
              <button
                key={monthNum}
                type="button"
                onClick={() => {
                  setMonth(String(monthNum));
                  setNoticeMessage('');
                  setError('');
                }}
                className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex flex-col justify-between min-h-[72px] text-left cursor-pointer group ${
                  isSelected
                    ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white border-orange-500 shadow-md shadow-orange-600/25 ring-2 ring-orange-500/40'
                    : isCurrentMonth
                    ? 'bg-orange-50/70 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/60'
                    : 'bg-stone-50/80 dark:bg-stone-800/80 text-stone-800 dark:text-stone-200 border-stone-200/80 dark:border-stone-700/80 hover:bg-orange-50/60 dark:hover:bg-orange-950/40 hover:border-orange-300 dark:hover:border-orange-700 hover:text-orange-700 dark:hover:text-orange-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[10px] font-mono font-bold tracking-wider uppercase ${
                    isSelected ? 'text-amber-100' : isCurrentMonth ? 'text-orange-600 dark:text-orange-400' : 'text-stone-400 dark:text-stone-500'
                  }`}>
                    {m.slice(0, 3)}
                  </span>
                  {isCurrentMonth && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-orange-200 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                    }`}>
                      Current
                    </span>
                  )}
                  {isSelected && !isCurrentMonth && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </div>
                <span className="font-semibold text-xs sm:text-sm mt-1 truncate">
                  {m}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Controls & Generate Button */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-300">
            <span className="font-semibold text-stone-500 dark:text-stone-400">Selected:</span>
            <span className="font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 px-2.5 py-1 rounded-lg border border-orange-200/60 dark:border-orange-800/60 font-mono">
              {MONTH_NAMES[Number(month) - 1]} {year}
            </span>
            {Number(year) === currentYear && Number(month) === currentMonth && (
              <span className="text-[11px] text-amber-700 dark:text-amber-400 italic">
                (Ongoing month)
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Quick dropdown fallback */}
            <select
              value={month}
              onChange={e => {
                setMonth(e.target.value);
                setNoticeMessage('');
                setError('');
              }}
              className="px-3 py-2 border border-stone-200 dark:border-stone-700 rounded-xl bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer shadow-2xs"
            >
              {MONTH_NAMES.map((m, i) => {
                const monthNum = i + 1;
                const isSelectedYearCurrent = Number(year) === currentYear;
                const isFutureMonth = Number(year) > currentYear || (isSelectedYearCurrent && monthNum > currentMonth);
                const isCurrent = isSelectedYearCurrent && monthNum === currentMonth;
                return (
                  <option key={monthNum} value={String(monthNum)} disabled={isFutureMonth}>
                    {m} {isCurrent ? '(Current)' : isFutureMonth ? '(Disabled)' : ''}
                  </option>
                );
              })}
            </select>

            {/* Generate Report Button with Orange Theme */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white text-sm font-semibold shadow-sm shadow-orange-600/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer active:scale-95"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              {loading ? 'Generating…' : 'Generate Report'}
            </button>
          </div>
        </div>

        {/* Informative Month In Progress Notice */}
        {noticeMessage && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/70 flex items-center gap-3 text-amber-900 dark:text-amber-200 text-sm animate-fadeIn shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-300">Month In Progress</p>
              <p className="text-xs sm:text-sm mt-0.5">{noticeMessage}</p>
            </div>
          </div>
        )}

        {error && (
          <p className="mt-4 text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl px-4 py-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </p>
        )}
      </div>

      {/* Report results */}
      {generated && reportData && (
        <>
          {/* Summary banner */}
          <div className="bg-gradient-to-r from-orange-600 to-amber-500 rounded-3xl p-6 mb-6 text-white shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-orange-100 text-xs font-semibold uppercase tracking-wider mb-1">Report Summary</p>
                <h2 className="font-display text-2xl font-bold">
                  {MONTH_NAMES[parseInt(month) - 1]} {year}
                </h2>
                <p className="text-orange-100 text-sm mt-1">SmartMess · Mess Management System</p>
              </div>
              <div className="bg-white/20 rounded-2xl p-3">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            {/* Key highlight bar */}
            <div className="mt-5 grid grid-cols-3 divide-x divide-white/30">
              <div className="pr-4">
                <p className="text-3xl font-bold font-display">{Number(reportData.avgAttendance).toFixed(0)}%</p>
                <p className="text-orange-100 text-xs mt-0.5">Avg Attendance</p>
              </div>
              <div className="px-4">
                <p className="text-3xl font-bold font-display">{Number(reportData.avgRating).toFixed(1)}<span className="text-lg">★</span></p>
                <p className="text-orange-100 text-xs mt-0.5">Avg Rating</p>
              </div>
              <div className="pl-4">
                <p className="text-3xl font-bold font-display">{resolvedPct}%</p>
                <p className="text-orange-100 text-xs mt-0.5">Issues Resolved</p>
              </div>
            </div>
          </div>

          {/* Metric cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {metrics.map((m, idx) => (
              <div
                key={idx}
                className={`bg-white dark:bg-stone-900 rounded-2xl border ${m.border} shadow-xs p-5 flex items-center gap-4`}
              >
                <div className={`${m.bg} ${m.iconColor} p-3 rounded-xl`}>
                  {m.icon}
                </div>
                <div>
                  <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">{m.label}</p>
                  <p className="text-2xl font-bold font-display text-stone-900 dark:text-stone-100 leading-tight mt-0.5">{m.value}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Empty state before first generate */}
      {!generated && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs p-12 text-center mb-6">
          <div className="w-16 h-16 bg-orange-50 dark:bg-orange-950/60 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-orange-400" />
          </div>
          <h3 className="font-display text-lg font-semibold text-stone-700 dark:text-stone-200 mb-1">No Report Generated Yet</h3>
          <p className="text-stone-400 dark:text-stone-500 text-sm">Select a month and year above, then click Generate Report.</p>
        </div>
      )}

      {/* Polished Admin Reports Institutional Audit Block */}
      <div className="mt-8 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-7 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-colors">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-orange-50 dark:bg-orange-950/60 border border-orange-200/60 dark:border-orange-800/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 shadow-2xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-display font-bold text-sm text-stone-900 dark:text-stone-100">
                Institutional Dining Analytics & Administrative Oversight
              </h4>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                Verified
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed max-w-2xl">
              Official monthly operational audit compiled from verified meal check-ins, student satisfaction indexes, and daily waste logs. Dedicated to upholding high culinary standards and mess efficiency.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 self-stretch md:self-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-stone-100 dark:border-stone-800 text-xs text-stone-400 dark:text-stone-500 font-mono">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Audit System Active
          </span>
          <span>•</span>
          <span>SmartMess Operations Standard</span>
        </div>
      </div>
    </Layout>
  );
};

export default AdminReports;
