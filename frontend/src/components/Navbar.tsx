import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu as MenuIcon, ChevronDown, LogOut, Sun, Moon, Sparkles, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface NavbarProps {
  title: string;
  onOpenMobileMenu?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ title, onOpenMobileMenu }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const isStudent = user?.role === 'STUDENT';

  return (
    <header className="h-20 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800/80 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 transition-colors duration-200">
      {/* Left title & mobile trigger */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="Open menu"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            {title}
          </h1>
          <p className="text-xs text-stone-400 dark:text-stone-500 hidden sm:block">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
      </div>

      {/* Right profile & actions */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Semester plan status pill (for students) */}
        {isStudent && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Meal Plan Active</span>
          </div>
        )}

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2.5 rounded-2xl border border-stone-200/80 dark:border-stone-700/80 bg-stone-50/70 dark:bg-stone-800/70 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-orange-600 dark:hover:text-orange-400 transition-all focus:outline-none focus:ring-2 focus:ring-orange-400/30 shadow-2xs cursor-pointer flex items-center justify-center group"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Light/Dark Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-stone-600 group-hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* Profile Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 p-1.5 sm:px-3 sm:py-2 rounded-2xl border border-stone-200/80 dark:border-stone-700/80 hover:border-orange-300 dark:hover:border-orange-500 bg-stone-50/50 dark:bg-stone-800/50 hover:bg-white dark:hover:bg-stone-800 transition-all text-left group cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-400/30"
          >
            {/* Avatar Circle */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 flex items-center justify-center text-white font-display font-bold text-base shadow-sm ring-2 ring-orange-200 dark:ring-orange-950 group-hover:scale-105 transition-transform">
              {initial}
            </div>

            {/* Name & Role Text */}
            <div className="hidden sm:block text-left pr-1">
              <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 leading-tight flex items-center gap-1">
                <span>{user?.name || 'User'}</span>
              </div>
              <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400 flex items-center gap-1 mt-0.5">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${isStudent ? 'bg-orange-500' : 'bg-blue-600'}`} />
                <span>{isStudent ? 'Student' : 'Admin'}</span>
                {user?.rollNumber && <span className="text-stone-400 dark:text-stone-500">• {user.rollNumber}</span>}
              </div>
            </div>

            <ChevronDown className={`w-4 h-4 text-stone-400 dark:text-stone-500 group-hover:text-stone-700 dark:group-hover:text-stone-300 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Clean Profile Dropdown Card */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-stone-900 rounded-2xl shadow-xl shadow-stone-200/70 dark:shadow-black/70 border border-stone-200/90 dark:border-stone-800 py-2 z-50 animate-fadeIn">
              {/* Dropdown Header */}
              <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800 bg-gradient-to-br from-amber-50/50 to-stone-50 dark:from-stone-800/80 dark:to-stone-900 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 flex items-center justify-center text-white font-display font-bold text-lg shadow-sm">
                    {initial}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">{user?.name}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-100/70 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border border-orange-200/50 dark:border-orange-800/50">
                      {isStudent ? 'Student Account' : 'Administrator'}
                    </span>
                  </div>
                </div>

                {user?.rollNumber && (
                  <div className="mt-3 pt-2 border-t border-stone-200/50 dark:border-stone-800/80 flex justify-between items-center text-xs text-stone-600 dark:text-stone-400">
                    <span className="text-stone-400 dark:text-stone-500">Roll No:</span>
                    <span className="font-mono font-medium text-stone-800 dark:text-stone-200">{user.rollNumber}</span>
                  </div>
                )}
              </div>

              {/* Account Quick Details & Theme Toggle */}
              <div className="px-3 py-2 space-y-1">
                <div className="px-3 py-2 text-xs text-stone-600 dark:text-stone-300 rounded-xl bg-stone-50 dark:bg-stone-800/60 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Mess Status:
                  </span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                  </span>
                </div>

                <div className="px-3 py-2 text-xs text-stone-600 dark:text-stone-300 rounded-xl bg-stone-50 dark:bg-stone-800/60 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
                    {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-stone-500" />}
                    Theme Mode:
                  </span>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="font-semibold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    {theme === 'dark' ? 'Dark 🌙' : 'Light ☀️'}
                  </button>
                </div>
              </div>

              {/* Logout Action */}
              <div className="px-2 pt-1 border-t border-stone-100 dark:border-stone-800">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-300 transition-colors group cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500 group-hover:translate-x-0.5 transition-transform" />
                  <span>Logout from SmartMess</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
