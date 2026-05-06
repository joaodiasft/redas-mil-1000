import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      setError('E-mail ou senha incorretos. Verifique seus dados e tente novamente.');
      setLoading(false);
      return;
    }

    try {
      const profile = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      }).then((r) => r.json());

      if (profile?.error) {
        setError(typeof profile.error === 'string' ? profile.error : 'Não foi possível carregar seu perfil.');
        setLoading(false);
        return;
      }

      if (profile.role === 'ADMIN') navigate('/admin', { replace: true });
      else if (profile.role === 'PROFESSOR') navigate('/prof/frequencia', { replace: true });
      else navigate('/meu-espaco', { replace: true });
    } catch {
      setError('Erro ao conectar à API. Tente novamente.');
    }
    setLoading(false);
  };

  const EyeIcon = (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="text-slate-400 hover:text-slate-600 transition-colors"
      tabIndex={-1}
    >
      {showPassword ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="min-h-screen flex">
      {/* Painel Esquerdo — Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-pink-600 via-pink-700 to-pink-900 relative overflow-hidden">
        {/* Decorative Orbs */}
        <div className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 rounded-full bg-pink-400/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/5 blur-3xl" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Redação Nota Mil</span>
          </div>
        </div>

        {/* Central Content */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              Sua jornada rumo<br />à nota máxima<br />começa aqui.
            </h1>
            <p className="text-pink-100 text-lg leading-relaxed max-w-sm">
              Plataforma completa de gestão educacional para alunos, professores e secretaria.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 pt-4">
            {[
              { label: 'Alunos Ativos', value: '500+' },
              { label: 'Redações', value: '12K+' },
              { label: 'Média da Turma', value: '960' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-3 text-center"
              >
                <p className="text-white font-bold text-xl font-mono">{stat.value}</p>
                <p className="text-pink-200 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-pink-200 text-sm">
            © {new Date().getFullYear()} Redação Nota Mil. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Painel Direito — Login */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-slate-50">
        <div className="w-full max-w-md animate-[slideUp_0.5s_ease-out]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-pink-600 rounded-2xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-slate-900 text-lg">Redação Nota Mil</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Bem-vindo de volta 👋
            </h2>
            <p className="text-slate-500 mt-2 text-sm">
              Entre com suas credenciais para acessar a plataforma.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            {error && (
              <Alert variant="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Input
              id="login-email"
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />

            <Input
              id="login-password"
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
              rightIcon={EyeIcon}
            />

            <div className="flex items-center justify-end">
              <button
                type="button"
                className="text-sm text-pink-600 hover:text-pink-700 font-medium transition-colors"
              >
                Esqueci minha senha
              </button>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                loading={loading}
                fullWidth
                size="lg"
              >
                {loading ? 'Entrando...' : 'Entrar na Plataforma'}
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-center text-xs text-slate-400">
              Acesso restrito a alunos, professores e secretaria matriculados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
