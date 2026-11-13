import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import RatingStars from '../../components/RatingStars';
import { api } from '../../lib/axios';
import { format } from 'date-fns';
import {
  Star,
  Coffee,
  Sun,
  Moon,
  Search,
  Filter,
  MessageSquare,
  ThumbsUp,
  Sparkles,
  TrendingUp,
  Users
} from 'lucide-react';

const AdminFeedback = () => {
  const [selectedMeal, setSelectedMeal] = useState<string>('ALL');
  const [selectedRating, setSelectedRating] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Permanent mock feedback records (always preserved)
  const MOCK_FEEDBACK = [
    {
      id: 'mock-fb-1',
      student: 'John Doe',
      rollNumber: 'CS2023001',
      date: new Date().toISOString(),
      mealType: 'BREAKFAST',
      rating: 5,
      comment: 'The masala dosa was crispy and fresh, sambar was very tasty!'
    },
    {
      id: 'mock-fb-2',
      student: 'Alice Smith',
      rollNumber: 'CS2023014',
      date: new Date(Date.now() - 86400000).toISOString(),
      mealType: 'LUNCH',
      rating: 4,
      comment: 'Paneer butter masala and rotis were good. Rice could be slightly warmer.'
    },
    {
      id: 'mock-fb-3',
      student: 'Bob Wilson',
      rollNumber: 'EC2023042',
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      mealType: 'DINNER',
      rating: 5,
      comment: 'Biryani and gulab jamun were outstanding tonight. Great work by kitchen staff.'
    },
    {
      id: 'mock-fb-4',
      student: 'Priya Patel',
      rollNumber: 'CS2023055',
      date: new Date(Date.now() - 86400000 * 3).toISOString(),
      mealType: 'BREAKFAST',
      rating: 4,
      comment: 'Good hygiene and fast service at the counters.'
    }
  ];

  const [feedbackList, setFeedbackList] = useState<any[]>(MOCK_FEEDBACK);
  const [stats, setStats] = useState({
    avgRating: 4.5,
    totalCount: MOCK_FEEDBACK.length
  });

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await api.get('/feedback');
      const dbRecords = res.data?.records || (Array.isArray(res.data) ? res.data : []);

      const mapped = dbRecords.map((item: any, idx: number) => ({
        id: item.id || `db-${idx}`,
        student: item.user?.name || 'Student',
        rollNumber: item.user?.rollNumber || 'CS2024xxx',
        date: item.date || item.createdAt || new Date().toISOString(),
        mealType: (item.mealType || 'LUNCH').toUpperCase(),
        rating: Number(item.rating || 5),
        comment: item.comment || ''
      }));

      // Merge real DB records on top, keep mock feedback below
      const dbIds = new Set(mapped.map((f: any) => f.id));
      const uniqueMocks = MOCK_FEEDBACK.filter(m => !dbIds.has(m.id));
      const combined = [...mapped, ...uniqueMocks];

      setFeedbackList(combined);

      if (combined.length > 0) {
        const total = combined.reduce((acc, cur) => acc + cur.rating, 0);
        setStats({
          avgRating: Number((total / combined.length).toFixed(1)),
          totalCount: combined.length
        });
      }
    } catch (e) {
      // Keep mock data on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const filteredFeedback = feedbackList.filter(item => {
    const matchesMeal = selectedMeal === 'ALL' || item.mealType === selectedMeal;
    const matchesRating = selectedRating === 'ALL' || String(item.rating) === selectedRating;
    const matchesSearch = searchQuery === '' ||
      item.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.comment && item.comment.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.rollNumber && item.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesMeal && matchesRating && matchesSearch;
  });

  const fiveStarCount = feedbackList.filter(f => f.rating === 5).length;
  const fourStarCount = feedbackList.filter(f => f.rating === 4).length;

  return (
    <Layout title="Student Feedback & Ratings">
      {/* Top Banner and Quick Stats */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-2 border border-amber-200/50 dark:border-amber-800/50">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Dining Satisfaction Overview</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-stone-900 dark:text-stone-100 tracking-tight">
              Student Meal Ratings & Reviews
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
              Real-time student feedback collected after breakfast, lunch, and dinner sessions.
            </p>
          </div>
        </div>

        {/* Rating Breakdown Pill */}
        <div className="lg:col-span-4 bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs flex items-center justify-around">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block mb-0.5">Average</span>
            <div className="flex items-center justify-center gap-1">
              <span className="text-2xl font-display font-bold text-stone-900 dark:text-stone-100">{stats.avgRating}</span>
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-[10px] text-stone-400 dark:text-stone-500 block">Out of 5.0</span>
          </div>
          <div className="w-px h-10 bg-stone-200 dark:bg-stone-800" />
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block mb-0.5">Total Reviews</span>
            <span className="text-2xl font-display font-bold text-orange-600 dark:text-orange-400">{stats.totalCount}</span>
            <span className="text-[10px] text-stone-400 dark:text-stone-500 block">{fiveStarCount} 5-Star ratings</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-50/40 dark:bg-stone-800/40">
          <div className="flex flex-wrap items-center gap-2">
            {/* Meal Filter Tabs */}
            <div className="flex items-center gap-1 bg-stone-100/80 dark:bg-stone-800 p-1.5 rounded-2xl">
              {[
                { id: 'ALL', label: 'All Meals' },
                { id: 'BREAKFAST', label: 'Breakfast' },
                { id: 'LUNCH', label: 'Lunch' },
                { id: 'DINNER', label: 'Dinner' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedMeal(tab.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    selectedMeal === tab.id
                      ? 'bg-white dark:bg-stone-900 text-orange-700 dark:text-orange-400 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Rating Filter Tabs */}
            <div className="flex items-center gap-1 bg-stone-100/80 dark:bg-stone-800 p-1.5 rounded-2xl">
              {[
                { id: 'ALL', label: 'All Stars' },
                { id: '5', label: '5 ★' },
                { id: '4', label: '4 ★' },
                { id: '3', label: '3 ★' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedRating(tab.id)}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    selectedRating === tab.id
                      ? 'bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-400 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3.5 py-2 rounded-xl text-xs sm:text-sm focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 max-w-xs w-full">
            <Search className="w-4 h-4 text-stone-400 shrink-0" />
            <input
              type="text"
              placeholder="Search feedback or student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-stone-900 dark:text-stone-100 placeholder:text-stone-400 text-xs"
            />
          </div>
        </div>

        {/* Feedback Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50/80 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 font-semibold border-b border-stone-100 dark:border-stone-800 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Student</th>
                <th className="py-3.5 px-6">Meal</th>
                <th className="py-3.5 px-6">Rating</th>
                <th className="py-3.5 px-6 w-2/5">Student Comments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredFeedback.map((fb) => {
                const isBreakfast = fb.mealType === 'BREAKFAST';
                const isLunch = fb.mealType === 'LUNCH';

                return (
                  <tr key={fb.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/50 transition-colors">
                    <td className="py-4 px-6 text-stone-900 dark:text-stone-100 font-medium whitespace-nowrap text-xs">
                      {format(new Date(fb.date), 'MMM d, yyyy')}
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm leading-tight">{fb.student}</p>
                        <p className="text-xs text-stone-400 dark:text-stone-500 font-mono mt-0.5">{fb.rollNumber}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold capitalize border whitespace-nowrap shadow-2xs ${
                        isBreakfast
                          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60'
                          : isLunch
                          ? 'bg-orange-50 dark:bg-orange-950/50 text-orange-800 dark:text-orange-300 border-orange-200/60 dark:border-orange-800/60'
                          : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60'
                      }`}>
                        {isBreakfast ? <Coffee className="w-3 h-3" /> : isLunch ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                        <span>{fb.mealType.toLowerCase()}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <RatingStars rating={fb.rating} readOnly size="sm" />
                        <span className="text-xs font-bold text-amber-900 dark:text-amber-200 font-mono">{fb.rating}.0</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-stone-700 dark:text-stone-300 text-xs leading-relaxed">
                      <p className="line-clamp-2" title={fb.comment}>
                        {fb.comment || 'Satisfactory food quality.'}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredFeedback.length === 0 && (
            <div className="p-12 text-center text-stone-400 dark:text-stone-500 text-sm">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-stone-300 dark:text-stone-600" />
              <p>No feedback entries match your filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminFeedback;
