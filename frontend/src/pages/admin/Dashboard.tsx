import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import DashboardCard from '../../components/DashboardCard';
import StatusBadge from '../../components/StatusBadge';
import RatingStars from '../../components/RatingStars';
import { format } from 'date-fns';
import { Users, ClipboardList, Trash2, Star, TrendingUp, LayoutDashboard } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, Area, AreaChart, ReferenceLine,
} from 'recharts';
import { api } from '../../lib/axios';
import { useNavigate } from 'react-router-dom';

interface ComplaintRow {
  id: string | number;
  student: string;
  category: string;
  description: string;
  status: string;
}
interface FeedbackRow {
  id: string | number;
  student: string;
  rating: number;
  comment?: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [stats, setStats] = useState({
    expected: 500,
    served: 412,
    attendancePct: 82.4,
    foodWaste: 15.5,
    avgRating: 4.2,
  });

  const [attendanceData] = useState([
    { name: 'Breakfast', Expected: 500, Served: 380 },
    { name: 'Lunch', Expected: 500, Served: 412 },
    { name: 'Dinner', Expected: 500, Served: 395 },
  ]);

  const [wasteData] = useState([
    { day: 'Mon', Waste: 12 },
    { day: 'Tue', Waste: 14 },
    { day: 'Wed', Waste: 11 },
    { day: 'Thu', Waste: 15.5 },
    { day: 'Fri', Waste: 10 },
    { day: 'Sat', Waste: 18 },
    { day: 'Sun', Waste: 13 },
  ]);

  const [recentComplaints, setRecentComplaints] = useState<ComplaintRow[]>([
    { id: 1, student: 'John Doe', category: 'FOOD_QUALITY', description: 'Rice was undercooked', status: 'PENDING' },
    { id: 2, student: 'Alice Smith', category: 'HYGIENE', description: 'Plates not clean', status: 'RESOLVED' },
  ]);

  const [recentFeedback, setRecentFeedback] = useState<FeedbackRow[]>([
    { id: 1, student: 'Mark Z.', rating: 4, comment: 'Good lunch today!' },
    { id: 2, student: 'Sarah K.', rating: 5, comment: 'Excellent dinner spread.' },
  ]);

  useEffect(() => {
    // Fetch attendance today
    api.get('/attendance', { params: { date: today } }).then(res => {
      const records = res.data?.records ?? res.data ?? [];
      const served = Array.isArray(records) ? records.length : 0;
      setStats(prev => ({
        ...prev,
        served,
        attendancePct: parseFloat(((served / (500 * 3)) * 100).toFixed(1)),
      }));
    }).catch(() => { });

    // Fetch complaints
    api.get('/complaints').then(res => {
      const all = res.data?.complaints ?? res.data ?? [];
      if (Array.isArray(all) && all.length > 0) {
        setRecentComplaints(
          all.slice(0, 5).map((c: { id: string; user?: { name?: string }; category: string; description: string; status: string }) => ({
            id: c.id,
            student: c.user?.name ?? 'Student',
            category: c.category,
            description: c.description,
            status: c.status,
          }))
        );
      }
    }).catch(() => { });

    // Fetch feedback
    api.get('/feedback').then(res => {
      const all = res.data?.records ?? res.data?.feedback ?? (Array.isArray(res.data) ? res.data : []);
      if (Array.isArray(all) && all.length > 0) {
        const avg = all.reduce((s: number, f: { rating: number }) => s + (f.rating ?? 0), 0) / all.length;
        setStats(prev => ({ ...prev, avgRating: parseFloat(avg.toFixed(1)) }));
        const mapped = all.map((f: { id: string; user?: { name?: string }; rating: number; comment?: string }) => ({
          id: f.id,
          student: f.user?.name ?? 'Student',
          rating: f.rating,
          comment: f.comment,
        }));
        const MOCK_FEEDBACK: FeedbackRow[] = [
          { id: 'mock-f1', student: 'Mark Z.', rating: 4, comment: 'Good lunch today!' },
          { id: 'mock-f2', student: 'Sarah K.', rating: 5, comment: 'Excellent dinner spread.' },
        ];
        const dbIds = new Set(mapped.map((m: any) => m.id));
        setRecentFeedback([...mapped, ...MOCK_FEEDBACK.filter(m => !dbIds.has(m.id))]);
      }
    }).catch(() => { });

    // Fetch wastage
    api.get('/wastage').then(res => {
      const all = res.data?.records ?? res.data ?? [];
      if (Array.isArray(all) && all.length > 0) {
        const todayRecord = all.find((w: { date: string }) => {
          try {
            return format(new Date(w.date), 'yyyy-MM-dd') === today;
          } catch {
            return false;
          }
        });
        if (todayRecord) setStats(prev => ({ ...prev, foodWaste: Number(todayRecord.kilograms || todayRecord.kilos || 0) }));
      }
    }).catch(() => { });
  }, [today]);

  return (
    <Layout title="Admin Dashboard">
      {/* Top header bar */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 text-xs font-semibold border border-orange-200/50 dark:border-orange-800/60">
              <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100">System Overview</h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-0.5">{format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <DashboardCard
          title="Expected Students"
          value={stats.expected}
          icon={<Users className="w-5 h-5" />}
          color="blue"
        />
        <DashboardCard
          title="Meals Served"
          value={stats.served}
          subtitle="Today"
          icon={<ClipboardList className="w-5 h-5" />}
          color="green"
        />
        <DashboardCard
          title="Attendance"
          value={`${stats.attendancePct}%`}
          subtitle="Today"
          icon={<TrendingUp className="w-5 h-5" />}
          color="orange"
        />
        <DashboardCard
          title="Food Waste"
          value={`${stats.foodWaste} kg`}
          subtitle="Today"
          icon={<Trash2 className="w-5 h-5" />}
          color="red"
        />
        <DashboardCard
          title="Avg Rating"
          value={stats.avgRating}
          subtitle="Overall"
          icon={<Star className="w-5 h-5" />}
          color="orange"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Attendance bar chart */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-display text-sm font-semibold text-stone-800 dark:text-stone-200">Today's Attendance</p>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">Expected vs. served by meal</p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 text-xs font-medium border border-orange-200/50 dark:border-orange-800/60">
              Live
            </span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData} barGap={4} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#78716C33" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#78716C' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#A8A29E' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #78716C40', fontSize: 12, backgroundColor: '#1C1917', color: '#FAFAF9' }}
                  cursor={{ fill: '#EA580C15' }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar dataKey="Expected" fill="#A8A29E" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Served" fill="#EA580C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Wastage area chart */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-display text-sm font-semibold text-stone-800 dark:text-stone-200">Food Wastage</p>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">Last 7 days in kg</p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-red-500 dark:text-red-400 text-xs font-medium border border-red-200/50 dark:border-red-800/60">
              Weekly
            </span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={wasteData}>
                <defs>
                  <linearGradient id="wasteGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="#EF4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#78716C33" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#78716C' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#A8A29E' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #78716C40', fontSize: 12, backgroundColor: '#1C1917', color: '#FAFAF9' }}
                  formatter={(v: number) => [`${v} kg`, 'Waste']}
                />
                <ReferenceLine y={15} stroke="#FCD34D" strokeDasharray="4 4" label={{ value: 'Target', position: 'right', fontSize: 10, fill: '#D97706' }} />
                <Area type="monotone" dataKey="Waste" stroke="#EF4444" strokeWidth={2.5} fill="url(#wasteGrad)" dot={{ fill: '#EF4444', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complaints */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center">
            <p className="font-display text-sm font-semibold text-stone-800 dark:text-stone-200">Recent Complaints</p>
            <button
              onClick={() => navigate('/admin/complaints')}
              className="text-xs text-orange-600 dark:text-orange-400 font-semibold hover:text-orange-700 dark:hover:text-orange-300 transition-colors cursor-pointer"
            >
              View All →
            </button>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-stone-50/80 dark:bg-stone-800/80">
                <th className="py-2.5 px-6 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Student</th>
                <th className="py-2.5 px-6 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Category</th>
                <th className="py-2.5 px-6 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {recentComplaints.map(c => (
                <tr key={c.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/50 transition-colors">
                  <td className="py-3 px-6 text-stone-800 dark:text-stone-200 font-medium">{c.student}</td>
                  <td className="py-3 px-6 text-stone-500 dark:text-stone-400 capitalize text-xs">{c.category.replace(/_/g, ' ').toLowerCase()}</td>
                  <td className="py-3 px-6"><StatusBadge status={c.status} /></td>
                </tr>
              ))}
              {recentComplaints.length === 0 && (
                <tr><td colSpan={3} className="py-8 text-center text-stone-400 dark:text-stone-500 text-sm">No recent complaints</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Feedback */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center">
            <p className="font-display text-sm font-semibold text-stone-800 dark:text-stone-200">Recent Feedback</p>
            <button
              onClick={() => navigate('/admin/feedback')}
              className="text-xs text-orange-600 dark:text-orange-400 font-semibold hover:text-orange-700 dark:hover:text-orange-300 transition-colors cursor-pointer"
            >
              View All →
            </button>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-stone-50/80 dark:bg-stone-800/80">
                <th className="py-2.5 px-6 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Student</th>
                <th className="py-2.5 px-6 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Rating</th>
                <th className="py-2.5 px-6 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider w-1/3">Comment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {recentFeedback.map(f => (
                <tr key={f.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/50 transition-colors">
                  <td className="py-3 px-6 text-stone-800 dark:text-stone-200 font-medium">{f.student}</td>
                  <td className="py-3 px-6"><RatingStars rating={f.rating} readOnly /></td>
                  <td className="py-3 px-6 text-stone-500 dark:text-stone-400 truncate max-w-[160px] text-xs">{f.comment ?? '—'}</td>
                </tr>
              ))}
              {recentFeedback.length === 0 && (
                <tr><td colSpan={3} className="py-8 text-center text-stone-400 dark:text-stone-500 text-sm">No recent feedback</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
