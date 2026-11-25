import React from 'react';
import { Database, FileCode2 } from 'lucide-react';

export const ConfigMissingView: React.FC = () => {
  return (
    <div className="min-h-screen quizizz-bg flex items-center justify-center p-4">
      <div className="max-w-lg w-full quizizz-card rounded-3xl p-6 sm:p-8 text-white">
        <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-400/30 text-fuchsia-300 flex items-center justify-center mb-5">
          <Database className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold mb-2">
          Falta configurar Supabase
        </h1>
        <p className="text-purple-200 text-sm leading-relaxed mb-5">
          La aplicación <strong>English Class Students</strong> necesita tus credenciales de
          Supabase para iniciar sesión, guardar el progreso y mostrar el muro virtual.
        </p>

        <div className="bg-[#160C28] border border-purple-400/20 rounded-2xl p-4 space-y-2 text-sm text-purple-100 mb-5">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <FileCode2 className="w-4 h-4" />
            <span>Pasos rápidos en local:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm text-purple-200">
            <li>
              Copia <code className="bg-purple-900 px-1.5 py-0.5 rounded">.env.example</code> como{' '}
              <code className="bg-purple-900 px-1.5 py-0.5 rounded">.env</code>.
            </li>
            <li>
              Pega tu <code className="bg-purple-900 px-1.5 py-0.5 rounded">VITE_SUPABASE_URL</code>{' '}
              y <code className="bg-purple-900 px-1.5 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code>.
            </li>
            <li>
              Reinicia el servidor con{' '}
              <code className="bg-purple-900 px-1.5 py-0.5 rounded">npm run dev</code>.
            </li>
          </ol>
        </div>

        <p className="text-xs text-purple-300/80">
          Si estás desplegando en Vercel, agrega esas mismas dos variables en{' '}
          <strong>Project Settings → Environment Variables</strong> y vuelve a desplegar.
        </p>
      </div>
    </div>
  );
};
