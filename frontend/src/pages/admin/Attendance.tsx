import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import { api } from '../../lib/axios';
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isAfter,
  startOfDay
} from 'date-fns';
import {
  Users,
  Coffee,
  Sun,
  Moon,
  Calendar,
  Clock,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  X,
  Lock,
  ChevronRight
} from 'lucide-react';

const AdminAttendance = () => {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedMeal, setSelectedMeal] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Current Week Bounds (Monday to Sunday) - Strictly 1 Week
  const today = new Date();
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const currentWeekDays = eachDayOfInterval({ start: currentWeekStart, end: currentWeekEnd });

  // Mini Month Grid showing only Current Week active
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const calendarGridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarGridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const monthCalendarDays = eachDayOfInterval({ start: calendarGridStart, end: calendarGridEnd });

  // Permanent mock demo attendance records (always visible)
  const MOCK_DATA = [
    { id: 'mock-1', name: 'John Doe', rollNumber: 'CS2023001', email: 'john@college.edu', mealType: 'BREAKFAST', time: '07:45 AM', status: 'ATTENDED' },
    { id: 'mock-2', name: 'Alice Smith', rollNumber: 'CS2023014', email: 'alice@college.edu', mealType: 'BREAKFAST', time: '08:15 AM', status: 'ATTENDED' },
    { id: 'mock-3', name: 'Bob Wilson', rollNumber: 'EC2023042', email: 'bob@college.edu', mealType: 'LUNCH', time: '01:10 PM', status: 'ATTENDED' },
    { id: 'mock-4', name: 'Rahul Sharma', rollNumber: 'ME2023089', email: 'rahul@college.edu', mealType: 'LUNCH', time: '01:25 PM', status: 'ATTENDED' },
    { id: 'mock-5', name: 'Priya Patel', rollNumber: 'CS2023055', email: 'priya@college.edu', mealType: 'DINNER', time: '07:55 PM', status: 'ATTENDED' },
    { id: 'mock-6', name: 'Amit Verma', rollNumber: 'EE2023023', email: 'amit@college.edu', mealType: 'DINNER', time: '08:20 PM', status: 'ATTENDED' },
    { id: 'mock-7', name: 'Sneha Rao', rollNumber: 'CS2023071', email: 'sneha@college.edu', mealType: 'LUNCH', time: '01:45 PM', status: 'ATTENDED' },
    { id: 'mock-8', name: 'David Miller', rollNumber: 'IT2023018', email: 'david@college.edu', mealType: 'BREAKFAST', time: '08:40 AM', status: 'ATTENDED' },
  ];

  const [data, setData] = useState<any[]>(MOCK_DATA);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const res = await api.get('/attendance', { params: { date } });
        const dbRecords: any[] = Array.isArray(res.data) ? res.data : [];
        const mapped = dbRecords.map((record: any, idx: number) => ({
          id: record.id || String(idx),
          name: record.user?.name || 'Student ' + (idx + 1),
          rollNumber: record.user?.rollNumber || 'CS2023' + (100 + idx),
          email: record.user?.email || 'student@college.edu',
          mealType: (record.mealType || 'LUNCH').toUpperCase(),
          time: record.createdAt ? format(new Date(record.createdAt), 'hh:mm a') : '12:30 PM',
          status: record.status || 'ATTENDED'
        }));
        // Merge: real DB records on top, mock records below (deduplicate by id)
        const dbIds = new Set(mapped.map((r: any) => r.id));
        const uniqueMocks = MOCK_DATA.filter(m => !dbIds.has(m.id));
        setData([...mapped, ...uniqueMocks]);
      } catch (e) {
        // Keep mock data on network error
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [date]);

  // Select a date strictly within current week and not in the future
  const handleSelectDate = (d: Date) => {
    if (isAfter(startOfDay(d), startOfDay(today))) {
      return;
    }
    if (d >= currentWeekStart && d <= currentWeekEnd) {
      setDate(format(d, 'yyyy-MM-dd'));
    }
  };

  // Counts breakdown
  const breakfastCount = data.filter(d => d.mealType === 'BREAKFAST' && d.status === 'ATTENDED').length;
  const lunchCount = data.filter(d => d.mealType === 'LUNCH' && d.status === 'ATTENDED').length;
  const dinnerCount = data.filter(d => d.mealType === 'DINNER' && d.status === 'ATTENDED').length;
  const totalAttended = data.filter(d => d.status === 'ATTENDED').length;

  const filteredData = data.filter(item => {
    const matchesMeal = selectedMeal === 'ALL' || item.mealType === selectedMeal;
    const matchesSearch = searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMeal && matchesSearch;
  });

  const isTodayInWeek = today >= currentWeekStart && today <= currentWeekEnd;
  const yesterday = subDays(today, 1);
  const isYesterdayInWeek = yesterday >= currentWeekStart && yesterday <= currentWeekEnd;

  return (
    <Layout title="Attendance Logs">
      {/* Floating Toggle Pill attached to right corner for quick access */}
      <button
        type="button"
        onClick={() => setShowCalendar(!showCalendar)}
        className={`fixed right-0 top-28 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-l-2xl shadow-xl transition-all cursor-pointer font-semibold text-xs border-y border-l ${
          showCalendar
            ? 'bg-stone-900 dark:bg-stone-800 text-stone-200 border-stone-700 hover:bg-stone-800'
            : 'bg-gradient-to-l from-orange-600 to-amber-600 text-white border-orange-400 hover:pl-4.5 hover:shadow-orange-500/30'
        }`}
        title={showCalendar ? 'Close week calendar' : 'Open current week calendar'}
      >
        <Calendar className="w-4 h-4 shrink-0" />
        <span className="hidden sm:inline">{showCalendar ? 'Hide Week' : 'Week Calendar'}</span>
      </button>

      {/* Main Container: dynamically adapts margin when calendar is open so cards/table are never covered */}
      <div className={`transition-all duration-300 ${showCalendar ? 'xl:mr-[340px]' : ''}`}>
        {/* Top Banner and Date Picker */}
        <div className="mb-8 bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 text-xs font-semibold mb-2 border border-orange-200/50 dark:border-orange-800/60">
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Attendance Monitoring</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-stone-900 dark:text-stone-100 tracking-tight">
              Daily Student Attendance
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
              Monitor real-time meal check-ins and meal counts across all dining sessions.
            </p>
          </div>

          {/* Date Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {isTodayInWeek && (
              <button
                type="button"
                onClick={() => setDate(format(today, 'yyyy-MM-dd'))}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  date === format(today, 'yyyy-MM-dd')
                    ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
                }`}
              >
                Today
              </button>
            )}

            {isYesterdayInWeek && (
              <button
                type="button"
                onClick={() => setDate(format(yesterday, 'yyyy-MM-dd'))}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  date === format(yesterday, 'yyyy-MM-dd')
                    ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
                }`}
              >
                Yesterday
              </button>
            )}

            {/* Calendar Popup Trigger Button */}
            <button
              type="button"
              onClick={() => setShowCalendar(!showCalendar)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer shadow-2xs group ${
                showCalendar
                  ? 'bg-orange-600 text-white border-orange-600 ring-2 ring-orange-500/30'
                  : 'bg-stone-50 dark:bg-stone-800 border-stone-300 dark:border-stone-700 hover:border-orange-500 dark:hover:border-orange-500 text-stone-900 dark:text-stone-100'
              }`}
              title="Click to toggle 1-week calendar panel"
            >
              <Calendar className={`w-4 h-4 shrink-0 transition-transform ${showCalendar ? 'text-white' : 'text-orange-600 dark:text-orange-400 group-hover:scale-110'}`} />
              <span>{format(new Date(date), 'EEE, MMM d, yyyy')}</span>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md ml-1 ${
                showCalendar ? 'bg-orange-700 text-orange-100' : 'bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300'
              }`}>
                {showCalendar ? 'Opened' : 'Week Picker'}
              </span>
            </button>
          </div>
        </div>

        {/* 4 Stat Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
          <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-1">Total Attended</p>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 dark:text-stone-100">{totalAttended}</h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">Across all 3 meals</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/60 border border-orange-200/60 dark:border-orange-800/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-1">Breakfast</p>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-amber-600 dark:text-amber-400">{breakfastCount}</h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">7:30 AM – 9:00 AM</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Coffee className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-1">Lunch</p>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-emerald-600 dark:text-emerald-400">{lunchCount}</h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">1:00 PM – 2:00 PM</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sun className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-1">Dinner</p>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-rose-600 dark:text-rose-400">{dinnerCount}</h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">7:30 PM – 9:30 PM</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Moon className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filter Tabs and Search Bar */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-50/40 dark:bg-stone-800/40">
            {/* Meal Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-stone-100/80 dark:bg-stone-800 p-1.5 rounded-2xl w-fit">
              {[
                { id: 'ALL', label: 'All Meals' },
                { id: 'BREAKFAST', label: 'Breakfast' },
                { id: 'LUNCH', label: 'Lunch' },
                { id: 'DINNER', label: 'Dinner' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedMeal(tab.id)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    selectedMeal === tab.id
                      ? 'bg-white dark:bg-stone-900 text-orange-700 dark:text-orange-400 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 px-3.5 py-2 rounded-xl text-xs sm:text-sm focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 max-w-xs w-full">
              <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 shrink-0" />
              <input
                type="text"
                placeholder="Search by student or roll no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 text-xs"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50/80 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 font-semibold border-b border-stone-100 dark:border-stone-800 text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Student Details</th>
                  <th className="py-3.5 px-6">Meal Session</th>
                  <th className="py-3.5 px-6">Standard Hours</th>
                  <th className="py-3.5 px-6">Check-in Time</th>
                  <th className="py-3.5 px-6">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {filteredData.map((record) => {
                  const isBreakfast = record.mealType === 'BREAKFAST';
                  const isLunch = record.mealType === 'LUNCH';
                  const timingStr = isBreakfast ? '7:30 – 9:00 AM' : isLunch ? '1:00 – 2:00 PM' : '7:30 – 9:30 PM';

                  return (
                    <tr key={record.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-orange-100/70 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 font-bold text-xs flex items-center justify-center shrink-0">
                            {record.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm">{record.name}</p>
                            <p className="text-xs text-stone-400 dark:text-stone-500 font-mono">{record.rollNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          isBreakfast
                            ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60'
                            : isLunch
                            ? 'bg-orange-50 dark:bg-orange-950/50 text-orange-800 dark:text-orange-300 border border-orange-200/60 dark:border-orange-800/60'
                            : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60'
                        }`}>
                          {isBreakfast ? <Coffee className="w-3 h-3" /> : isLunch ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                          <span className="capitalize">{record.mealType.toLowerCase()}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-stone-500 dark:text-stone-400 font-mono text-xs">
                        {timingStr}
                      </td>
                      <td className="py-4 px-6 text-stone-700 dark:text-stone-300 font-medium text-xs flex items-center gap-1.5 mt-3">
                        <Clock className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
                        <span>{record.time}</span>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={record.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredData.length === 0 && (
              <div className="p-12 text-center text-stone-400 dark:text-stone-500 text-sm">
                <ClipboardCheck className="w-8 h-8 mx-auto mb-2 text-stone-300 dark:text-stone-600" />
                <p>No attendance records match your filter criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Half-Moon Calendar Panel Attached to the Right Corner */}
      {showCalendar && (
        <aside
          aria-label="Attendance Calendar Panel"
          className="fixed right-0 top-20 sm:top-24 bottom-6 z-50 w-80 sm:w-88 flex flex-col bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-l-[40px] shadow-2xl border-l-2 border-y border-orange-300/80 dark:border-orange-500/40 p-5 overflow-y-auto transition-all animate-fadeIn"
        >
          {/* Calendar Header with curved accent */}
          <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shadow-xs">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <span>{format(today, 'MMMM yyyy')}</span>
                </h3>
                <span className="text-[10px] font-semibold text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/80 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-orange-200/60 dark:border-orange-800/60">
                  Current Week Only
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowCalendar(false)}
              className="p-1.5 text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
              title="Close calendar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Month Mini Grid showing ONLY Current Week active */}
          <div className="mb-4">
            <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
                <span key={d} className="text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase py-0.5">
                  {d}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {monthCalendarDays.map((dayItem, idx) => {
                const dayStr = format(dayItem, 'yyyy-MM-dd');
                const isInCurrentWeek = dayItem >= currentWeekStart && dayItem <= currentWeekEnd;
                const isFutureDate = isAfter(startOfDay(dayItem), startOfDay(today));
                const isSelected = dayStr === date;
                const isTodayItem = format(dayItem, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

                if (!isInCurrentWeek) {
                  return (
                    <div
                      key={idx}
                      className="h-8 flex items-center justify-center text-xs text-stone-300 dark:text-stone-700 opacity-25 cursor-not-allowed select-none rounded-lg"
                      title="Date outside current week (Disabled)"
                    >
                      {format(dayItem, 'd')}
                    </div>
                  );
                }

                if (isFutureDate) {
                  return (
                    <div
                      key={idx}
                      className="h-8 flex items-center justify-center text-xs text-stone-400 dark:text-stone-600 opacity-30 cursor-not-allowed select-none rounded-lg bg-stone-100/40 dark:bg-stone-800/30"
                      title="Upcoming date (Disabled)"
                    >
                      {format(dayItem, 'd')}
                    </div>
                  );
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectDate(dayItem)}
                    className={`h-8 flex flex-col items-center justify-center text-xs font-semibold rounded-xl transition-all relative cursor-pointer ${
                      isSelected
                        ? 'bg-orange-600 text-white shadow-xs ring-2 ring-orange-500/40 font-bold'
                        : 'text-stone-800 dark:text-stone-200 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-600 dark:hover:text-orange-400'
                    }`}
                    title={format(dayItem, 'EEE, MMM d')}
                  >
                    <span>{format(dayItem, 'd')}</span>
                    {isTodayItem && !isSelected && (
                      <span className="w-1 h-1 rounded-full bg-orange-600 dark:bg-orange-400 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Week Day Selector Buttons */}
          <div className="space-y-1.5 pt-3 border-t border-stone-100 dark:border-stone-800 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block mb-2">
              Current Week ({format(currentWeekStart, 'MMM d')} – {format(currentWeekEnd, 'MMM d')})
            </span>
            {currentWeekDays.map((dayItem) => {
              const dayStr = format(dayItem, 'yyyy-MM-dd');
              const isFutureDate = isAfter(startOfDay(dayItem), startOfDay(today));
              const isSelected = dayStr === date;
              const isTodayItem = format(dayItem, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

              if (isFutureDate) {
                return (
                  <div
                    key={dayStr}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-not-allowed opacity-40 select-none bg-stone-100/50 dark:bg-stone-800/40 border border-dashed border-stone-200 dark:border-stone-800 text-stone-400 dark:text-stone-600"
                    title="Upcoming date (Disabled)"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase text-stone-400 dark:text-stone-600">
                        {format(dayItem, 'EEE')}
                      </span>
                      <span>{format(dayItem, 'MMM d')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-400 dark:text-stone-600">
                      <span className="text-[10px] font-medium">Upcoming</span>
                      <Lock className="w-3 h-3" />
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={dayStr}
                  type="button"
                  onClick={() => handleSelectDate(dayItem)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold shadow-xs'
                      : 'bg-stone-50 dark:bg-stone-800/80 hover:bg-orange-50 dark:hover:bg-orange-950/40 border border-stone-200/80 dark:border-stone-700 hover:border-orange-300 dark:hover:border-orange-600 text-stone-800 dark:text-stone-200 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold uppercase ${isSelected ? 'text-amber-100' : 'text-stone-500 dark:text-stone-400'}`}>
                      {format(dayItem, 'EEE')}
                    </span>
                    <span>{format(dayItem, 'MMM d')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isTodayItem && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60'
                      }`}>
                        Today
                      </span>
                    )}
                    <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-stone-400 dark:text-stone-500'}`} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Calendar Notice */}
          <div className="mt-3.5 pt-2.5 border-t border-stone-100 dark:border-stone-800 flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
            <Lock className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
            <span>Restricted to current week (past & today only)</span>
          </div>
        </aside>
      )}
    </Layout>
  );
};

export default AdminAttendance;
