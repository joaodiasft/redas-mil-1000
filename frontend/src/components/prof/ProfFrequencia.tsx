import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { ApiError, apiFetch } from '../../lib/api';

interface FrequenciaRecord {
  enrollmentId: string;
  name: string;
  status: string;
  notes: string;
}

interface EnrollmentRow {
  id: string;
  user: { id: string; name: string | null; email: string };
}

interface AttendanceApi {
  enrollmentId: string;
  status: string;
  replacementDate: string | null;
}

interface ClassOpt {
  id: string;
  name: string;
}

const ENUM_TO_LABEL: Record<string, string> = {
  PRESENTE: 'Presente',
  FALTA: 'Falta',
  JUSTIFICOU: 'Justificou',
  REPOSICAO_AGENDADA: 'Reposição Agendada',
  REPOSICAO_NESTA_AULA: 'Reposição Feita Nesta Aula',
  REPOSICAO_FEITA: 'Reposição Feita',
};

function isoDateOnly(iso: string | null | undefined): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

function isTodayYMD(ymd: string): boolean {
  const parts = ymd.trim().slice(0, 10).split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return false;
  const [yy, mm, dd] = parts;
  const t = new Date();
  return t.getFullYear() === yy && t.getMonth() + 1 === mm && t.getDate() === dd;
}

export const ProfFrequencia: React.FC = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [classes, setClasses] = useState<ClassOpt[]>([]);
  const [classId, setClassId] = useState('');
  const [records, setRecords] = useState<FrequenciaRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<ClassOpt[]>('classes')
      .then((c) => {
        setClasses(c);
        if (!classId && c[0]) setClassId(c[0].id);
      })
      .catch(() => setError('Erro ao carregar turmas.'));
  }, []);

  useEffect(() => {
    if (!classId || !date) return;
    let cancelled = false;
    setError(null);

    Promise.all([
      apiFetch<EnrollmentRow[]>(`enrollments/class/${classId}`),
      apiFetch<AttendanceApi[]>(
        `attendances?classId=${encodeURIComponent(classId)}&date=${encodeURIComponent(date)}`,
      ),
    ])
      .then(([enrollments, attendances]) => {
        if (cancelled) return;
        const map = new Map(attendances.map((a) => [a.enrollmentId, a]));
        const next = enrollments.map((e) => {
          const att = map.get(e.id);
          const label = att?.status ? ENUM_TO_LABEL[att.status] || 'Presente' : 'Presente';
          const notes =
            att?.replacementDate && att.status === 'REPOSICAO_AGENDADA'
              ? isoDateOnly(att.replacementDate)
              : '';
          return {
            enrollmentId: e.id,
            name: e.user.name || e.user.email,
            status: label,
            notes,
          };
        });
        setRecords(next);
      })
      .catch(() => {
        if (!cancelled) setError('Sem permissão ou erro ao carregar frequência.');
      });

    return () => {
      cancelled = true;
    };
  }, [classId, date]);

  const handleStatusChange = (enrollmentId: string, status: string) => {
    setRecords(records.map((r) => (r.enrollmentId === enrollmentId ? { ...r, status } : r)));
  };

  const handleNotesChange = (enrollmentId: string, notes: string) => {
    setRecords(records.map((r) => (r.enrollmentId === enrollmentId ? { ...r, notes } : r)));
  };

  const handleSave = async () => {
    setError(null);
    try {
      await apiFetch('attendances/batch', {
        method: 'POST',
        body: JSON.stringify({ date, records }),
      });
      alert('Diário salvo.');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Erro ao salvar.');
    }
  };

  return (
    <DashboardLayout activeLabel="Diário de Frequência" role="PROFESSOR">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Diário de Frequência</h2>
          <p className="text-sm text-slate-500 mt-1">Reposição agendada para hoje aparece em destaque.</p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        )}

        <Card>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
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
            <div className="flex-1">
              <Input label="Data da Aula" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSave}>Salvar Diário</Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-3">Aluno</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-3">
                    Data reposição / observações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {records.map((record) => (
                  <tr key={record.enrollmentId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 text-sm">
                      <span className="inline-flex items-center gap-2 flex-wrap">
                        {record.name}
                        {record.status === 'Reposição Agendada' && record.notes && isTodayYMD(record.notes) && (
                          <Badge variant="warning" dot>
                            Reposição hoje
                          </Badge>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors
                          ${record.status === 'Presente' ? 'bg-green-50 border-green-200 text-green-700' : ''}
                          ${record.status === 'Falta' ? 'bg-red-50 border-red-200 text-red-700' : ''}
                          ${record.status === 'Justificou' ? 'bg-orange-50 border-orange-200 text-orange-700' : ''}
                          ${record.status !== 'Presente' && record.status !== 'Falta' && record.status !== 'Justificou' ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}
                        value={record.status}
                        onChange={(e) => handleStatusChange(record.enrollmentId, e.target.value)}
                      >
                        <option value="Presente">Presente</option>
                        <option value="Falta">Falta</option>
                        <option value="Justificou">Justificou</option>
                        <option value="Reposição Agendada">Reposição Agendada</option>
                        <option value="Reposição Feita Nesta Aula">Reposição Feita Nesta Aula</option>
                        <option value="Reposição Feita">Reposição Feita</option>
                        <option value="Reposição Feita (Outro dia)">Reposição Feita (Outro dia)</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {record.status === 'Reposição Agendada' ? (
                        <input
                          type="date"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                          value={record.notes}
                          onChange={(e) => handleNotesChange(record.enrollmentId, e.target.value)}
                        />
                      ) : (
                        <input
                          type="text"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                          value={record.notes}
                          onChange={(e) => handleNotesChange(record.enrollmentId, e.target.value)}
                          placeholder="Opcional"
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};
