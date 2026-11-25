import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types/database';
import { AppHeader } from './AppHeader';

interface ProtectedRouteProps {
  allowedRole: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRole }) => {
  const { user, profile, loading, isRecoveryMode } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen quizizz-bg flex flex-col items-center justify-center gap-3 p-4">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
        <p className="text-sm font-bold text-purple-100">Cargando tu sesión...</p>
      </div>
    );
  }

  if (isRecoveryMode) {
    return <Navigate to="/reset-password" replace />;
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  if (profile.role !== allowedRole) {
    return <Navigate to={profile.role === 'admin' ? '/admin' : '/'} replace />;
  }

  const isAdminRoute = allowedRole === 'admin';

  return (
    <div
      className={`min-h-screen flex flex-col overflow-x-hidden ${
        isAdminRoute ? 'admin-bg text-slate-900' : 'quizizz-bg text-white'
      }`}
    >
      <AppHeader />
      <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
};
