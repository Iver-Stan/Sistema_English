import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, ShieldCheck, Sparkles, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const AppHeader: React.FC = () => {
  const { profile, signOut } = useAuth();
  const isAdmin = profile?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-[#1B0E33]/95 backdrop-blur-md border-b border-purple-400/20 shadow-md">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-3">
        <Link
          to={isAdmin ? '/admin' : '/'}
          className="flex items-center gap-2.5 group min-w-0"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-indigo-600 border-b-4 border-indigo-900 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-sm sm:text-lg text-white truncate">
                English Class Students
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950">
                Beta
              </span>
            </div>
            <p className="text-[11px] text-purple-200/80 hidden sm:block">
              {isAdmin ? 'Panel del Profesor' : '1.º de Secundaria • Nivel Inicial'}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {profile && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-purple-300/20">
              {isAdmin ? (
                <ShieldCheck className="w-4 h-4 text-amber-300" />
              ) : (
                <User className="w-4 h-4 text-cyan-300" />
              )}
              <span className="text-xs font-semibold text-white max-w-[160px] truncate">
                {profile.full_name}
              </span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-purple-950/80 text-purple-200 border border-purple-400/25">
                {isAdmin ? 'Profesor' : 'Estudiante'}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => void signOut()}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-white/10 hover:bg-rose-500 border border-purple-300/25 hover:border-rose-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="hidden xs:inline sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
};
