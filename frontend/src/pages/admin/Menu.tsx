import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import { api } from '../../lib/axios';
import {
  Plus,
  Edit3,
  Trash2,
  Coffee,
  Sun,
  Moon,
  Clock,
  Calendar,
  UtensilsCrossed,
  Sparkles,
  Check,
  X
} from 'lucide-react';
import { format } from 'date-fns';

const AdminMenu = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealType, setMealType] = useState('BREAKFAST');
  const [items, setItems] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Permanent mock demo menu (always visible, cannot be deleted)
  const MOCK_MENUS = [
    { id: 'mock-1', date: new Date().toISOString().split('T')[0], mealType: 'BREAKFAST', items: ['Crispy Masala Dosa', 'Coconut Chutney', 'Hot Sambar', 'Filter Coffee'] },
    { id: 'mock-2', date: new Date().toISOString().split('T')[0], mealType: 'LUNCH', items: ['Basmati Rice', 'Dal Makhani', 'Paneer Butter Masala', 'Tawa Roti', 'Cucumber Raita'] },
    { id: 'mock-3', date: new Date().toISOString().split('T')[0], mealType: 'DINNER', items: ['Hyderabadi Veg Biryani', 'Mirchi Ka Salan', 'Boondi Raita', 'Gulab Jamun'] },
  ];

  const [menus, setMenus] = useState<any[]>(MOCK_MENUS);

  const fetchMenus = async () => {
    try {
      const res = await api.get('/menu');
      const dbMenus: any[] = Array.isArray(res.data) ? res.data : [];
      // Merge: DB menus on top, mock menus below (deduplicate by id)
      const dbIds = new Set(dbMenus.map((m: any) => m.id));
      const uniqueMocks = MOCK_MENUS.filter(m => !dbIds.has(m.id));
      setMenus([...dbMenus, ...uniqueMocks]);
    } catch (e) {
      // Keep mock data on network error
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setDate(new Date().toISOString().split('T')[0]);
    setMealType('BREAKFAST');
    setItems('');
    setIsModalOpen(true);
  };

  const openEditModal = (menu: any) => {
    setEditingId(menu.id);
    setDate(typeof menu.date === 'string' ? menu.date.split('T')[0] : new Date().toISOString().split('T')[0]);
    setMealType(menu.mealType);
    setItems(Array.isArray(menu.items) ? menu.items.join(', ') : '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const itemArray = items.split(',').map(i => i.trim()).filter(Boolean);
    if (itemArray.length === 0) return;
    setApiError('');
    setLoading(true);

    try {
      if (editingId) {
        // Only allow editing real DB records (not mock)
        if (editingId.startsWith('mock-')) {
          setApiError('Demo menu items cannot be edited. Add a new menu entry instead.');
          setLoading(false);
          return;
        }
        await api.put(`/menu/${editingId}`, { items: itemArray });
      } else {
        await api.post('/menu', { date, mealType, items: itemArray });
      }
      await fetchMenus();
      setIsModalOpen(false);
      setItems('');
      setEditingId(null);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to save menu. Please try again.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id.startsWith('mock-')) {
      setApiError('Demo menu items cannot be deleted.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this menu entry?')) {
      try {
        await api.delete(`/menu/${id}`);
        await fetchMenus();
      } catch (err) {
        setApiError('Failed to delete menu entry. Please try again.');
      }
    }
  };

  const mealConfigs: Record<string, { title: string; timing: string; icon: any; color: string; bg: string }> = {
    BREAKFAST: {
      title: 'Breakfast',
      timing: '7:30 AM – 9:00 AM',
      icon: Coffee,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    LUNCH: {
      title: 'Lunch',
      timing: '1:00 PM – 2:00 PM',
      icon: Sun,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    DINNER: {
      title: 'Dinner',
      timing: '7:30 PM – 9:30 PM',
      icon: Moon,
      color: 'text-rose-600',
      bg: 'bg-rose-50'
    }
  };

  // Group menus by date string
  const groupedMenus = menus.reduce((acc, menu) => {
    let rawDate = format(new Date(), 'yyyy-MM-dd');
    try {
      if (menu.date) {
        rawDate = format(new Date(menu.date), 'yyyy-MM-dd');
      }
    } catch {
      // fallback
    }
    if (!acc[rawDate]) acc[rawDate] = [];
    acc[rawDate].push(menu);
    return acc;
  }, {} as Record<string, typeof menus>);

  const sortedDates = Object.keys(groupedMenus).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <Layout title="Menu Management">
      {apiError && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300 text-sm rounded-2xl flex items-center justify-between gap-3">
          <span>{apiError}</span>
          <button onClick={() => setApiError('')} className="text-red-500 hover:text-red-700 dark:hover:text-red-300 font-bold text-lg leading-none cursor-pointer">×</button>
        </div>
      )}
      {/* Header Banner */}
      <div className="mb-8 bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 text-xs font-semibold mb-2 border border-orange-200/50 dark:border-orange-800/60">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Kitchen Operations</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            Campus Dining Menus
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Plan, publish, and edit daily meal schedules and served dishes.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="shrink-0 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 shadow-sm shadow-orange-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Menu</span>
        </button>
      </div>

      {/* Grouped Menus List */}
      <div className="space-y-8">
        {sortedDates.map((dateStr) => {
          const dayMenus = groupedMenus[dateStr] || [];
          return (
            <div key={dateStr} className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 border border-stone-200/80 dark:border-stone-800 shadow-xs">
              <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-stone-100 dark:border-stone-800">
                <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <h3 className="font-display font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100">
                  {format(new Date(dateStr), 'EEEE, MMMM do, yyyy')}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-7">
                {(['BREAKFAST', 'LUNCH', 'DINNER'] as const).map(type => {
                  const menu = dayMenus.find((m: any) => m.mealType === type);
                  const config = mealConfigs[type];
                  const Icon = config.icon;

                  return (
                    <div
                      key={type}
                      className="bg-stone-50/60 dark:bg-stone-800/50 rounded-2xl border border-stone-200/80 dark:border-stone-700/80 p-6 sm:p-7 relative group hover:border-orange-200 dark:hover:border-orange-500/50 hover:bg-white dark:hover:bg-stone-800 hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[310px]"
                    >
                      {/* Top Header */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${config.bg} dark:bg-stone-700 flex items-center justify-center ${config.color} border border-stone-200/60 dark:border-stone-600 shadow-2xs`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-display font-bold text-stone-900 dark:text-stone-100 text-base">
                                {config.title}
                              </h4>
                              <span className="text-[11px] font-mono text-stone-400 dark:text-stone-500">
                                {type}
                              </span>
                            </div>
                          </div>

                          {/* Hover Edit/Delete Action Icons */}
                          {menu && (
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditModal(menu)}
                                className="p-1.5 text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/70 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors cursor-pointer"
                                title="Edit meal items"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(menu.id)}
                                className="p-1.5 text-rose-700 dark:text-rose-300 bg-rose-100/70 dark:bg-rose-950/70 rounded-lg hover:bg-rose-200 dark:hover:bg-rose-900 transition-colors cursor-pointer"
                                title="Delete meal"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* EXACT Timing Badge */}
                        <div className="mb-5 px-3.5 py-2 rounded-xl bg-amber-50/80 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/60 flex items-center gap-2 text-xs font-semibold text-amber-950 dark:text-amber-200">
                          <Clock className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                          <span>Hours:</span>
                          <span className="font-mono">{config.timing}</span>
                        </div>

                        {/* Food Items */}
                        {menu && menu.items && menu.items.length > 0 ? (
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block mb-1">
                              Dishes ({menu.items.length})
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {menu.items.map((item: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-700 text-stone-800 dark:text-stone-200 rounded-lg font-medium shadow-2xs"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="py-8 text-center text-xs text-stone-400 dark:text-stone-500 italic">
                            No menu configured yet.
                          </div>
                        )}
                      </div>

                      {/* Card Footer */}
                      <div className="mt-6 pt-3.5 border-t border-stone-100 dark:border-stone-750 flex items-center justify-between text-xs text-stone-400 dark:text-stone-500">
                        <span>Central Kitchen</span>
                        {menu ? (
                          <span className="text-emerald-700 dark:text-emerald-300 font-medium bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-800/50 text-[11px]">Active</span>
                        ) : (
                          <button
                            onClick={openCreateModal}
                            className="text-orange-600 dark:text-orange-400 font-semibold hover:underline cursor-pointer"
                          >
                            + Add dishes
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {sortedDates.length === 0 && (
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-12 text-center border border-stone-200/80 dark:border-stone-800">
            <UtensilsCrossed className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
            <h3 className="font-display font-bold text-base text-stone-800 dark:text-stone-200">No Menus Scheduled</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 mb-4">Click "Add New Menu" to publish recipes for upcoming dates.</p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Add First Menu
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Menu Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Update Menu Items" : "Publish Daily Menu"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingId && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                  Meal Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                  Meal Session
                </label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none font-medium cursor-pointer"
                >
                  <option value="BREAKFAST">Breakfast (7:30 AM – 9:00 AM)</option>
                  <option value="LUNCH">Lunch (1:00 PM – 2:00 PM)</option>
                  <option value="DINNER">Dinner (7:30 PM – 9:30 PM)</option>
                </select>
              </div>
            </>
          )}

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Food Items (Comma separated)
              </label>
              <span className="text-[11px] text-stone-400 dark:text-stone-500">e.g. Rice, Dal, Paneer</span>
            </div>
            <textarea
              value={items}
              onChange={(e) => setItems(e.target.value)}
              rows={3}
              className="w-full p-3.5 border border-stone-300 dark:border-stone-700 rounded-xl text-sm resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-stone-50/50 dark:bg-stone-800 hover:bg-white dark:hover:bg-stone-800 focus:bg-white dark:focus:bg-stone-800 transition-all text-stone-900 dark:text-stone-100"
              placeholder="Steamed Rice, Dal Tadka, Aloo Gobhi, Tawa Chapati, Salad"
              required
            />
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2.5 px-4 border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm shadow-orange-600/20 cursor-pointer disabled:opacity-60"
            >
              {loading ? 'Saving...' : editingId ? 'Update Menu' : 'Save & Publish'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default AdminMenu;
