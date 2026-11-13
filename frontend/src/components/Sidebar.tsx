import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Star,
  AlertCircle,
  Trash2,
  FileText,
  LogOut,
  Clock,
  Sun,
  Moon,
  X
} from 'lucide-react';

interface SidebarProps {
  role: 'STUDENT' | 'ADMIN';
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, isOpen = false, onClose }) => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: "Today's Menu", path: '/student/menu', icon: UtensilsCrossed },
    { name: 'Attendance', path: '/student/attendance', icon: ClipboardList },
    { name: 'Feedback', path: '/student/feedback', icon: Star },
    { name: 'Complaints', path: '/student/complaints', icon: AlertCircle },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Menu Management', path: '/admin/menu', icon: UtensilsCrossed },
    { name: 'Attendance', path: '/admin/attendance', icon: ClipboardList },
    { name: 'Feedback', path: '/admin/feedback', icon: Star },
    { name: 'Complaints', path: '/admin/complaints', icon: AlertCircle },
    { name: 'Food Wastage', path: '/admin/wastage', icon: Trash2 },
    { name: 'Reports', path: '/admin/reports', icon: FileText },
  ];

  const links = role === 'ADMIN' ? adminLinks : studentLinks;

  return (
    <>
      <aside
        className={`w-64 bg-white dark:bg-stone-900 border-r border-stone-200/80 dark:border-stone-800 flex flex-col h-screen fixed left-0 top-0 z-40 transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-display font-bold text-stone-900 dark:text-stone-100 tracking-tight flex items-center">
                Smart<span className="text-orange-600">Mess</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200/50 dark:border-amber-800/60">
                {role === 'ADMIN' ? 'Admin Portal' : 'Student Panel'}
              </span>
            </div>
          </div>

          {/* Close button for mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-6 flex flex-col gap-1.5 px-3.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Navigation Menu
          </div>

          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-50 to-amber-50/60 dark:from-orange-950/50 dark:to-amber-950/30 text-orange-700 dark:text-orange-400 font-semibold shadow-xs border-r-4 border-orange-600'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-orange-600 dark:text-orange-400' : 'text-stone-400 dark:text-stone-500'}`} />
                    <span>{link.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}

          {/* Small Mess Timings widget for Student */}
          {role === 'STUDENT' && (
            <div className="mt-6 mx-1 p-3.5 rounded-2xl bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-stone-50 dark:from-stone-800/80 dark:via-stone-800/50 dark:to-stone-900 border border-amber-200/60 dark:border-stone-700/80 text-stone-800 dark:text-stone-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-400 mb-2">
                <Clock className="w-3.5 h-3.5 text-orange-600" />
                <span>Mess Timings</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Breakfast:</span>
                  <span className="font-medium text-stone-800 dark:text-stone-200">7:30 – 9:00 AM</span>
                </div>
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Lunch:</span>
                  <span className="font-medium text-stone-800 dark:text-stone-200">1:00 – 2:00 PM</span>
                </div>
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Dinner:</span>
                  <span className="font-medium text-stone-800 dark:text-stone-200">7:30 – 9:30 PM</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Footer / Theme Toggle & Logout */}
        <div className="p-3.5 border-t border-stone-100 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/60 space-y-1.5">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-between px-3.5 py-2 w-full rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <span className="flex items-center gap-2.5">
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-500" />}
              <span>{theme === 'dark' ? 'Light Appearance' : 'Dark Appearance'}</span>
            </span>
            <span className="text-[10px] uppercase font-bold text-orange-600 dark:text-orange-400">
              {theme === 'dark' ? 'Light' : 'Dark'}
            </span>
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-3 px-3.5 py-2 w-full text-left rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-300 border border-transparent hover:border-rose-100 dark:hover:border-rose-900 transition-all duration-150 group"
          >
            <LogOut className="w-4 h-4 text-rose-500 group-hover:translate-x-0.5 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
