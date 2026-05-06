import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ApiError, apiFetch } from '../../lib/api';

interface ClassRow {
  id: string;
  name: string;
  schedule: string | null;
  description: string | null;
  maxStudents: number;
}

export const AdminTurmas: React.FC = () => {
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<ClassRow[]>('classes')
      .then(setClasses)
      .catch((e) =>
        setError(e instanceof ApiError ? e.message : 'Não foi possível carregar as turmas.'),
      );
  }, []);

  return (
    <DashboardLayout activeLabel="Turmas">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Turmas cadastradas</h2>
          <p className="text-sm text-slate-500 mt-1">
            Horários conforme currículo (seed R1–R6 e EX1). Execute{' '}
            <code className="text-xs bg-slate-100 px-1 rounded">npm run db:seed</code> no projeto se a lista estiver vazia.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        )}

        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase px-6 py-4">Turma</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-4">Horário</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-4">Descrição</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-4">Vagas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {classes.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <Badge variant="brand">{c.name}</Badge>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">{c.schedule || '—'}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{c.description || '—'}</td>
                    <td className="px-4 py-4 text-sm font-mono text-slate-800">{c.maxStudents}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {classes.length === 0 && !error && (
            <p className="px-6 py-8 text-center text-sm text-slate-500">Nenhuma turma encontrada.</p>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};
