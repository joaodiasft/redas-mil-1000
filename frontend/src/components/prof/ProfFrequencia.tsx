import React, { useState } from 'react';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface FrequenciaRecord {
  enrollmentId: string;
  name: string;
  status: string;
  notes: string;
}

export const ProfFrequencia: React.FC = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [classId, setClassId] = useState('r1');

  // Mock list of students
  const [records, setRecords] = useState<FrequenciaRecord[]>([
    { enrollmentId: '1', name: 'Ana Paula Souza', status: 'Presente', notes: '' },
    { enrollmentId: '2', name: 'Carlos Eduardo', status: 'Falta', notes: '' },
    { enrollmentId: '3', name: 'Mariana Ferreira', status: 'Reposição Agendada', notes: '10/06/2026' },
  ]);

  const handleStatusChange = (enrollmentId: string, status: string) => {
    setRecords(records.map(r => r.enrollmentId === enrollmentId ? { ...r, status } : r));
  };

  const handleNotesChange = (enrollmentId: string, notes: string) => {
    setRecords(records.map(r => r.enrollmentId === enrollmentId ? { ...r, notes } : r));
  };

  const handleSave = async () => {
    // API Call to /api/attendances/batch
    alert(`Salvando chamada para turma ${classId} na data ${date}:\n` + JSON.stringify(records, null, 2));
  };

  return (
    <DashboardLayout activeLabel="Diário de Frequência" role="PROFESSOR">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Diário de Frequência</h2>
          <p className="text-sm text-slate-500 mt-1">Realize a chamada e controle reposições dos alunos.</p>
        </div>

        <Card>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Turma</label>
              <select 
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                value={classId}
                onChange={e => setClassId(e.target.value)}
              >
                <option value="r1">R1 (Segundas)</option>
                <option value="ex1">EX1 (Sábados)</option>
              </select>
            </div>
            <div className="flex-1">
              <Input 
                label="Data da Aula" 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
              />
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
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-3">Observações / Data Reposição</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {records.map(record => (
                  <tr key={record.enrollmentId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 text-sm">{record.name}</td>
                    <td className="px-4 py-3">
                      <select 
                        className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors
                          ${record.status === 'Presente' ? 'bg-green-50 border-green-200 text-green-700' : 
                            record.status === 'Falta' ? 'bg-red-50 border-red-200 text-red-700' :
                            record.status === 'Justificou' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                            'bg-blue-50 border-blue-200 text-blue-700'}`}
                        value={record.status}
                        onChange={e => handleStatusChange(record.enrollmentId, e.target.value)}
                      >
                        <option value="Presente">Presente</option>
                        <option value="Falta">Falta</option>
                        <option value="Justificou">Justificou</option>
                        <option value="Reposição Agendada">Reposição Agendada</option>
                        <option value="Reposição Feita Nesta Aula">Reposição Feita Nesta Aula</option>
                        <option value="Reposição Feita">Reposição Feita (Outro dia)</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {record.status === 'Reposição Agendada' ? (
                        <input 
                          type="date"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                          value={record.notes}
                          onChange={e => handleNotesChange(record.enrollmentId, e.target.value)}
                          placeholder="Data da reposição"
                        />
                      ) : (
                        <input 
                          type="text"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                          value={record.notes}
                          onChange={e => handleNotesChange(record.enrollmentId, e.target.value)}
                          placeholder="Notas opcionais..."
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
