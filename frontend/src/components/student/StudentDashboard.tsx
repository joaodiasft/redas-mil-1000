import React, { useState } from 'react';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const StudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'geral' | 'redacoes' | 'financeiro'>('geral');

  // Mock data for the student
  const studentInfo = {
    name: 'João Aluno',
    class: 'R2',
    schedule: 'Quinta | 19:00 às 21:00',
    module: 'Módulo 2: Argumentação'
  };

  const essays = [
    { id: 1, theme: 'Inteligência Artificial no Brasil', noteSofia: 880, noteProf: 920, status: 'Corrigida' },
    { id: 2, theme: 'Impactos da Pandemia na Educação', noteSofia: 760, noteProf: null, status: 'Em correção' },
  ];

  const finances = [
    { id: 1, month: 'Maio/2026', value: 350.00, dueDate: '10/05/2026', status: 'Pago' },
    { id: 2, month: 'Junho/2026', value: 350.00, dueDate: '10/06/2026', status: 'Pendente' },
  ];

  return (
    <DashboardLayout activeLabel="Meu Espaço" role="ALUNO">
      <div className="space-y-6">
        {/* Boas vindas */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Olá, {studentInfo.name}! 👋</h1>
            <p className="text-slate-500 text-sm">Seja bem-vindo ao seu espaço de aprendizado.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="brand">Turma {studentInfo.class}</Badge>
            <Badge variant="default">{studentInfo.schedule}</Badge>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 gap-6">
          <button 
            onClick={() => setActiveTab('geral')}
            className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === 'geral' ? 'text-pink-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Visão Geral
            {activeTab === 'geral' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600 rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('redacoes')}
            className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === 'redacoes' ? 'text-pink-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Minhas Redações
            {activeTab === 'redacoes' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600 rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('financeiro')}
            className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === 'financeiro' ? 'text-pink-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Financeiro
            {activeTab === 'financeiro' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600 rounded-full" />}
          </button>
        </div>

        {/* Content based on Tab */}
        {activeTab === 'geral' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <h2 className="text-sm font-bold text-slate-800 mb-4">Meu Curso</h2>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{studentInfo.module}</h3>
                  <p className="text-sm text-slate-500 mt-1">Sua próxima aula é quinta-feira às 19h. Prepare seu material!</p>
                  <div className="mt-4 flex gap-2">
                    <Button variant="secondary" size="sm">Cronograma</Button>
                    <Button variant="secondary" size="sm">Material Didático</Button>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-sm font-bold text-slate-800 mb-4">Acesso Rápido</h2>
              <div className="space-y-3">
                <a href="#" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-pink-50 transition-colors group">
                  <span className="text-sm font-medium text-slate-700 group-hover:text-pink-600">Grupo WhatsApp</span>
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
                <a href="#" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-pink-50 transition-colors group">
                  <span className="text-sm font-medium text-slate-700 group-hover:text-pink-600">Plataforma Sofia</span>
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              </div>
            </Card>

            <Card className="md:col-span-3">
               <h2 className="text-sm font-bold text-slate-800 mb-4">Última Redação</h2>
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800">{essays[0].theme}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="text-sm">
                        <span className="text-slate-500">Nota Sofia:</span> 
                        <span className="ml-1 font-bold text-slate-700">{essays[0].noteSofia}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-500">Nota Professor:</span> 
                        <span className="ml-1 font-bold text-pink-600">{essays[0].noteProf}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm">Ver Feedback</Button>
                    <Button variant="primary" size="sm">Ver Redação</Button>
                  </div>
               </div>
            </Card>
          </div>
        )}

        {activeTab === 'redacoes' && (
          <Card padding="none">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800">Painel de Redações</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Tema</th>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-4 text-center">Nota Sofia</th>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-4 text-center">Nota Prof.</th>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-4">Status</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {essays.map((essay) => (
                    <tr key={essay.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800">{essay.theme}</p>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm font-mono font-bold text-slate-600">{essay.noteSofia}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm font-mono font-bold text-pink-600">{essay.noteProf || '-'}</span>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={essay.status === 'Corrigida' ? 'success' : 'warning'} dot>
                          {essay.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="secondary" size="sm">Detalhes</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'financeiro' && (
          <Card padding="none">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800">Minhas Mensalidades</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Mês Referência</th>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-4">Vencimento</th>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-4">Valor</th>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-4">Status</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {finances.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800">{f.month}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">{f.dueDate}</td>
                      <td className="px-4 py-4 text-sm font-mono font-bold text-slate-800">R$ {f.value.toFixed(2)}</td>
                      <td className="px-4 py-4">
                        <Badge variant={f.status === 'Pago' ? 'success' : 'warning'} dot>
                          {f.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="secondary" size="sm">Boleto / Pix</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Solicitações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                 <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-800">Troca de Turma</h3>
                <p className="text-xs text-slate-500">Solicite a alteração do seu horário.</p>
              </div>
              <Button variant="secondary" size="sm">Solicitar</Button>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                 <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-800">Rematrícula</h3>
                <p className="text-xs text-slate-500">Garanta sua vaga para o próximo módulo.</p>
              </div>
              <Button variant="secondary" size="sm">Renovar</Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
