import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import { api } from '../../lib/axios';
import { format } from 'date-fns';
import {
  CheckCircle2,
  Coffee,
  Sun,
  Moon,
  Clock,
  ClipboardCheck,
  Calendar,
  Sparkles
} from 'lucide-react';

const StudentAttendance = () => {
  const [marking, setMarking] = useState<string | null>(null);
  const [attendedMeals, setAttendedMeals] = useState<string[]>([]);
  // Permanent mock demo records (always visible)
  const MOCK_HISTORY = [
    { id: 'mock-1', date: new Date().toISOString(), mealType: 'BREAKFAST', status: 'ATTENDED' },
    { id: 'mock-2', date: new Date(Date.now() - 86400000).toISOString(), mealType: 'DINNER', status: 'ATTENDED' },
    { id: 'mock-3', date: new Date(Date.now() - 86400000).toISOString(), mealType: 'LUNCH', status: 'MISSED' },
    { id: 'mock-4', date: new Date(Date.now() - 86400000 * 2).toISOString(), mealType: 'BREAKFAST', status: 'ATTENDED' },
    { id: 'mock-5', date: new Date(Date.now() - 86400000 * 2).toISOString(), mealType: 'LUNCH', status: 'ATTENDED' },
  ];

  const [history, setHistory] = useState<any[]>(MOCK_HISTORY);
  const [apiError, setApiError] = useState('');

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/attendance');
      const dbRecords: any[] = Array.isArray(res.data) ? res.data : [];
      // Merge: real DB records on top, mock records below (keyed to avoid duplicates)
      const dbIds = new Set(dbRecords.map((r: any) => r.id));
      const uniqueMocks = MOCK_HISTORY.filter(m => !dbIds.has(m.id));
      const todayLocal = format(new Date(), 'yyyy-MM-dd');
      const todayAttended = dbRecords
        .filter((a: any) => {
          try {
            return format(new Date(a.date || a.createdAt), 'yyyy-MM-dd') === todayLocal && a.status === 'ATTENDED';
          } catch {
            return false;
          }
        })
        .map((a: any) => a.mealType);
      if (todayAttended.length > 0) {
        setAttendedMeals(prev => [...new Set([...prev, ...todayAttended])]);
      }
      setHistory([...dbRecords, ...uniqueMocks]);
    } catch (err) {
      // Keep mock data on network error
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleMark = async (mealType: string) => {
    setMarking(mealType);
    setApiError('');
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    try {
      await api.post('/attendance', { date: todayStr, mealType });
      // Only update UI after confirmed DB save
      setAttendedMeals(prev => [...new Set([...prev, mealType])]);
      await fetchAttendance();
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        // Already marked — reflect it in the UI and refresh
        setAttendedMeals(prev => [...new Set([...prev, mealType])]);
        await fetchAttendance();
      } else {
        setApiError(`Failed to record ${mealType.toLowerCase()} attendance. Please try again.`);
      }
    } finally {
      setMarking(null);
    }
  };

  const todayMeals = [
    {
      type: 'BREAKFAST',
      title: 'Breakfast',
      timing: '7:30 AM – 9:00 AM',
      items: ['Idli & Sambar', 'Coconut Chutney', 'Hot Chai'],
      icon: Coffee,
      color: 'amber'
    },
    {
      type: 'LUNCH',
      title: 'Lunch',
      timing: '1:00 PM – 2:00 PM',
      items: ['Rice & Dal Makhani', 'Paneer Sabzi', 'Tawa Roti', 'Salad'],
      icon: Sun,
      color: 'orange'
    },
    {
      type: 'DINNER',
      title: 'Dinner',
      timing: '7:30 PM – 9:30 PM',
      items: ['Jeera Rice', 'Dal Tadka', 'Seasonal Veg', 'Gulab Jamun'],
      icon: Moon,
      color: 'red'
    },
  ];

  return (
    <Layout title="Meal Attendance">
      {apiError && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300 text-sm rounded-2xl flex items-center justify-between gap-3">
          <span>{apiError}</span>
          <button onClick={() => setApiError('')} className="text-red-500 hover:text-red-700 dark:hover:text-red-300 font-bold text-lg leading-none cursor-pointer">×</button>
        </div>
      )}
      {/* Top Banner with Instructions and Today's Counter */}
      <div className="mb-8 bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 text-xs font-semibold mb-2 border border-orange-200/50 dark:border-orange-800/60">
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>Daily Attendance Verification</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            Mark Today's Meals
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-xl">
            Confirm each meal you attend. Your records help the administration track dining volume and optimize meal preparation.
          </p>
        </div>

        {/* Attendance Counter Pill */}
        <div className="flex items-center gap-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-5 py-3 rounded-2xl shrink-0">
          <div className="text-right">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 block">
              Today's Status
            </span>
            <span className="text-base font-display font-bold text-stone-900 dark:text-stone-100">
              {attendedMeals.length} of 3 Meals
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-display font-bold text-sm shadow-xs">
            {Math.round((attendedMeals.length / 3) * 100)}%
          </div>
        </div>
      </div>

      {/* 3 Meal Attendance Cards */}
      <div className="mb-10">
        <h3 className="text-base font-display font-bold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
          <span>Scheduled Meals for Today</span>
          <span className="text-xs text-stone-400 dark:text-stone-500 font-normal">({format(new Date(), 'EEEE, MMMM d')})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {todayMeals.map((meal) => {
            const isAttended = attendedMeals.includes(meal.type);
            const isMarking = marking === meal.type;
            const Icon = meal.icon;

            return (
              <div
                key={meal.type}
                className={`bg-white dark:bg-stone-900 rounded-3xl shadow-sm hover:shadow-md border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                  isAttended
                    ? 'border-emerald-300 dark:border-emerald-700/80 ring-1 ring-emerald-100 dark:ring-emerald-950/40'
                    : 'border-stone-200/80 dark:border-stone-800'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="p-5 border-b border-stone-100 dark:border-stone-800 bg-gradient-to-br from-stone-50/70 to-white dark:from-stone-800/60 dark:to-stone-900 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/60 border border-orange-200/60 dark:border-orange-800/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shadow-2xs">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-stone-900 dark:text-stone-100 text-base">
                          {meal.title}
                        </h4>
                        <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Regular Student Spread</span>
                      </div>
                    </div>
                  </div>

                  {/* Timing Banner */}
                  <div className="px-5 py-2.5 bg-amber-50/70 dark:bg-amber-950/40 border-b border-amber-100/70 dark:border-amber-900/50 flex items-center gap-2 text-xs font-semibold text-amber-950 dark:text-amber-200">
                    <Clock className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                    <span>Timings:</span>
                    <span className="font-mono text-stone-900 dark:text-stone-100 font-bold">{meal.timing}</span>
                  </div>

                  {/* Food Items */}
                  <div className="p-5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block mb-2">
                      Menu Preview
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {meal.items.map((item, idx) => (
                        <span key={idx} className="text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200/70 dark:border-stone-700 text-stone-700 dark:text-stone-300 px-2.5 py-1 rounded-lg">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="p-5 pt-0">
                  {isAttended ? (
                    <div className="w-full py-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Attendance Recorded ✓</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleMark(meal.type)}
                      disabled={isMarking}
                      className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-2xl text-sm font-semibold transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm shadow-orange-600/20 active:scale-[0.99] cursor-pointer"
                    >
                      {isMarking ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Recording...</span>
                        </>
                      ) : (
                        <>
                          <ClipboardCheck className="w-4 h-4" />
                          <span>Mark as Attended</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Attendance History Section */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-display font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              Attendance History
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Recent meals recorded on your student account
            </p>
          </div>
          <span className="text-xs text-stone-400 dark:text-stone-500 font-medium">
            Showing latest {history.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50/80 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 font-semibold border-b border-stone-100 dark:border-stone-800 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Meal Type</th>
                <th className="py-3.5 px-6">Standard Hours</th>
                <th className="py-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {history.map((record, idx) => {
                const mealTypeNormalized = (record.mealType || record.type || 'LUNCH').toUpperCase();
                const mealHours =
                  mealTypeNormalized === 'BREAKFAST' ? '7:30 – 9:00 AM' :
                  mealTypeNormalized === 'LUNCH' ? '1:00 – 2:00 PM' : '7:30 – 9:30 PM';

                return (
                  <tr key={record.id || idx} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/50 transition-colors">
                    <td className="py-4 px-6 text-stone-900 dark:text-stone-100 font-medium whitespace-nowrap">
                      {format(new Date(record.date), 'EEEE, MMM d, yyyy')}
                    </td>
                    <td className="py-4 px-6 capitalize text-stone-800 dark:text-stone-200 font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      {mealTypeNormalized.toLowerCase()}
                    </td>
                    <td className="py-4 px-6 text-stone-500 dark:text-stone-400 font-mono text-xs">
                      {mealHours}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={record.status || 'ATTENDED'} />
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

export default StudentAttendance;
