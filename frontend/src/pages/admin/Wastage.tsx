import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { api } from '../../lib/axios';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import {
  Trash2,
  Scale,
  Leaf,
  TrendingDown,
  Calendar,
  CheckCircle2,
  Sparkles,
  PlusCircle,
  FileText
} from 'lucide-react';

const AdminWastage = () => {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [kilos, setKilos] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  // Permanent mock demo data (always visible)
  const MOCK_WASTE = [
    { date: '2023-10-01', kilos: 12.5, target: 15.0 },
    { date: '2023-10-02', kilos: 15.2, target: 15.0 },
    { date: '2023-10-03', kilos: 10.8, target: 15.0 },
    { date: '2023-10-04', kilos: 18.0, target: 15.0 },
    { date: '2023-10-05', kilos: 14.2, target: 15.0 },
    { date: '2023-10-06', kilos: 11.5, target: 15.0 },
    { date: '2023-10-07', kilos: 13.0, target: 15.0 },
  ];

  const [wasteData, setWasteData] = useState<any[]>(MOCK_WASTE);

  const fetchWastage = async () => {
    try {
      const res = await api.get('/wastage');
      if (Array.isArray(res.data) && res.data.length > 0) {
        const dbMapped = res.data.map((item: any) => ({
          date: item.date ? format(new Date(item.date), 'yyyy-MM-dd') : '2023-10-01',
          kilos: Number(item.kilograms || item.kilos || 0),
          target: 15.0
        }));
        // Merge: DB records override mock records for same date
        const dbDates = new Set(dbMapped.map((w: any) => w.date));
        const uniqueMocks = MOCK_WASTE.filter(m => !dbDates.has(m.date));
        setWasteData([...dbMapped, ...uniqueMocks].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      }
    } catch (err) {
      // Keep mock data on network error
    }
  };

  useEffect(() => {
    fetchWastage();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(kilos);
    if (isNaN(val) || val <= 0) return;
    setApiError('');
    setIsSubmitting(true);

    try {
      await api.post('/wastage', { date, kilograms: val });
      await fetchWastage();
      setSuccess(true);
      setKilos('');
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setApiError('Failed to save waste log. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const avgKilos = wasteData.length > 0
    ? (wasteData.reduce((acc, cur) => acc + cur.kilos, 0) / wasteData.length).toFixed(1)
    : '13.5';

  const lowestWaste = wasteData.length > 0
    ? Math.min(...wasteData.map(w => w.kilos)).toFixed(1)
    : '10.8';

  return (
    <Layout title="Food Wastage Tracking">
      {apiError && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300 text-sm rounded-2xl flex items-center justify-between gap-3">
          <span>{apiError}</span>
          <button onClick={() => setApiError('')} className="text-red-500 hover:text-red-700 dark:hover:text-red-300 font-bold text-lg leading-none cursor-pointer">×</button>
        </div>
      )}
      {/* Top Banner with sustainability summary */}
      <div className="mb-8 bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-2 border border-emerald-200/50 dark:border-emerald-800/60">
            <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Zero Wastage Initiative</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            Kitchen Food Waste Metrics
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Log post-meal leftover food weight daily to track dining trends and prevent kitchen over-preparation.
          </p>
        </div>

        {/* Quick Stat Pill */}
        <div className="flex items-center gap-4 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-4 rounded-2xl shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block">7-Day Average</span>
            <span className="text-xl font-display font-bold text-stone-900 dark:text-stone-100">{avgKilos} kg</span>
          </div>
          <div className="w-px h-8 bg-stone-200 dark:bg-stone-700" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block">Best Day</span>
            <span className="text-xl font-display font-bold text-emerald-600 dark:text-emerald-400">{lowestWaste} kg</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Record Daily Wastage Form */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-200/80 dark:border-stone-800 p-6 sm:p-7 sticky top-28">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-display font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Scale className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span>Log Daily Waste</span>
              </h3>
              <span className="text-xs font-semibold text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 px-2.5 py-0.5 rounded-full border border-orange-200/60 dark:border-orange-800/60">
                Central Mess
              </span>
            </div>

            {success && (
              <div className="mb-5 p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm rounded-2xl flex items-center gap-2.5 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Waste log saved successfully! Trend updated.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                  Date
                </label>
                <div className="flex items-center gap-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 px-3.5 py-2.5 rounded-2xl focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20">
                  <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-transparent border-none text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 outline-none w-full cursor-pointer"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                  Waste Quantity (in kg)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={kilos}
                    onChange={(e) => setKilos(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm bg-stone-50/50 dark:bg-stone-800 hover:bg-white dark:hover:bg-stone-800 focus:bg-white dark:focus:bg-stone-800 text-stone-900 dark:text-stone-100 pr-12 transition-all font-semibold"
                    placeholder="e.g. 14.5"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 dark:text-stone-500">
                    kg
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1.5">
                  Includes kitchen prep waste and student dining plate residue.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !kilos}
                className="w-full mt-2 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold py-3.5 px-4 rounded-2xl shadow-sm shadow-orange-600/20 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving Entry...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Save Waste Record</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* 7-Day Trend Chart Card */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-stone-900 p-6 sm:p-7 rounded-3xl shadow-sm border border-stone-200/80 dark:border-stone-800 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-display font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <span>Waste Volume Trajectory (kg)</span>
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Target threshold is 15.0 kg maximum per day
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                Under Target
              </span>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={wasteData}>
                  <defs>
                    <linearGradient id="wasteColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EA580C" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#EA580C" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#78716C33" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(val) => {
                      try { return format(new Date(val), 'MMM d'); } catch { return val; }
                    }}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#78716C', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#78716C', fontSize: 12 }}
                    unit=" kg"
                  />
                  <Tooltip
                    labelFormatter={(val) => {
                      try { return format(new Date(val), 'MMMM d, yyyy'); } catch { return val; }
                    }}
                    contentStyle={{ borderRadius: '16px', border: '1px solid #78716C40', backgroundColor: '#1C1917', color: '#FAFAF9' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="kilos"
                    name="Waste (kg)"
                    stroke="#EA580C"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#wasteColor)"
                    dot={{ fill: '#EA580C', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Waste Records Log Table */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h3 className="font-display font-bold text-base text-stone-900 dark:text-stone-100">
              Daily Wastage Log Records
            </h3>
          </div>
          <span className="text-xs text-stone-400 dark:text-stone-500 font-medium">
            {wasteData.length} entries recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50/80 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 font-semibold border-b border-stone-100 dark:border-stone-800 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Recorded Date</th>
                <th className="py-3.5 px-6">Total Waste (kg)</th>
                <th className="py-3.5 px-6">Threshold Benchmark</th>
                <th className="py-3.5 px-6">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {[...wasteData].reverse().map((item, idx) => {
                const isUnder = item.kilos <= 15.0;
                return (
                  <tr key={idx} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/50 transition-colors">
                    <td className="py-4 px-6 text-stone-900 dark:text-stone-100 font-semibold text-xs whitespace-nowrap">
                      {format(new Date(item.date), 'EEEE, MMMM d, yyyy')}
                    </td>
                    <td className="py-4 px-6 font-display font-bold text-stone-900 dark:text-stone-100 text-sm">
                      {item.kilos} kg
                    </td>
                    <td className="py-4 px-6 text-stone-500 dark:text-stone-400 font-mono text-xs">
                      Max 15.0 kg / day
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isUnder
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isUnder ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>{isUnder ? 'Within Limit' : 'Above Target'}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default AdminWastage;
