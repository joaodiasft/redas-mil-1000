import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ApiError, apiFetch } from '../../lib/api';

interface ClassOpt {
  id: string;
  name: string;
}

interface EnrollmentRow {
  id: string;
  user: { id: string; name: string | null; email: string };
}

export const ProfNotas: React.FC = () => {
  const [classes, setClasses] = useState<ClassOpt[]>([]);
  const [classId, setClassId] = useState('');
  const [theme, setTheme] = useState('Os desafios do SUS');
  const [rows, setRows] = useState<EnrollmentRow[]>([]);
  const [studentUserId, setStudentUserId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [notas, setNotas] = useState({
    c1: 160,
    c2: 200,
    c3: 160,
    c4: 200,
    c5: 120,
  });
  const [feedback, setFeedback] = useState(
    'Boa estrutura argumentativa; refine a proposta de intervenção.',
  );

  const total = notas.c1 + notas.c2 + notas.c3 + notas.c4 + notas.c5;

  useEffect(() => {
    apiFetch<ClassOpt[]>('classes')
      .then((c) => {
        setClasses(c);
        if (!classId && c[0]) setClassId(c[0].id);
      })
      .catch(() => setError('Não foi possível carregar turmas.'));
  }, []);

  useEffect(() => {
    if (!classId) return;
    apiFetch<EnrollmentRow[]>(`enrollments/class/${classId}`)
      .then((list) => {
        setRows(list);
        setStudentUserId((prev) => {
          if (prev && list.some((r) => r.user.id === prev)) return prev;
          return list[0]?.user.id ?? '';
        });
      })
      .catch(() => setError('Sem permissão ou erro ao carregar alunos da turma.'));
  }, [classId]);

  const handleNotaChange = (comp: keyof typeof notas, val: string) => {
    let num = parseInt(val, 10) || 0;
    if (num > 200) num = 200;
    setNotas({ ...notas, [comp]: num });
  };

  const handleSave = async () => {
    if (!classId || !studentUserId) return;
    setError(null);
    try {
      await apiFetch('essays', {
        method: 'POST',
        body: JSON.stringify({
          userId: studentUserId,
          classId,
          theme,
          c1: notas.c1,
          c2: notas.c2,
          c3: notas.c3,
          c4: notas.c4,
          c5: notas.c5,
          feedback,
        }),
      });
      alert('Nota salva. Total foi calculado no servidor (Zero Trust).');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Erro ao salvar.');
    }
  };

  return (
    <DashboardLayout activeLabel="Lançar Notas" role="PROFESSOR">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Lançamento de Redações</h2>
          <p className="text-sm text-slate-500 mt-1">
            Notas C1–C5 e total são validadas no backend (máx. 1000).
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card padding="md">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Turma</label>
                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    aria-label="Turma"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Input label="Tema da Redação" value={theme} onChange={(e) => setTheme(e.target.value)} />

                <hr className="border-slate-100" />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Aluno</label>
                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    value={studentUserId}
                    onChange={(e) => setStudentUserId(e.target.value)}
                    aria-label="Aluno"
                  >
                    {rows.map((r) => (
                      <option key={r.id} value={r.user.id}>
                        {r.user.name || r.user.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <div className="mb-6 flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Nota Total (referência)</p>
                  <p className="text-3xl font-mono font-bold text-pink-600">{Math.min(total, 1000)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">Valor oficial no servidor</p>
                  <p className="text-xs text-slate-400">Zero Trust ativo</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {(['c1', 'c2', 'c3', 'c4', 'c5'] as const).map((c) => (
                  <div key={c}>
                    <Input
                      label={c.toUpperCase()}
                      type="number"
                      max={200}
                      value={notas[c]}
                      onChange={(e) => handleNotaChange(c, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Feedback Qualitativo</label>
                <textarea
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 h-32 resize-none"
                  placeholder="Pontos fortes e melhorias..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button onClick={handleSave}>Salvar nota</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
