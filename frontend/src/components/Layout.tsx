import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-stone-100/60 dark:bg-stone-950 font-sans text-stone-900 dark:text-stone-100 flex transition-colors duration-200">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-stone-950/40 dark:bg-black/60 backdrop-blur-xs z-30 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar (Desktop fixed + Mobile drawer) */}
      <Sidebar
        role={user.role}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen w-full overflow-x-hidden">
        <Navbar
          title={title}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex flex-col justify-between">
          <div>
            {children}
          </div>

          {/* Polished Student Panel Footer */}
          {user.role === 'STUDENT' && (
            <footer className="mt-14 pt-6 border-t border-stone-200/80 dark:border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 dark:text-stone-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shrink-0" />
                <span className="font-semibold text-stone-700 dark:text-stone-200">SmartMess Student Portal</span>
                <span className="text-stone-300 dark:text-stone-600 hidden sm:inline">•</span>
                <span>Nourishing campus life with fresh meals everyday! 🌱</span>
              </div>
              <p className="text-stone-400 dark:text-stone-500 text-center sm:text-right">
                Enjoy your meal! Check schedules on time and share your feedback.
              </p>
            </footer>
          )}

          {/* Polished Admin Panel Footer */}
          {user.role === 'ADMIN' && (
            <footer className="mt-14 pt-6 border-t border-stone-200/80 dark:border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 dark:text-stone-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shrink-0" />
                <span className="font-semibold text-stone-700 dark:text-stone-200">SmartMess Admin Workspace</span>
                <span className="text-stone-300 dark:text-stone-600 hidden sm:inline">•</span>
                <span>Nourishing campus life through smart kitchen management & operational care 🍽️</span>
              </div>
              <p className="text-stone-400 dark:text-stone-500 text-center sm:text-right">
                Administered dining operations • Ensuring student nutrition & zero waste.
              </p>
            </footer>
          )}
        </main>
      </div>
    </div>
  );
};

export default Layout;
