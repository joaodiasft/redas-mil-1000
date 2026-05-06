import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Badge } from '../ui/Badge';

interface LayoutProps {
  children: React.ReactNode;
  activeLabel?: string;
  role?: 'ADMIN' | 'PROFESSOR' | 'ALUNO';
  userName?: string;
}

export const DashboardLayout: React.FC<LayoutProps> = ({
  children,
  activeLabel = 'Dashboard',
  role = 'ADMIN',
  userName = 'Usuário',
}) => {
  const navigate = useNavigate();

  const adminMenu = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Alunos', path: '/admin/alunos' },
    { label: 'Turmas', path: '/admin/turmas' },
    { label: 'Redações', path: '/admin/redacoes' },
    { label: 'Financeiro', path: '/admin/financeiro' },
  ];

  const profMenu = [
    { label: 'Diário de Frequência', path: '/prof/frequencia' },
    { label: 'Lançar Notas', path: '/prof/notas' },
  ];

  const studentMenu = [
    { label: 'Meu Espaço', path: '/meu-espaco' },
  ];

  const menuItems = role === 'PROFESSOR' ? profMenu : role === 'ALUNO' ? studentMenu : adminMenu;

  const sectionLabel = role === 'PROFESSOR' ? 'Área do Professor' : role === 'ALUNO' ? 'Meu Espaço' : 'Gestão';

  const roleColors: Record<string, string> = {
    ADMIN: 'brand',
    PROFESSOR: 'info',
    ALUNO: 'success',
  };

  const roleLabels: Record<string, string> = {
    ADMIN: 'Secretaria',
    PROFESSOR: 'Professor',
    ALUNO: 'Aluno',
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-slate-100 shadow-sm shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-slate-100">
          <div className="w-8 h-8 bg-pink-600 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-slate-900 tracking-tight">Redação</p>
            <p className="text-xs text-pink-600 font-semibold">Nota Mil</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2 block">
            {sectionLabel}
          </span>
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = item.label === activeLabel;
              return (
                <li key={item.label}>
                  <Link 
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${isActive 
                      ? 'bg-pink-600 text-white shadow-md shadow-pink-600/20' 
                      : 'text-slate-600 hover:bg-pink-50 hover:text-pink-600'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-pink-700 font-bold text-xs">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">{userName}</p>
              <Badge variant={roleColors[role] as any} dot>
                {roleLabels[role]}
              </Badge>
            </div>
            <button
              onClick={handleLogout}
              title="Sair"
              className="text-slate-400 hover:text-red-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center px-6 gap-4 shrink-0 shadow-sm">
          <h1 className="text-base font-bold text-slate-900">{activeLabel}</h1>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant={roleColors[role] as any} dot>
              {roleLabels[role]}
            </Badge>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 animate-[fadeIn_0.3s_ease-out]">
          {children}
        </main>
      </div>
    </div>
  );
};
