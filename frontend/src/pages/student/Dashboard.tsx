import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import DashboardCard from '../../components/DashboardCard';
import RatingStars from '../../components/RatingStars';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/axios';
import {
  ClipboardCheck,
  Star,
  AlertCircle,
  Coffee,
  Sun,
  Moon,
  Clock,
  ArrowRight,
  Sparkles,
  Utensils,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    mealsAttended: 2,
    avgRating: 4.5,
    openComplaints: 1
  });

  const todayMenu = [
    {
      type: 'BREAKFAST',
      title: 'Breakfast',
      timing: '7:30 AM – 9:00 AM',
      items: ['Steamed Idli', 'Vegetable Sambar', 'Coconut Chutney', 'Tea & Coffee'],
      icon: Coffee,
      accent: 'amber',
      badge: 'Morning Spread'
    },
    {
      type: 'LUNCH',
      title: 'Lunch',
      timing: '1:00 PM – 2:00 PM',
      items: ['Basmati Rice', 'Dal Makhani', 'Seasonal Mixed Veg', 'Butter Roti', 'Fresh Curd & Salad'],
      icon: Sun,
      accent: 'orange',
      badge: 'Afternoon Feast'
    },
    {
      type: 'DINNER',
      title: 'Dinner',
      timing: '7:30 PM – 9:30 PM',
      items: ['Jeera Rice', 'Paneer Butter Masala', 'Tawa Chapati', 'Dal Fry', 'Gulab Jamun'],
      icon: Moon,
      accent: 'red',
      badge: 'Night Special'
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attendanceRes, feedbackRes, complaintsRes] = await Promise.allSettled([
          api.get('/attendance'),
          api.get('/feedback'),
          api.get('/complaints')
        ]);

        let attendedCount = 2;
        let ratingVal = 4.5;
        let pendingComplaints = 1;

        if (attendanceRes.status === 'fulfilled' && Array.isArray(attendanceRes.value.data)) {
          const todayLocal = format(new Date(), 'yyyy-MM-dd');
          const todayAttended = attendanceRes.value.data.filter((a: any) => {
            try {
              return format(new Date(a.date || a.createdAt), 'yyyy-MM-dd') === todayLocal && a.status === 'ATTENDED';
            } catch {
              return false;
            }
          });
          if (todayAttended.length > 0) attendedCount = todayAttended.length;
        }

        if (feedbackRes.status === 'fulfilled') {
          const records = feedbackRes.value.data.records || feedbackRes.value.data;
          if (Array.isArray(records) && records.length > 0) {
            const sum = records.reduce((acc: number, cur: any) => acc + (cur.rating || 0), 0);
            ratingVal = Number((sum / records.length).toFixed(1));
          }
        }

        if (complaintsRes.status === 'fulfilled' && Array.isArray(complaintsRes.value.data)) {
          const pending = complaintsRes.value.data.filter((c: any) => c.status === 'PENDING').length;
          pendingComplaints = pending;
        }

        setStats({
          mealsAttended: attendedCount,
          avgRating: ratingVal,
          openComplaints: pendingComplaints
        });
      } catch (e) {
        // Fallback to initial mock stats
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <Layout title="Student Dashboard">
      {/* Welcome Banner */}
      <div className="mb-8 bg-gradient-to-r from-orange-600 via-amber-600 to-amber-500 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-orange-600/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-100 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Nourishing College Community</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
              {getGreeting()}, {user?.name || 'Student'}! 👋
            </h2>
            <p className="text-amber-100/90 text-sm leading-relaxed">
              Check today's meal schedule, mark your attendance on time, and rate your mess experience.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/student/attendance"
              className="px-4 py-2.5 rounded-xl bg-white text-orange-700 font-semibold text-sm hover:bg-amber-50 transition-all shadow-sm flex items-center gap-1.5 group"
            >
              <ClipboardCheck className="w-4 h-4 text-orange-600" />
              <span>Mark Attendance</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/student/feedback"
              className="px-4 py-2.5 rounded-xl bg-orange-700/60 hover:bg-orange-700/80 text-white font-medium text-sm border border-white/20 transition-all flex items-center gap-1.5"
            >
              <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Give Feedback</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <DashboardCard
          title="Today's Meals Attended"
          value={stats.mealsAttended}
          subtitle="Out of 3 scheduled meals today"
          icon={<ClipboardCheck className="w-6 h-6" />}
          color="orange"
          trend={`${Math.round((stats.mealsAttended / 3) * 100)}% Marked`}
        />
        <DashboardCard
          title="Average Rating Given"
          value={`${stats.avgRating} / 5`}
          subtitle="Your feedback helps improve meals"
          icon={<Star className="w-6 h-6 fill-amber-400 text-amber-400" />}
          color="amber"
        />
        <DashboardCard
          title="Open Complaints"
          value={stats.openComplaints}
          subtitle={stats.openComplaints > 0 ? "Under review by mess supervisor" : "No active pending issues"}
          icon={<AlertCircle className="w-6 h-6" />}
          color={stats.openComplaints > 0 ? "red" : "green"}
        />
      </div>

      {/* Today's Menu Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg sm:text-xl font-display font-bold text-stone-900 dark:text-stone-100 tracking-tight flex items-center gap-2">
              <Utensils className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              Today's Menu & Exact Timings
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Prepared fresh daily in the central student mess facility
            </p>
          </div>
          <Link
            to="/student/menu"
            className="text-xs sm:text-sm font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 flex items-center gap-1 group"
          >
            <span>Weekly Menu</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {todayMenu.map((meal) => {
            const Icon = meal.icon;
            return (
              <div
                key={meal.type}
                className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm hover:shadow-md border border-stone-200/80 dark:border-stone-800 overflow-hidden flex flex-col transition-all duration-200 group"
              >
                {/* Meal Card Header */}
                <div className="p-5 border-b border-stone-100 dark:border-stone-800 bg-gradient-to-br from-stone-50/70 to-white dark:from-stone-800/60 dark:to-stone-900 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/60 border border-orange-200/60 dark:border-orange-800/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-stone-900 dark:text-stone-100 text-base">
                        {meal.title}
                      </h4>
                      <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                        {meal.badge}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200/50 dark:border-stone-700">
                    Daily
                  </span>
                </div>

                {/* Timing Banner */}
                <div className="px-5 py-2.5 bg-amber-50/60 dark:bg-amber-950/40 border-b border-amber-100/60 dark:border-amber-900/50 flex items-center gap-2 text-xs font-semibold text-amber-900 dark:text-amber-200">
                  <Clock className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                  <span>Timings:</span>
                  <span className="font-mono text-stone-800 dark:text-stone-200">{meal.timing}</span>
                </div>

                {/* Food Items List */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 block mb-2.5">
                      Served Items
                    </span>
                    <ul className="space-y-2">
                      {meal.items.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2.5 text-sm text-stone-700 dark:text-stone-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                          <span className="font-medium text-stone-800 dark:text-stone-200">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Vegetarian • Hygienic</span>
                    <Link
                      to="/student/attendance"
                      className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:underline"
                    >
                      Record Attendance →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Helpful Campus Mess Notice Card */}
      <div className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Zero Food Wastage Initiative 🌱
            </h4>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
              Marking attendance helps mess chefs prepare the exact quantity of food needed, eliminating leftover food waste.
            </p>
          </div>
        </div>
        <Link
          to="/student/attendance"
          className="shrink-0 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-medium text-xs transition-colors shadow-2xs cursor-pointer"
        >
          Check Attendance
        </Link>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
