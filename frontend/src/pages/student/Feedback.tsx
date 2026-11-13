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
  MessageSquare,
  CheckCircle2,
  Sparkles,
  Send,
  ThumbsUp,
  Clock
} from 'lucide-react';

const StudentFeedback = () => {
  const [mealType, setMealType] = useState<'BREAKFAST' | 'LUNCH' | 'DINNER'>('LUNCH');
  const [rating, setRating] = useState(4);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const MOCK_HISTORY = [
    { id: 'mock-1', date: new Date().toISOString(), mealType: 'BREAKFAST', rating: 4, comment: 'Poha and chai were very fresh today!' },
    { id: 'mock-2', date: new Date(Date.now() - 86400000).toISOString(), mealType: 'DINNER', rating: 5, comment: 'Paneer butter masala and gulab jamun were outstanding.' },
    { id: 'mock-3', date: new Date(Date.now() - 86400000 * 2).toISOString(), mealType: 'LUNCH', rating: 4, comment: 'Good quality dal and hot rotis.' }
  ];

  const [history, setHistory] = useState<any[]>(MOCK_HISTORY);
  const [apiError, setApiError] = useState('');

  const fetchFeedback = async () => {
    try {
      const res = await api.get('/feedback');
      const dbRecords: any[] = Array.isArray(res.data?.records) ? res.data.records
        : Array.isArray(res.data) ? res.data : [];
      // Merge: DB records on top, mock records below (deduplicate by id)
      const dbIds = new Set(dbRecords.map((r: any) => r.id));
      const uniqueMocks = MOCK_HISTORY.filter(m => !dbIds.has(m.id));
      setHistory([...dbRecords, ...uniqueMocks]);
    } catch (err) {
      // Keep mock data on network error
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleQuickComment = (text: string) => {
    setComment(text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    setApiError('');
    setIsSubmitting(true);

    try {
      await api.post('/feedback', { mealType, rating, comment });
      await fetchFeedback();
      setSuccess(true);
      setComment('');
      setRating(5);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setApiError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const mealOptions = [
    { type: 'BREAKFAST' as const, label: 'Breakfast', timing: '7:30 – 9:00 AM', icon: Coffee },
    { type: 'LUNCH' as const, label: 'Lunch', timing: '1:00 – 2:00 PM', icon: Sun },
    { type: 'DINNER' as const, label: 'Dinner', timing: '7:30 – 9:30 PM', icon: Moon },
  ];

  const quickComments = [
    'Delicious food today! 😋',
    'Properly cooked and hot 🔥',
    'Good hygiene in dining hall ✨',
    'Need more spice / seasoning 🧂'
  ];

  const avgRating = history.length > 0
    ? (history.reduce((acc, h) => acc + (h.rating || 0), 0) / history.length).toFixed(1)
    : '4.5';

  return (
    <Layout title="Food Feedback & Ratings">
      {apiError && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300 text-sm rounded-2xl flex items-center justify-between gap-3">
          <span>{apiError}</span>
          <button onClick={() => setApiError('')} className="text-red-500 hover:text-red-700 dark:hover:text-red-300 font-bold text-lg leading-none cursor-pointer">×</button>
        </div>
      )}
      {/* Top Notice */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent p-5 rounded-3xl border border-amber-200/70 dark:border-amber-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Star className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h2 className="text-base font-display font-bold text-stone-900 dark:text-stone-100">
              Student Voice Matters
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
              Ratings are reviewed daily by mess managers to adjust menus and hold cooks accountable.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-stone-900 px-4 py-2 rounded-2xl border border-stone-200 dark:border-stone-800 shrink-0">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 block">Your Average</span>
            <span className="text-sm font-bold text-stone-900 dark:text-stone-100 font-display">{avgRating} / 5.0</span>
          </div>
          <div className="flex text-amber-400">
            <Star className="w-4 h-4 fill-amber-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Submit Feedback Form Card */}
        <div className="lg:col-span-5">
          <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-200/80 dark:border-stone-800 p-6 sm:p-7 sticky top-28">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-display font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span>Submit Meal Rating</span>
              </h3>
              <span className="text-xs font-semibold text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 px-2.5 py-0.5 rounded-full border border-orange-200/60 dark:border-orange-800/60">
                Today's Review
              </span>
            </div>

            {success && (
              <div className="mb-5 p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm rounded-2xl flex items-center gap-2.5 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Thank you! Your feedback has been sent to the mess supervisor.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Segmented Meal Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2">
                  Select Meal
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {mealOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = mealType === opt.type;
                    return (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => setMealType(opt.type)}
                        className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-orange-50/90 dark:bg-orange-950/60 border-orange-500 text-orange-900 dark:text-orange-200 ring-2 ring-orange-500/20 shadow-xs'
                            : 'bg-stone-50/60 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100/70 dark:hover:bg-stone-700'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-orange-600 dark:text-orange-400' : 'text-stone-400 dark:text-stone-500'}`} />
                        <span className="text-xs font-bold leading-tight block">{opt.label}</span>
                        <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono leading-none block">
                          {opt.timing.split('–')[0].trim()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interactive 1-5 Star Rating */}
              <div className="bg-stone-50/70 dark:bg-stone-800/70 p-4 rounded-2xl border border-stone-200/70 dark:border-stone-700">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2">
                  Food Quality Rating
                </label>
                <div className="flex items-center justify-between">
                  <RatingStars
                    rating={rating}
                    onChange={setRating}
                    readOnly={false}
                    size="lg"
                    showLabel={true}
                  />
                </div>
                <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-2">
                  Click on any star to adjust your score (1 to 5 stars).
                </p>
              </div>

              {/* Comment Textarea */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Your Review / Suggestions
                  </label>
                  <span className="text-[11px] text-stone-400 dark:text-stone-500 font-medium">Optional</span>
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full p-3.5 rounded-2xl border border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm resize-none bg-stone-50/50 dark:bg-stone-800 hover:bg-white dark:hover:bg-stone-800 focus:bg-white dark:focus:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 transition-all"
                  placeholder="What was good? What can be improved regarding taste, temperature or quantity?"
                />

                {/* Quick comment chips */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {quickComments.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickComment(chip)}
                      className="text-[11px] bg-stone-100 dark:bg-stone-800 hover:bg-orange-50 dark:hover:bg-orange-950/60 hover:text-orange-800 dark:hover:text-orange-300 text-stone-600 dark:text-stone-300 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 transition-colors cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className="w-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold py-3.5 px-4 rounded-2xl shadow-sm shadow-orange-600/25 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Submitting Review...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Meal Feedback</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Feedback History Cards */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span>My Feedback History</span>
            </h3>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              {history.length} Reviews submitted
            </span>
          </div>

          <div className="space-y-4">
            {history.map((record, idx) => {
              const mealTypeNormalized = (record.mealType || 'LUNCH').toUpperCase();
              return (
                <div
                  key={record.id || idx}
                  className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 border border-stone-200/80 dark:border-stone-800 shadow-xs hover:shadow-sm transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                      <span className="font-display font-bold text-stone-900 dark:text-stone-100 capitalize text-base">
                        {mealTypeNormalized.toLowerCase()}
                      </span>
                      <span className="text-xs text-stone-400 dark:text-stone-500 font-mono">
                        • {format(new Date(record.date), 'MMM dd, yyyy')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 bg-amber-50/80 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/60 px-3 py-1 rounded-xl w-fit">
                      <RatingStars rating={record.rating} size="sm" />
                      <span className="text-xs font-bold text-amber-900 dark:text-amber-200 font-mono">
                        {record.rating}.0
                      </span>
                    </div>
                  </div>

                  <p className="mt-3.5 text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-normal bg-stone-50/50 dark:bg-stone-800/50 p-3 rounded-2xl border border-stone-100 dark:border-stone-800">
                    "{record.comment || 'Food was satisfactory.'}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentFeedback;
