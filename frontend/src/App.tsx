import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { LoginPage } from './components/auth/LoginPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminAlunos } from './components/admin/AdminAlunos';
import { AdminRedacoes } from './components/admin/AdminRedacoes';
import { AdminFinanceiro } from './components/admin/AdminFinanceiro';
import { AdminTurmas } from './components/admin/AdminTurmas';
import { ProfFrequencia } from './components/prof/ProfFrequencia';
import { ProfNotas } from './components/prof/ProfNotas';
import { StudentDashboard } from './components/student/StudentDashboard';

// Rota protegida — redireciona para /login se não autenticado
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    // Carregando estado de auth...
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 bg-pink-600 rounded-2xl flex items-center justify-center animate-pulse">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-sm text-slate-400 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  return session ? <>{children}</> : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Rotas Admin Protegidas */}
        <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/alunos" element={<PrivateRoute><AdminAlunos /></PrivateRoute>} />
        <Route path="/admin/turmas" element={<PrivateRoute><AdminTurmas /></PrivateRoute>} />
        <Route path="/admin/redacoes" element={<PrivateRoute><AdminRedacoes /></PrivateRoute>} />
        <Route path="/admin/financeiro" element={<PrivateRoute><AdminFinanceiro /></PrivateRoute>} />
        
        {/* Rotas Prof Protegidas */}
        <Route path="/prof/frequencia" element={<PrivateRoute><ProfFrequencia /></PrivateRoute>} />
        <Route path="/prof/notas" element={<PrivateRoute><ProfNotas /></PrivateRoute>} />

        {/* Rotas Aluno Protegidas */}
        <Route path="/meu-espaco" element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
        
        {/* Redireciona raiz para o dashboard */}
        <Route path="/" element={<Navigate to="/meu-espaco" replace />} />
        {/* 404 */}
        <Route path="*" element={<Navigate to="/meu-espaco" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
