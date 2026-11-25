import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail } from '../lib/authHelpers';
import { ClothingSvg } from '../components/illustrations/ClothingSvg';

type AuthMode = 'login' | 'register' | 'forgot';

export const AuthPage: React.FC = () => {
  const {
    user,
    profile,
    loading: authLoading,
    isRecoveryMode,
    signIn,
    signUp,
    requestPasswordReset,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  if (!authLoading && isRecoveryMode) {
    return <Navigate to="/reset-password" replace />;
  }

  if (!authLoading && user && profile) {
    return <Navigate to={profile.role === 'admin' ? '/admin' : '/'} replace />;
  }

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError(null);
    setInfoMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }

    if (mode === 'forgot') {
      setSubmitting(true);
      const res = await requestPasswordReset(email);
      setSubmitting(false);
      if (res.error) {
        setError(res.error);
      } else if (res.info) {
        setInfoMessage(res.info);
      }
      return;
    }

    if (mode === 'register') {
      if (fullName.trim().length < 3) {
        setError('Escribe tu nombre completo (mínimo 3 caracteres).');
        return;
      }
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        return;
      }

      setSubmitting(true);
      const res = await signUp(fullName, email, password);
      setSubmitting(false);
      if (res.error) {
        setError(res.error);
      } else if (res.info) {
        setInfoMessage(res.info);
      }
      return;
    }

    // Login
    if (!password) {
      setError('Ingresa tu contraseña.');
      return;
    }

    setSubmitting(true);
    const res = await signIn(email, password);
    setSubmitting(false);
    if (res.error) {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen quizizz-bg flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-purple-400/25 shadow-2xl overflow-hidden bg-[#24143D]">
        {/* Panel visual izquierdo */}
        <div className="lg:col-span-5 bg-gradient-to-br from-fuchsia-600 via-purple-700 to-indigo-800 text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/25 border border-white/15 text-xs font-extrabold tracking-wide mb-5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>1.º de Secundaria • Versión Beta</span>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                English Class Students
              </h1>
            </div>

            <p className="text-purple-100 text-sm leading-relaxed mt-3">
              Supera misiones paso a paso, aprende vocabulario visual, comparte fotos en el muro de
              la clase y demuestra lo que sabes en los retos cronometrados.
            </p>
          </div>

          {/* Vitrina SVG */}
          <div className="relative z-10 mt-8 bg-black/25 backdrop-blur-xs rounded-2xl p-4 border border-white/15">
            <div className="flex items-center justify-around gap-2">
              <div className="bg-white rounded-2xl p-2 shadow-md animate-float-subtle">
                <ClothingSvg garment="tshirt" color="#EF4444" className="w-14 h-14" />
              </div>
              <div className="bg-white rounded-2xl p-2 shadow-md">
                <ClothingSvg garment="jeans" color="#2563EB" className="w-14 h-14" />
              </div>
              <div className="bg-white rounded-2xl p-2 shadow-md animate-float-subtle">
                <ClothingSvg garment="sneakers" color="#EC4899" className="w-14 h-14" />
              </div>
            </div>
            <p className="text-center text-xs font-extrabold text-amber-300 tracking-wide mt-3">
              UNIT 1: Clothes and Colors
            </p>
          </div>
        </div>

        {/* Formulario derecho */}
        <div className="lg:col-span-7 p-6 sm:p-9 flex flex-col justify-center bg-[#24143D]">
          {mode !== 'forgot' ? (
            <div className="flex p-1.5 bg-[#160C28] border border-purple-400/20 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white shadow-sm'
                    : 'text-purple-200/75 hover:text-white'
                }`}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white shadow-sm'
                    : 'text-purple-200/75 hover:text-white'
                }`}
              >
                Crear cuenta
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-cyan-200 mb-5 self-start cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a iniciar sesión</span>
            </button>
          )}

          <div className="mb-5">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {mode === 'login'
                ? '¡Qué bueno verte de nuevo!'
                : mode === 'register'
                  ? 'Crea tu cuenta de estudiante'
                  : 'Recuperar contraseña'}
            </h2>
            <p className="text-sm text-purple-200/80 mt-1">
              {mode === 'login'
                ? 'Ingresa con tu correo electrónico y contraseña.'
                : mode === 'register'
                  ? 'Usa un correo electrónico real para poder recuperar tu cuenta si olvidas tu clave.'
                  : 'Escribe tu correo electrónico y te enviaremos un enlace para crear una nueva contraseña.'}
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-400/40 text-rose-200 text-sm animate-pop">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {infoMessage && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 text-sm animate-pop">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
              <span>{infoMessage}</span>
            </div>
          )}

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-xs font-bold uppercase tracking-wide text-purple-200 mb-1.5"
                >
                  Nombre completo
                </label>
                <div className="relative">
                  <UserPlus className="w-4 h-4 text-purple-300/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej. Mateo Pérez"
                    autoComplete="name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-purple-400/30 bg-[#160C28] focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 outline-none text-sm font-medium text-white placeholder:text-purple-300/40 transition-all"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wide text-purple-200 mb-1.5"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-purple-300/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@gmail.com"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-purple-400/30 bg-[#160C28] focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 outline-none text-sm font-medium text-white placeholder:text-purple-300/40 transition-all"
                  required
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="block text-xs font-bold uppercase tracking-wide text-purple-200"
                  >
                    Contraseña
                  </label>

                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-xs font-bold text-cyan-300 hover:text-cyan-200 transition-colors cursor-pointer"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-purple-300/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-purple-400/30 bg-[#160C28] focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 outline-none text-sm font-medium text-white placeholder:text-purple-300/40 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-purple-300/70 hover:text-white cursor-pointer"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-extrabold text-sm sm:text-base border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>
                    {mode === 'login'
                      ? 'Ingresando...'
                      : mode === 'register'
                        ? 'Creando cuenta...'
                        : 'Enviando correo...'}
                  </span>
                </>
              ) : (
                <>
                  {mode === 'forgot' && <KeyRound className="w-5 h-5" />}
                  <span>
                    {mode === 'login'
                      ? 'Ingresar a la clase'
                      : mode === 'register'
                        ? 'Registrarme y empezar'
                        : 'Enviar enlace de recuperación'}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
