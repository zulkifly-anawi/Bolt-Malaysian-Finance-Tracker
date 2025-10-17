import { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { AccountConfigPage } from './pages/AccountConfigPage';
import { GoalConfigPage } from './pages/GoalConfigPage';
import { DashboardOverview } from './pages/DashboardOverview';
import { useAdminAuth } from '../../hooks/useConfig';

type AdminPage = 'dashboard' | 'accounts' | 'goals' | 'investments' | 'achievements' | 'system' | 'audit';

interface AdminDashboardProps {
  onExitAdmin: () => void;
}

export const AdminDashboard = ({ onExitAdmin }: AdminDashboardProps) => {
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');
  const { isAdmin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="glass-strong rounded-3xl p-8 glow">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
        <div className="glass-strong rounded-3xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🚫</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-white/70 mb-6">
            This admin panel is restricted to authorized administrators only.
          </p>
          <button
            onClick={onExitAdmin}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:scale-105 transition-all"
          >
            Return to Main App
          </button>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'accounts':
        return <AccountConfigPage />;
      case 'goals':
        return <GoalConfigPage />;
      case 'dashboard':
      default:
        return <DashboardOverview onNavigate={(page) => setCurrentPage(page as AdminPage)} />;
    }
  };

  return (
    <AdminLayout
      currentPage={currentPage}
      onPageChange={(page) => setCurrentPage(page as AdminPage)}
      onExitAdmin={onExitAdmin}
    >
      {renderPage()}
    </AdminLayout>
  );
};
