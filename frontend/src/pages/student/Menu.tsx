import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { api } from '../../lib/axios';
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth
} from 'date-fns';
import {
  Coffee,
  Sun,
  Moon,
  Calendar as CalendarIcon,
  Clock,
  Leaf,
  Check,
  ChevronDown,
  Lock,
  X
} from 'lucide-react';
import { Menu } from '../../types';

const StudentMenu = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);

  // Current Week Bounds (Monday to Sunday)
  const today = new Date();
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const currentWeekDays = eachDayOfInterval({ start: currentWeekStart, end: currentWeekEnd });

  // Mini Month Grid for Calendar UI
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const calendarGridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarGridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const monthCalendarDays = eachDayOfInterval({ start: calendarGridStart, end: calendarGridEnd });

  // Fallback mock data with realistic college mess items
  const getMockMenu = (targetDate: string): Menu[] => [
    {
      id: '1',
      date: targetDate,
      mealType: 'BREAKFAST',
      items: ['Crispy Masala Dosa', 'Coconut Chutney', 'Tomato Onion Chutney', 'Sambar', 'Hot Tea / Filter Coffee']
    },
    {
      id: '2',
      date: targetDate,
      mealType: 'LUNCH',
      items: ['Steamed Basmati Rice', 'Dal Tadka', 'Paneer Do Pyaza', 'Tawa Roti', 'Cucumber Raita', 'Roasted Papad']
    },
    {
      id: '3',
      date: targetDate,
      mealType: 'DINNER',
      items: ['Hyderabadi Veg Biryani', 'Mirchi Ka Salan', 'Boondi Raita', 'Rumali Roti', 'Gulab Jamun']
    }
  ];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchMenu = async () => {
      try {
        const response = await api.get('/menu', { params: { date } });
        if (isMounted) {
          const dbMenus: Menu[] = Array.isArray(response.data) ? response.data : [];
          const mockMenus = getMockMenu(date);
          if (dbMenus.length > 0) {
            // Merge: DB records override mock for same mealType; mock fills gaps
            const dbMealTypes = new Set(dbMenus.map(m => m.mealType));
            const uniqueMocks = mockMenus.filter(m => !dbMealTypes.has(m.mealType));
            setMenus([...dbMenus, ...uniqueMocks]);
          } else {
            setMenus(mockMenus);
          }
        }
      } catch (err) {
        if (isMounted) {
          setMenus(getMockMenu(date));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMenu();

    return () => {
      isMounted = false;
    };
  }, [date]);

  const mealConfigs = [
    {
      type: 'BREAKFAST',
      title: 'Breakfast',
      timing: '7:30 AM – 9:00 AM',
      icon: Coffee,
      color: 'amber',
      accentBg: 'bg-amber-50',
      borderAccent: 'border-amber-200/70',
      tag: 'Morning Nutrition'
    },
    {
      type: 'LUNCH',
      title: 'Lunch',
      timing: '1:00 PM – 2:00 PM',
      icon: Sun,
      color: 'orange',
      accentBg: 'bg-orange-50',
      borderAccent: 'border-orange-200/70',
      tag: 'Afternoon Energy'
    },
    {
      type: 'DINNER',
      title: 'Dinner',
      timing: '7:30 PM – 9:30 PM',
      icon: Moon,
      color: 'red',
      accentBg: 'bg-rose-50',
      borderAccent: 'border-rose-200/70',
      tag: 'Evening Comfort'
    }
  ];

  const handleSelectDate = (targetDate: Date) => {
    // Only allow dates within the current week
    if (targetDate >= currentWeekStart && targetDate <= currentWeekEnd) {
      setDate(format(targetDate, 'yyyy-MM-dd'));
    }
  };

  const handleSetQuickDate = (daysAhead: number) => {
    const target = addDays(today, daysAhead);
    if (target >= currentWeekStart && target <= currentWeekEnd) {
      setDate(format(target, 'yyyy-MM-dd'));
    }
  };

  const tomorrow = addDays(today, 1);
  const isTomorrowInCurrentWeek = tomorrow <= currentWeekEnd;
  const isToday = date === format(today, 'yyyy-MM-dd');
  const isTomorrow = isTomorrowInCurrentWeek && date === format(tomorrow, 'yyyy-MM-dd');

  return (
    <Layout title="Mess Menu Schedule">
      {/* Header with Title and Viewport-Safe Date Picker */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-stone-900 p-5 sm:p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-stone-900 dark:text-stone-100 tracking-tight flex items-center gap-2">
            <span>Daily Menu Schedule</span>
            {isToday && (
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
                Today
              </span>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Browse planned recipes and dietary items prepared by the college mess kitchen.
          </p>
        </div>

        {/* Viewport-Safe Date Selector */}
        <div className="flex flex-wrap items-center gap-2.5 max-w-full">
          {/* Quick Date Pills */}
          <div className="flex items-center gap-1.5 bg-stone-100/80 dark:bg-stone-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => handleSetQuickDate(0)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                isToday
                  ? 'bg-white dark:bg-stone-900 text-orange-700 dark:text-orange-400 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              disabled={!isTomorrowInCurrentWeek}
              onClick={() => handleSetQuickDate(1)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                !isTomorrowInCurrentWeek
                  ? 'opacity-40 cursor-not-allowed text-stone-400 dark:text-stone-600'
                  : isTomorrow
                    ? 'bg-white dark:bg-stone-900 text-orange-700 dark:text-orange-400 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
              title={!isTomorrowInCurrentWeek ? 'Tomorrow is in next week' : 'Select Tomorrow'}
            >
              Tomorrow
            </button>
          </div>

          {/* Date Picker Button (Toggles calendar beside Dinner card) */}
          <button
            type="button"
            onClick={() => setShowCalendar(prev => !prev)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              showCalendar
                ? 'bg-orange-50 dark:bg-orange-950/60 border-orange-500 text-orange-700 dark:text-orange-300 ring-2 ring-orange-500/20 shadow-xs'
                : 'bg-stone-50 dark:bg-stone-800 border-stone-300 dark:border-stone-700 hover:border-orange-400 text-stone-800 dark:text-stone-200 hover:bg-white dark:hover:bg-stone-800'
            }`}
            title="Toggle Current Week Calendar"
          >
            <CalendarIcon className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
            <span>{format(new Date(date + 'T00:00:00'), 'EEE, MMM d')}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 dark:text-orange-300 bg-orange-100/90 dark:bg-orange-950 px-1.5 py-0.5 rounded-md">
              Week
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-stone-500 dark:text-stone-400 transition-transform duration-200 ${showCalendar ? 'rotate-180 text-orange-600 dark:text-orange-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Menu Cards and Calendar Section */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Loading mess menu schedule...</p>
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-6 mb-8 items-start">
          {/* Menu Cards (Breakfast, Lunch, Dinner) */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 w-full ${showCalendar ? 'flex-1' : ''}`}>
            {mealConfigs.map((config) => {
              const menuForMeal = menus.find(m => m.mealType === config.type);
              const Icon = config.icon;

              return (
                <div
                  key={config.type}
                  className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm hover:shadow-md border border-stone-200/80 dark:border-stone-800 overflow-hidden flex flex-col transition-all duration-200 group"
                >
                  {/* Meal Header */}
                  <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-gradient-to-br from-stone-50/60 to-white dark:from-stone-800/60 dark:to-stone-900">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-11 h-11 rounded-2xl ${config.accentBg} dark:bg-stone-800 ${config.borderAccent} dark:border-stone-700 border flex items-center justify-center text-orange-600 dark:text-orange-400 shadow-2xs group-hover:scale-105 transition-transform`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-lg text-stone-900 dark:text-stone-100">
                          {config.title}
                        </h3>
                        <span className="text-xs text-stone-400 dark:text-stone-500 font-medium">
                          {config.tag}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* EXACT Timing Badge Banner */}
                  <div className="px-6 py-2.5 bg-amber-50/70 dark:bg-amber-950/40 border-b border-amber-100/70 dark:border-amber-900/50 flex items-center gap-2 text-xs font-semibold text-amber-950 dark:text-amber-200">
                    <Clock className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                    <span>Serving Hours:</span>
                    <span className="font-mono text-stone-900 dark:text-stone-100 font-bold">{config.timing}</span>
                  </div>

                  {/* Items List */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    {menuForMeal && menuForMeal.items.length > 0 ? (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                            Included Dishes ({menuForMeal.items.length})
                          </span>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full font-medium border border-emerald-200/50 dark:border-emerald-800/50">
                            100% Vegetarian
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {menuForMeal.items.map((item, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-stone-50 dark:bg-stone-800 hover:bg-orange-50 dark:hover:bg-orange-950/50 border border-stone-200/80 dark:border-stone-700 hover:border-orange-200 text-stone-800 dark:text-stone-200 transition-colors shadow-2xs"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-stone-400 dark:text-stone-500 text-sm">
                        <p>Menu not published yet for this meal.</p>
                        <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Please check back closer to meal timings.</p>
                      </div>
                    )}

                    <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                      <span className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Fresh Daily
                      </span>
                      <span className="font-medium text-stone-400 dark:text-stone-500">Unlimited Servings</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current Week Calendar - Opens BESIDE the Dinner card */}
          {showCalendar && (
            <div className="w-full xl:w-80 shrink-0 bg-white dark:bg-stone-900 rounded-3xl border border-orange-200/90 dark:border-orange-800/80 shadow-md p-5 transition-all animate-fadeIn">
              {/* Calendar Header */}
              <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shadow-xs">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <span>{format(today, 'MMMM yyyy')}</span>
                    </h3>
                    <span className="text-[10px] font-semibold text-orange-700 dark:text-orange-400 bg-orange-100/80 dark:bg-orange-950/80 px-2 py-0.5 rounded-full inline-block mt-0.5">
                      Current Week Only
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCalendar(false)}
                  className="p-1.5 text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
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

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectDate(dayItem)}
                        className={`h-8 flex flex-col items-center justify-center text-xs font-semibold rounded-lg transition-all relative cursor-pointer ${
                          isSelected
                            ? 'bg-orange-600 text-white shadow-xs ring-2 ring-orange-500/40 font-bold'
                            : 'text-stone-800 dark:text-stone-200 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-900 dark:hover:text-orange-300'
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
              <div className="space-y-1.5 pt-3 border-t border-stone-100 dark:border-stone-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block mb-2">
                  Select Day This Week
                </span>
                {currentWeekDays.map((dayItem) => {
                  const dayStr = format(dayItem, 'yyyy-MM-dd');
                  const isSelected = dayStr === date;
                  const isTodayItem = format(dayItem, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

                  return (
                    <button
                      key={dayStr}
                      type="button"
                      onClick={() => handleSelectDate(dayItem)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold shadow-xs'
                          : 'bg-stone-50 dark:bg-stone-800/80 hover:bg-orange-50 dark:hover:bg-orange-950/40 border border-stone-200/80 dark:border-stone-700 hover:border-orange-300 dark:hover:border-orange-700 text-stone-800 dark:text-stone-200 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold uppercase ${isSelected ? 'text-amber-100' : 'text-stone-500 dark:text-stone-400'}`}>
                          {format(dayItem, 'EEE')}
                        </span>
                        <span>{format(dayItem, 'MMM d')}</span>
                      </div>
                      {isTodayItem && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60'
                        }`}>
                          Today
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Calendar Footer Notice */}
              <div className="mt-3.5 pt-2.5 border-t border-stone-100 dark:border-stone-800 flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
                <Lock className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                <span>Restricted to current week schedule</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Positive Encouraging Message Card at Bottom */}
      <div className="bg-gradient-to-r from-amber-50 dark:from-stone-900 via-orange-50/60 dark:via-stone-900 to-cream-100 dark:to-stone-900 border border-amber-200/80 dark:border-stone-800 rounded-3xl p-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-100/90 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0 shadow-2xs">
            <Leaf className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h4 className="font-display font-bold text-base text-stone-900 dark:text-stone-100">
              Eat well. Stay healthy. Make the most of your day! 🌱
            </h4>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-0.5">
              Balanced nutrition fuels academic success. Drink plenty of water and don't skip breakfast!
            </p>
          </div>
        </div>
        <div className="shrink-0 text-xs font-semibold text-amber-900 dark:text-amber-200 bg-amber-200/50 dark:bg-amber-950/60 px-3.5 py-2 rounded-xl border border-amber-300/40 dark:border-amber-800/60">
          Student Wellness Care
        </div>
      </div>
    </Layout>
  );
};

export default StudentMenu;
