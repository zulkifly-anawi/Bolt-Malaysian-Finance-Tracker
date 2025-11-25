import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Wallet,
  Target,
  TrendingUp,
  Trophy,
  Settings,
  FileText,
  LogOut,
  Menu,
  X,
  Home,
  Shield,
  Users
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onPageChange: (page: string) => void;
  onExitAdmin: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'accounts', label: 'Account Config', icon: Wallet },
  { id: 'goals', label: 'Goal Config', icon: Target },
  { id: 'investments', label: 'Investment Rates', icon: TrendingUp },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
  { id: 'system', label: 'System Rules', icon: Settings },
  { id: 'audit', label: 'Audit Log', icon: FileText },
  { id: 'adminEmails', label: 'Admin Emails', icon: Shield },
];

export const AdminLayout = ({ children, currentPage = 'dashboard', onPageChange, onExitAdmin }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleNavigation = (pageId: string) => {
    onPageChange(pageId);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="flex h-screen overflow-hidden">
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed md:relative z-30 flex h-full w-64 flex-col bg-slate-900/50 backdrop-blur-xl border-r border-white/10 transition-transform duration-300 ease-in-out md:translate-x-0`}
        >
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Admin Panel</h1>
                <p className="text-xs text-white/60">Configuration</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 shadow-lg'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10 space-y-2">
            <button
              onClick={onExitAdmin}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-all"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Main App</span>
            </button>
            <button
              onClick={onExitAdmin}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Exit Admin</span>
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-slate-900/30 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden text-white/80 hover:text-white"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-lg font-bold text-white capitalize">
                  {navItems.find(item => item.id === currentPage)?.label || 'Admin Panel'}
                </h2>
                <p className="text-xs text-white/60">Manage system configuration</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-white/60">Full Access</p>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
