import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';

export const ResetPasswordPage: React.FC = () => {
  const { user, profile, loading, updatePassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden. Verifica ambos campos.');
      return;
    }

    setSubmitting(true);
    const res = await updatePassword(newPassword);
    setSubmitting(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    setCompleted(true);
    showToast('¡Tu contraseña se actualizó correctamente!', 'success');
    const target = profile?.role === 'admin' ? '/admin' : '/';
    window.setTimeout(() => {
      navigate(target, { replace: true });
    }, 900);
  };

  if (loading) {
    return (
      <div className="min-h-screen quizizz-bg flex flex-col items-center justify-center gap-3 p-4">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
        <p className="text-sm font-bold text-purple-100">Validando enlace de recuperación...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen quizizz-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full quizizz-card rounded-3xl p-6 sm:p-8 text-white animate-pop">
        <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mb-5 shadow-md">
          <KeyRound className="w-6 h-6" />
        </div>

        <h1 className="text-2xl font-extrabold mb-1">Nueva contraseña</h1>
        <p className="text-sm text-purple-200/80 mb-6">
          Ingresa una nueva contraseña segura para tu cuenta de{' '}
          <strong className="text-white">English Class Students</strong>.
        </p>

        {!user ? (
          <div className="space-y-4">
            <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-rose-500/15 border border-rose-400/40 text-rose-200 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
              <span>
                El enlace de recuperación expiró o no es válido. Solicita un nuevo enlace desde la
                pantalla de inicio de sesión.
              </span>
            </div>

            <Link
              to="/auth"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-sm border-b-4 border-fuchsia-800 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ir a iniciar sesión</span>
            </Link>
          </div>
        ) : completed ? (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-100 text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
            <span>Contraseña guardada con éxito. Redirigiendo a la plataforma...</span>
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-400/40 text-rose-200 text-sm animate-pop">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="newPassword"
                className="block text-xs font-bold uppercase tracking-wide text-purple-200 mb-1.5"
              >
                Nueva contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-purple-300/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-purple-400/30 bg-[#160C28] focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 outline-none text-sm font-medium text-white placeholder:text-purple-300/40"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-purple-300/70 hover:text-white cursor-pointer"
                  aria-label={showNew ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-bold uppercase tracking-wide text-purple-200 mb-1.5"
              >
                Confirmar nueva contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-purple-300/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-purple-400/30 bg-[#160C28] focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 outline-none text-sm font-medium text-white placeholder:text-purple-300/40"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-purple-300/70 hover:text-white cursor-pointer"
                  aria-label={showConfirm ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-extrabold text-sm sm:text-base border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Guardando contraseña...</span>
                </>
              ) : (
                <span>Guardar nueva contraseña</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
