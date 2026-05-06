import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { ApiError, apiFetch } from '../../lib/api';

interface Profile {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

interface EnrollmentMe {
  id: string;
  classId: string;
  class: { name: string; schedule: string | null };
}

interface EssayMe {
  id: string;
  theme: string;
  total: number;
  feedback: string | null;
  isValidated: boolean;
  createdAt: string;
  class: { name: string };
}

interface FinanceMe {
  id: string;
  value: number;
  dueDate: string;
  status: string;
}

interface AttendanceMe {
  id: string;
  date: string;
  status: string;
  replacementDate: string | null;
  enrollment: { class: { name: string } };
}

const ATT_PT: Record<string, string> = {
  PRESENTE: 'Presente',
  FALTA: 'Falta',
  JUSTIFICOU: 'Justificou',
  REPOSICAO_AGENDADA: 'Reposição agendada',
  REPOSICAO_NESTA_AULA: 'Reposição nesta aula',
  REPOSICAO_FEITA: 'Reposição feita',
};

function financesBlockEssays(rows: FinanceMe[]): boolean {
  const now = Date.now();
  return rows.some((f) => {
    if (f.status === 'OVERDUE') return true;
    if (f.status !== 'PENDING') return false;
    const due = new Date(f.dueDate).getTime();
    return now > due + 5 * 86400000;
  });
}

function financeLabel(rows: FinanceMe[]): 'Em dia' | 'Pendente' | 'Atrasado' {
  const now = Date.now();
  const hasOverdue = rows.some((f) => f.status === 'OVERDUE');
  const hasLatePending = rows.some((f) => {
    if (f.status !== 'PENDING') return false;
    return now > new Date(f.dueDate).getTime() + 5 * 86400000;
  });
  if (hasOverdue || hasLatePending) return 'Atrasado';
  const hasPending = rows.some((f) => f.status === 'PENDING');
  if (hasPending) return 'Pendente';
  return 'Em dia';
}

export const StudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'geral' | 'redacoes' | 'financeiro'>('geral');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentMe[]>([]);
  const [essays, setEssays] = useState<EssayMe[]>([]);
  const [finances, setFinances] = useState<FinanceMe[]>([]);
  const [attendances, setAttendances] = useState<AttendanceMe[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [essaySubmitErr, setEssaySubmitErr] = useState<string | null>(null);

  const [essayClassId, setEssayClassId] = useState('');
  const [essayTheme, setEssayTheme] = useState('');
  const [essayNotas, setEssayNotas] = useState({ c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 });

  const refresh = () => {
    Promise.all([
      apiFetch<Profile>('me'),
      apiFetch<EnrollmentMe[]>('enrollments/me'),
      apiFetch<EssayMe[]>('essays/me'),
      apiFetch<FinanceMe[]>('finance/me'),
      apiFetch<AttendanceMe[]>('attendances/me'),
    ])
      .then(([me, en, es, fi, at]) => {
        setProfile(me);
        setEnrollments(en);
        setEssays(es);
        setFinances(fi);
        setAttendances(at);
        setEssayClassId((prev) => prev || en[0]?.classId || '');
        setLoadError(null);
      })
      .catch((e) =>
        setLoadError(e instanceof ApiError ? e.message : 'Erro ao carregar dados.'),
      );
  };

  useEffect(() => {
    refresh();
  }, []);

  const blocked = financesBlockEssays(finances);
  const finLabel = financeLabel(finances);

  const displayName = profile?.name || profile?.email?.split('@')[0] || 'Aluno';
  const mainEnrollment = enrollments[0];
  const scheduleLine =
    enrollments.map((e) => `${e.class.name}${e.class.schedule ? ` · ${e.class.schedule}` : ''}`).join(' · ') ||
    '—';

  const handleEssaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEssaySubmitErr(null);
    if (!essayClassId || !essayTheme.trim()) {
      setEssaySubmitErr('Selecione a turma e informe o tema.');
      return;
    }
    if (blocked) {
      setEssaySubmitErr('Regularize o financeiro para enviar novas redações.');
      return;
    }
    try {
      await apiFetch('essays', {
        method: 'POST',
        body: JSON.stringify({
          classId: essayClassId,
          theme: essayTheme.trim(),
          c1: essayNotas.c1,
          c2: essayNotas.c2,
          c3: essayNotas.c3,
          c4: essayNotas.c4,
          c5: essayNotas.c5,
        }),
      });
      setEssayTheme('');
      setEssayNotas({ c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 });
      refresh();
    } catch (err) {
      setEssaySubmitErr(err instanceof ApiError ? err.message : 'Erro ao registrar.');
    }
  };

  const lastEssay = essays[0];

  return (
    <DashboardLayout activeLabel="Meu Espaço" role="ALUNO">
      <div className="space-y-6">
        {loadError && (
          <Alert variant="error" onClose={() => setLoadError(null)}>
            {loadError}
          </Alert>
        )}

        {blocked && (
          <Alert variant="error" title="Financeiro em atraso">
            Há mensalidade pendente com mais de 5 dias ou marcada como atrasada. Envio de novas redações está suspenso até a
            regularização (conforme regra da secretaria).
          </Alert>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Olá, {displayName}!</h1>
            <p className="text-slate-500 text-sm">Seu espaço no Redação Nota Mil.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {mainEnrollment && <Badge variant="brand">Turma {mainEnrollment.class.name}</Badge>}
            <Badge variant={finLabel === 'Em dia' ? 'success' : finLabel === 'Pendente' ? 'warning' : 'error'} dot>
              Financeiro: {finLabel}
            </Badge>
          </div>
        </div>

        <div className="flex border-b border-slate-200 gap-6">
          {(['geral', 'redacoes', 'financeiro'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold transition-colors relative capitalize ${activeTab === tab ? 'text-pink-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {tab === 'geral' ? 'Visão Geral' : tab === 'redacoes' ? 'Minhas Redações' : 'Financeiro'}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600 rounded-full" />}
            </button>
          ))}
        </div>

        {activeTab === 'geral' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <h2 className="text-sm font-bold text-slate-800 mb-4">Meus Cursos</h2>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-600">{scheduleLine}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    Frequência recente:{' '}
                    {attendances.slice(0, 5).map((a) => (
                      <span key={a.id} className="inline-block mr-2">
                        {new Date(a.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} —{' '}
                        {ATT_PT[a.status] || a.status}
                      </span>
                    ))}
                    {!attendances.length && 'sem registros ainda.'}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-sm font-bold text-slate-800 mb-4">Acesso Rápido</h2>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase">Coredação</p>
                  <p className="text-sm text-slate-800 mt-1">naredacanota1000@gmail.com</p>
                  <p className="text-xs font-mono text-slate-600 mt-0.5">EUSOU1000</p>
                </div>
                <a
                  href="https://wa.me/"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-pink-50 transition-colors group"
                >
                  <span className="text-sm font-medium text-slate-700 group-hover:text-pink-600">Grupo WhatsApp</span>
                  <span className="text-xs text-slate-400">peça o link na turma</span>
                </a>
                <span className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-slate-500 text-sm">
                  Plataforma Sofia — mesmo login e senha deste portal
                </span>
              </div>
            </Card>

            {lastEssay && (
              <Card className="md:col-span-3">
                <h2 className="text-sm font-bold text-slate-800 mb-4">Última redação</h2>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800">{lastEssay.theme}</h3>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <div className="text-sm">
                        <span className="text-slate-500">Nota Sofia (integração):</span>
                        <span className="ml-1 font-bold text-slate-400">—</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-500">Nota total:</span>
                        <span className="ml-1 font-mono font-bold text-pink-600">{lastEssay.total}</span>
                      </div>
                      <Badge variant={lastEssay.isValidated ? 'success' : 'warning'} dot>
                        {lastEssay.isValidated ? 'Validada' : 'Aguardando validação'}
                      </Badge>
                    </div>
                    {lastEssay.feedback && (
                      <p className="text-sm text-slate-600 mt-3 border-t border-slate-100 pt-3">{lastEssay.feedback}</p>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'redacoes' && (
          <div className="space-y-6">
            {!blocked && enrollments.length > 0 && (
              <Card>
                <h2 className="text-sm font-bold text-slate-800 mb-4">Registrar autoavaliação (C1–C5)</h2>
                {essaySubmitErr && (
                  <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                    {essaySubmitErr}
                  </div>
                )}
                <form onSubmit={handleEssaySubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Turma</label>
                      <select
                        className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm"
                        value={essayClassId}
                        onChange={(e) => setEssayClassId(e.target.value)}
                        required
                        aria-label="Turma para nova redação"
                      >
                        {enrollments.map((en) => (
                          <option key={en.id} value={en.classId}>
                            {en.class.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Input label="Tema" value={essayTheme} onChange={(e) => setEssayTheme(e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {(['c1', 'c2', 'c3', 'c4', 'c5'] as const).map((k) => (
                      <Input
                        key={k}
                        label={k.toUpperCase()}
                        type="number"
                        min={0}
                        max={200}
                        value={essayNotas[k]}
                        onChange={(e) =>
                          setEssayNotas({
                            ...essayNotas,
                            [k]: Math.min(200, Math.max(0, parseInt(e.target.value, 10) || 0)),
                          })
                        }
                      />
                    ))}
                  </div>
                  <Button type="submit" disabled={blocked}>
                    Enviar
                  </Button>
                </form>
              </Card>
            )}

            <Card padding="none">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-800">Painel de Redações</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="text-left text-xs font-semibold text-slate-400 uppercase px-6 py-4">Tema</th>
                      <th className="text-xs font-semibold text-slate-400 uppercase px-4 py-4 text-center">
                        Sofia
                      </th>
                      <th className="text-xs font-semibold text-slate-400 uppercase px-4 py-4 text-center">
                        Total
                      </th>
                      <th className="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {essays.map((essay) => (
                      <tr key={essay.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-800">{essay.theme}</p>
                          <p className="text-xs text-pink-600">{essay.class.name}</p>
                        </td>
                        <td className="px-4 py-4 text-center font-mono text-slate-400">—</td>
                        <td className="px-4 py-4 text-center font-mono font-bold text-pink-600">{essay.total}</td>
                        <td className="px-4 py-4">
                          <Badge variant={essay.isValidated ? 'success' : 'warning'} dot>
                            {essay.isValidated ? 'Validada' : 'Em correção'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!essays.length && (
                  <p className="px-6 py-8 text-center text-sm text-slate-500">Nenhuma redação registrada.</p>
                )}
              </div>
            </Card>
          </div>
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
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase px-6 py-4">Vencimento</th>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-4">Valor</th>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {finances.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(f.dueDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-4 text-sm font-mono font-bold text-slate-800">
                        R$ {f.value.toFixed(2)}
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          variant={
                            f.status === 'PAID' ? 'success' : f.status === 'OVERDUE' ? 'error' : 'warning'
                          }
                          dot
                        >
                          {f.status === 'PAID' ? 'Pago' : f.status === 'OVERDUE' ? 'Atrasado' : 'Pendente'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!finances.length && (
                <p className="px-6 py-8 text-center text-sm text-slate-500">Sem faturas cadastradas.</p>
              )}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-800">Troca de Turma</h3>
                <p className="text-xs text-slate-500">Solicite na secretaria.</p>
              </div>
              <Button variant="secondary" size="sm">
                Solicitar
              </Button>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-800">Rematrícula</h3>
                <p className="text-xs text-slate-500">Garanta sua vaga para o próximo módulo.</p>
              </div>
              <Button variant="secondary" size="sm">
                Renovar
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
