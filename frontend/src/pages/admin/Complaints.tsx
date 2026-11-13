import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import { api } from '../../lib/axios';
import { format } from 'date-fns';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Filter,
  Search,
  MessageSquare,
  Check
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

const AdminComplaints = () => {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const MOCK_COMPLAINTS = [
    {
      id: 'mock-c1',
      student: 'John Doe',
      rollNumber: 'CS2023001',
      date: new Date().toISOString(),
      category: 'FOOD_QUALITY',
      description: 'Rice was a bit undercooked during Wednesday dinner service.',
      status: 'PENDING'
    },
    {
      id: 'mock-c2',
      student: 'Alice Smith',
      rollNumber: 'CS2023014',
      date: new Date(Date.now() - 86400000).toISOString(),
      category: 'HYGIENE',
      description: 'Plates in Hall B had detergent residue stains on edges.',
      status: 'RESOLVED'
    },
    {
      id: 'mock-c3',
      student: 'Bob Wilson',
      rollNumber: 'EC2023042',
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      category: 'SERVICE',
      description: 'Counter queues were exceptionally long due to slow refilling of dal container.',
      status: 'PENDING'
    },
    {
      id: 'mock-c4',
      student: 'Priya Patel',
      rollNumber: 'CS2023055',
      date: new Date(Date.now() - 86400000 * 3).toISOString(),
      category: 'MENU',
      description: 'Listed dessert (Gulab Jamun) was finished before 8:45 PM.',
      status: 'RESOLVED'
    },
  ];

  const [complaints, setComplaints] = useState<any[]>(MOCK_COMPLAINTS);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints');
      const dbRecords = Array.isArray(res.data) ? res.data : [];
      const mapped = dbRecords.map((c: any) => ({
        id: c.id,
        student: c.user?.name || c.student || 'Student',
        rollNumber: c.user?.rollNumber || 'CS2023xxx',
        date: c.createdAt || c.date || new Date().toISOString(),
        category: c.category || 'OTHER',
        description: c.description || '',
        status: c.status || 'PENDING'
      }));
      const dbIds = new Set(mapped.map((c: any) => c.id));
      const uniqueMocks = MOCK_COMPLAINTS.filter(m => !dbIds.has(m.id));
      setComplaints([...mapped, ...uniqueMocks]);
    } catch (e) {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleResolve = async (id: string | number) => {
    try {
      if (!String(id).startsWith('mock-')) {
        await api.put(`/complaints/${id}`, { status: 'RESOLVED' });
        await fetchComplaints();
        return;
      }
    } catch (e) {
      // Local fallback
    }

    setComplaints(prev =>
      prev.map(c => String(c.id) === String(id) ? { ...c, status: 'RESOLVED' } : c)
    );
  };

  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => c.status === 'PENDING').length;
  const resolvedCount = complaints.filter(c => c.status === 'RESOLVED').length;

  const filtered = complaints.filter(c => {
    const matchesFilter = filter === 'ALL' || c.status === filter;
    const matchesSearch = searchQuery === '' ||
      c.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <Layout title="Complaints Management">
      {/* Top Banner and Quick Stats */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 text-xs font-semibold mb-2 border border-rose-200/50 dark:border-rose-800/50">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Grievance Resolution Desk</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-stone-900 dark:text-stone-100 tracking-tight">
              Student Complaints & Feedback
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
              Review filed dining issues, investigate reported concerns, and update resolution status.
            </p>
          </div>
        </div>

        {/* Counts Pill Cards */}
        <div className="lg:col-span-4 bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs flex items-center justify-around">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block mb-0.5">Pending</span>
            <span className="text-2xl font-display font-bold text-amber-600 dark:text-amber-400">{pendingCount}</span>
            <span className="text-[10px] text-stone-400 dark:text-stone-500 block">Requires action</span>
          </div>
          <div className="w-px h-10 bg-stone-200 dark:bg-stone-800" />
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block mb-0.5">Resolved</span>
            <span className="text-2xl font-display font-bold text-emerald-600 dark:text-emerald-400">{resolvedCount}</span>
            <span className="text-[10px] text-stone-400 dark:text-stone-500 block">Completed</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-50/40 dark:bg-stone-800/40">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-stone-100/80 dark:bg-stone-800/80 p-1.5 rounded-2xl w-fit">
            {[
              { id: 'ALL' as const, label: 'All Complaints', count: totalCount },
              { id: 'PENDING' as const, label: 'Pending', count: pendingCount },
              { id: 'RESOLVED' as const, label: 'Resolved', count: resolvedCount }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${filter === tab.id
                    ? 'bg-white dark:bg-stone-700 text-orange-700 dark:text-orange-300 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${filter === tab.id ? 'bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300' : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                  }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3.5 py-2 rounded-xl text-xs sm:text-sm focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 max-w-xs w-full">
            <Search className="w-4 h-4 text-stone-400 shrink-0" />
            <input
              type="text"
              placeholder="Search complaint or student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-stone-900 dark:text-stone-100 placeholder:text-stone-400 text-xs"
            />
          </div>
        </div>

        {/* Complaints Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50/80 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 font-semibold border-b border-stone-100 dark:border-stone-800 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Student</th>
                <th className="py-3.5 px-6">Issue Category</th>
                <th className="py-3.5 px-6 w-2/5">Complaint Description</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filtered.map((c) => {
                const catClean = (c.category || 'OTHER').replace('_', ' ').toLowerCase();
                const isPending = c.status === 'PENDING';

                return (
                  <tr key={c.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/50 transition-colors">
                    <td className="py-4 px-6 text-stone-900 dark:text-stone-100 font-medium whitespace-nowrap text-xs">
                      {format(new Date(c.date), 'MMM d, yyyy')}
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm leading-tight">{c.student}</p>
                        <p className="text-xs text-stone-400 dark:text-stone-500 font-mono mt-0.5">{c.rollNumber}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {(() => {
                        const catStyle = getCategoryStyle(c.category);
                        return (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold capitalize border whitespace-nowrap shadow-2xs ${catStyle.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot} shrink-0`} />
                            <span>{catClean}</span>
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-4 px-6 text-stone-700 dark:text-stone-300 text-xs leading-relaxed">
                      <p className="line-clamp-2" title={c.description}>
                        {c.description}
                      </p>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      {isPending ? (
                        <button
                          onClick={() => handleResolve(c.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-600 hover:text-white transition-all shadow-2xs cursor-pointer active:scale-95 group"
                          title="Mark this complaint as resolved"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:text-white transition-colors" />
                          <span>Mark Resolved</span>
                        </button>
                      ) : (
                        <span className="text-xs text-stone-400 dark:text-stone-500 font-medium italic">
                          Resolved ✓
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="p-12 text-center text-stone-400 dark:text-stone-500 text-sm">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-stone-300 dark:text-stone-600" />
              <p>No complaints match your selection.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminComplaints;
