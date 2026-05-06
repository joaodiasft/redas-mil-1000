import React from 'react';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  color?: 'default' | 'brand' | 'success' | 'warning' | 'error';
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, color = 'default', icon }) => {
  const colorMap = {
    default: 'bg-slate-50 text-slate-600',
    brand: 'bg-pink-50 text-pink-600',
    success: 'bg-emerald-50 text-emerald-600',
    warning: 'bg-amber-50 text-amber-600',
    error: 'bg-red-50 text-red-600',
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <p className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className={['w-10 h-10 rounded-2xl flex items-center justify-center shrink-0', colorMap[color]].join(' ')}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

export const AdminDashboard: React.FC = () => {
  const recentStudents = [
    { name: 'Ana Paula Souza', turma: 'R2', status: 'Em dia', bolsa: '0%' },
    { name: 'Carlos Eduardo Lima', turma: 'EX1', status: 'Atrasado', bolsa: '50%' },
    { name: 'Mariana Ferreira', turma: 'R4', status: 'Em dia', bolsa: '100%' },
    { name: 'Lucas Oliveira', turma: 'R1', status: 'Em dia', bolsa: '0%' },
    { name: 'Beatriz Alves', turma: 'R6', status: 'Atrasado', bolsa: '0%' },
  ];

  return (
    <DashboardLayout activeLabel="Dashboard">
      <div className="space-y-6">

        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Alunos Ativos"
            value="48"
            subtitle="2 novos esta semana"
            color="brand"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          />
          <StatCard
            title="Inadimplentes"
            value="7"
            subtitle="Acima de 5 dias"
            color="error"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
          />
          <StatCard
            title="Redações Pendentes"
            value="13"
            subtitle="Aguardando validação"
            color="warning"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
          />
          <StatCard
            title="Caixa Previsto"
            value="R$ 24.8K"
            subtitle="Junho/2026"
            color="success"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </div>

        {/* ── Alunos Recentes + Turmas ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Tabela de Alunos */}
          <Card className="lg:col-span-2" padding="none">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800">Alunos Recentes</h2>
              <button className="text-xs text-pink-600 font-semibold hover:text-pink-700 transition-colors">
                Ver todos →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-3">Nome</th>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-3">Turma</th>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-3">Bolsa</th>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-3 pr-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentStudents.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-3.5 text-sm font-medium text-slate-800">{s.name}</td>
                      <td className="px-3 py-3.5">
                        <Badge variant="brand">{s.turma}</Badge>
                      </td>
                      <td className="px-3 py-3.5 text-sm font-mono text-slate-600">{s.bolsa}</td>
                      <td className="px-3 py-3.5 pr-6">
                        <Badge
                          variant={s.status === 'Em dia' ? 'success' : 'error'}
                          dot
                        >
                          {s.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Turmas Ativas */}
          <Card>
            <h2 className="text-sm font-bold text-slate-800 mb-4">Turmas Ativas</h2>
            <div className="space-y-2.5">
              {[
                { name: 'R1', desc: 'Ter | 19:00–21:00', count: 8 },
                { name: 'R2', desc: 'Qui | 19:00–21:00', count: 9 },
                { name: 'R3', desc: 'Sáb | 08:00–09:30', count: 7 },
                { name: 'R4', desc: 'Sáb | 09:45–11:15', count: 10 },
                { name: 'R5', desc: 'Sáb | 10:30–12:00', count: 6 },
                { name: 'R6', desc: 'Sáb | 15:00–16:30', count: 5 },
                { name: 'EX1', desc: 'Seg | 19:00–22:00', count: 3 },
              ].map((turma) => (
                <div
                  key={turma.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-pink-50 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-pink-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-pink-700">{turma.name}</span>
                    </div>
                    <p className="text-xs text-slate-500">{turma.desc}</p>
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-600 group-hover:text-pink-600 transition-colors">
                    {turma.count} alunos
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
