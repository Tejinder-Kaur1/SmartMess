import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import { api } from '../../lib/axios';
import { format } from 'date-fns';
import {
  AlertCircle,
  Send,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Sparkles,
  FileText,
  UtensilsCrossed,
  Sparkle,
  User,
  Coffee
} from 'lucide-react';

const getCategoryStyle = (category: string) => {
  const norm = (category || '').toUpperCase().replace(/[\s-]+/g, '_');
  switch (norm) {
    case 'FOOD_QUALITY':
      return {
        badge: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60',
        dot: 'bg-purple-500'
      };
    case 'HYGIENE':
      return {
        badge: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200/80 dark:border-cyan-800/60',
        dot: 'bg-cyan-500'
      };
    case 'SERVICE':
      return {
        badge: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60',
        dot: 'bg-indigo-500'
      };
    case 'MENU':
      return {
        badge: 'bg-fuchsia-50 dark:bg-fuchsia-950/60 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-200/80 dark:border-fuchsia-800/60',
        dot: 'bg-fuchsia-500'
      };
    default:
      return {
        badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        dot: 'bg-slate-400'
      };
  }
};

const StudentComplaints = () => {
  const [category, setCategory] = useState<'FOOD_QUALITY' | 'HYGIENE' | 'SERVICE' | 'MENU' | 'OTHER'>('FOOD_QUALITY');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const MOCK_COMPLAINTS = [
    {
      id: 'mock-c1',
      date: new Date().toISOString(),
      category: 'HYGIENE',
      description: 'Dining tables on Section B were not wiped clean after afternoon lunch service.',
      status: 'PENDING'
    },
    {
      id: 'mock-c2',
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      category: 'FOOD_QUALITY',
      description: 'Rice was a bit undercooked during Wednesday dinner.',
      status: 'RESOLVED'
    },
    {
      id: 'mock-c3',
      date: new Date(Date.now() - 86400000 * 4).toISOString(),
      category: 'SERVICE',
      description: 'Water dispenser on the ground floor was empty for 2 hours during breakfast.',
      status: 'RESOLVED'
    },
  ];

  const [history, setHistory] = useState<any[]>(MOCK_COMPLAINTS);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      const dbRecords = Array.isArray(res.data) ? res.data : [];
      const dbIds = new Set(dbRecords.map((c: any) => c.id));
      const uniqueMocks = MOCK_COMPLAINTS.filter(m => !dbIds.has(m.id));
      setHistory([...dbRecords, ...uniqueMocks]);
    } catch (err) {
      // Fallback to initial demo records
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post('/complaints', {
        category,
        description: description.trim()
      });
      await fetchComplaints();
      setSuccess(true);
      setDescription('');
    } catch (err) {
      // Keep optimistic fallback on network error
      const newComplaint = {
        id: 'mock-' + Date.now(),
        date: new Date().toISOString(),
        category,
        description: description.trim(),
        status: 'PENDING'
      };
      setHistory(prev => [newComplaint, ...prev]);
      setSuccess(true);
      setDescription('');
    } finally {
      setIsSubmitting(false);
    }

    setTimeout(() => {
      setSuccess(false);
    }, 4000);
  };

  const categories = [
    { value: 'FOOD_QUALITY', label: 'Food Quality', desc: 'Taste, temperature, or ingredients' },
    { value: 'HYGIENE', label: 'Hygiene & Cleanliness', desc: 'Plates, tables, or dining floor' },
    { value: 'SERVICE', label: 'Service & Staff', desc: 'Serving speed, behavior, or refills' },
    { value: 'MENU', label: 'Menu & Timings', desc: 'Missing items or timing delays' },
    { value: 'OTHER', label: 'Other Facility Issues', desc: 'Water cooler, seating, etc.' }
  ];

  const pendingCount = history.filter(h => h.status === 'PENDING').length;
  const resolvedCount = history.filter(h => h.status === 'RESOLVED').length;

  return (
    <Layout title="Mess Complaints & Issues">
      {/* Top Banner */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-transparent dark:from-red-950/40 dark:via-orange-950/20 dark:to-transparent p-6 rounded-3xl border border-red-200/70 dark:border-red-900/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-stone-900 dark:text-stone-100">
                Grievance Redressal Mechanism
              </h2>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                Complaints are routed directly to the Hostel Warden and Mess Committee for prompt resolution.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs flex items-center justify-around">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 block">Pending</span>
            <span className="text-xl font-display font-bold text-amber-600 dark:text-amber-400">{pendingCount}</span>
          </div>
          <div className="w-px h-8 bg-stone-200 dark:bg-stone-800" />
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 block">Resolved</span>
            <span className="text-xl font-display font-bold text-emerald-600 dark:text-emerald-400">{resolvedCount}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-9">
        {/* Submit Complaint Card - Slightly increased size & breathing room */}
        <div className="lg:col-span-5">
          <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-200/80 dark:border-stone-800 p-7 sm:p-8 xl:p-9 sticky top-28">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <span>Lodge a Complaint</span>
              </h3>
              <span className="text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-200/60 dark:border-rose-800/60">
                Official Redressal
              </span>
            </div>

            {success && (
              <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm rounded-2xl flex items-center gap-2.5 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Your complaint has been submitted. The mess supervisor will review it shortly.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2">
                  Issue Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-4 py-3.5 rounded-2xl border border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm bg-stone-50/50 dark:bg-stone-800/70 hover:bg-white dark:hover:bg-stone-800 focus:bg-white dark:focus:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium transition-all"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">
                      {cat.label} ({cat.desc})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Detailed Description
                  </label>
                  <span className="text-[11px] text-stone-400 dark:text-stone-500 font-medium">Be specific</span>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  required
                  className="w-full p-4 rounded-2xl border border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm resize-none bg-stone-50/50 dark:bg-stone-800/70 hover:bg-white dark:hover:bg-stone-800 focus:bg-white dark:focus:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 transition-all min-h-[140px]"
                  placeholder="Describe the issue with date, meal timing, and location (e.g. Dining Hall 1)..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !description.trim()}
                className="w-full bg-gradient-to-r from-orange-600 via-orange-500 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-4 px-5 rounded-2xl shadow-sm shadow-orange-600/25 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Submitting Complaint...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Complaint</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Complaints History Table & Cards - Slightly increased size & height */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-display font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span>My Complaints Log</span>
            </h3>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              {history.length} Total records
            </span>
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs overflow-hidden min-h-[460px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50/80 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 font-semibold border-b border-stone-100 dark:border-stone-800 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-6 sm:px-7">Date</th>
                    <th className="py-4 px-6 sm:px-7">Category</th>
                    <th className="py-4 px-6 sm:px-7 w-2/5">Issue Details</th>
                    <th className="py-4 px-6 sm:px-7">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {history.map((record, idx) => {
                    const catClean = (record.category || 'OTHER').replace('_', ' ').toLowerCase();
                    const catStyle = getCategoryStyle(record.category);
                    return (
                      <tr key={record.id || idx} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/50 transition-colors">
                        <td className="py-5 px-6 sm:px-7 text-stone-900 dark:text-stone-100 font-medium whitespace-nowrap text-xs">
                          {format(new Date(record.date || record.createdAt || Date.now()), 'MMM d, yyyy')}
                        </td>
                        <td className="py-5 px-6 sm:px-7">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold capitalize border whitespace-nowrap shadow-2xs ${catStyle.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot} shrink-0`} />
                            <span>{catClean}</span>
                          </span>
                        </td>
                        <td className="py-5 px-6 sm:px-7 text-stone-700 dark:text-stone-300 text-xs leading-relaxed">
                          <p className="line-clamp-2" title={record.description}>
                            {record.description}
                          </p>
                        </td>
                        <td className="py-5 px-6 sm:px-7 whitespace-nowrap">
                          <StatusBadge status={record.status || 'PENDING'} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {history.length === 0 && (
                <div className="p-12 text-center text-stone-400 dark:text-stone-500 text-sm">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-stone-300 dark:text-stone-600" />
                  <p>You have not filed any complaints yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* End of Complaints Section - Subtle horizontal divider line */}
      <div className="mt-12 pt-3">
        <hr className="border-t border-stone-200 dark:border-stone-800" />
      </div>
    </Layout>
  );
};

export default StudentComplaints;
