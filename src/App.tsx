import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { isSupabaseConfigured } from './lib/supabase';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { ConfigMissingView } from './components/layout/ConfigMissingView';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AuthPage } from './pages/AuthPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { StudentHomePage } from './pages/student/StudentHomePage';
import { Unit1HubPage } from './pages/student/Unit1HubPage';
import { PracticaPage } from './pages/student/PracticaPage';
import { TeoriaPage } from './pages/student/TeoriaPage';
import { ValoracionPage } from './pages/student/ValoracionPage';
import { ProduccionPage } from './pages/student/ProduccionPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

export const App: React.FC = () => {
  if (!isSupabaseConfigured) {
    return <ConfigMissingView />;
  }

  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Rutas para estudiantes */}
            <Route element={<ProtectedRoute allowedRole="student" />}>
              <Route path="/" element={<StudentHomePage />} />
              <Route path="/unit/1" element={<Unit1HubPage />} />
              <Route path="/unit/1/practica" element={<PracticaPage />} />
              <Route path="/unit/1/teoria" element={<TeoriaPage />} />
              <Route path="/unit/1/produccion" element={<ProduccionPage />} />
              <Route path="/unit/1/valoracion" element={<ValoracionPage />} />
            </Route>

            {/* Rutas para el profesor (Admin) */}
            <Route element={<ProtectedRoute allowedRole="admin" />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
