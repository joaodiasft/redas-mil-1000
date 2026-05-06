import React, { useState } from 'react';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const AdminRedacoes: React.FC = () => {
  // Lista Mockada para interface (API seria conectada via useEffect puxando GET /api/essays)
  const [essays, setEssays] = useState([
    { id: '1', aluno: 'Ana Paula Souza', turma: 'R2', tema: 'Desafios do SUS', total: 960, isValidated: false, data: '05/06/2026' },
    { id: '2', aluno: 'Carlos Eduardo', turma: 'EX1', tema: 'Inteligência Artificial', total: 880, isValidated: true, data: '04/06/2026' },
    { id: '3', aluno: 'Mariana Ferreira', turma: 'R4', tema: 'Desafios do SUS', total: 1000, isValidated: false, data: '05/06/2026' },
  ]);

  const handleValidate = (id: string) => {
    // Chamada para PUT /api/essays/:id/validate
    setEssays(essays.map(e => e.id === id ? { ...e, isValidated: true } : e));
    alert(`Redação validada e bloqueada no backend! ID: ${id}`);
  };

  return (
    <DashboardLayout activeLabel="Redações">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Validação de Redações</h2>
          <p className="text-sm text-slate-500 mt-1">Valide e tranque as notas lançadas para impedir alterações.</p>
        </div>

        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase px-6 py-4">Data</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-4">Aluno</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-4">Tema</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-4">Nota Total</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-4">Status</th>
                  <th className="px-4 py-4">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {essays.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-500">{e.data}</td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-slate-900">{e.aluno}</p>
                      <p className="text-xs text-pink-600 font-medium mt-0.5">{e.turma}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">{e.tema}</td>
                    <td className="px-4 py-4 text-sm font-mono font-bold text-slate-900">{e.total}</td>
                    <td className="px-4 py-4">
                      {e.isValidated ? (
                        <Badge variant="success" dot>Validada</Badge>
                      ) : (
                        <Badge variant="warning" dot>Pendente</Badge>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {!e.isValidated ? (
                        <Button size="sm" onClick={() => handleValidate(e.id)}>
                          Validar
                        </Button>
                      ) : (
                        <span className="text-sm text-slate-400 flex items-center justify-end gap-1 font-medium">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Bloqueado
                        </span>
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
