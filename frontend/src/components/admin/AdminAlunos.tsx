import React, { useState } from 'react';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const AdminAlunos: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', classId: 'r1', baseValue: '400', discountPercent: '0'
  });

  // Lista Mockada para interface (API seria conectada via useEffect)
  const students = [
    { id: '1', name: 'Ana Paula Souza', email: 'ana@email.com', turmas: ['R2'], status: 'Ativo' },
    { id: '2', name: 'Carlos Eduardo', email: 'carlos@email.com', turmas: ['EX1'], status: 'Ativo' },
    { id: '3', name: 'Lucas Oliveira', email: 'lucas@email.com', turmas: ['R1', 'R2'], status: 'Inativo' },
  ];

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    // Chamada para POST /api/enrollments
    alert(`Enviando para backend: ${JSON.stringify(formData, null, 2)}`);
    setShowModal(false);
  };

  return (
    <DashboardLayout activeLabel="Alunos">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Gestão de Alunos</h2>
            <p className="text-sm text-slate-500 mt-1">Gerencie matrículas, turmas e bolsas.</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nova Matrícula
          </Button>
        </div>

        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase px-6 py-4">Aluno</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-4">Contato</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-4">Turmas</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-4">Status</th>
                  <th className="px-4 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900">{s.name}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500">{s.email}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1.5">
                        {s.turmas.map(t => <Badge key={t} variant="brand">{t}</Badge>)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={s.status === 'Ativo' ? 'success' : 'default'} dot>
                        {s.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button className="text-slate-400 hover:text-pink-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modal de Matrícula (Glassmorphism) */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 animate-[slideUp_0.3s_ease-out]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Nova Matrícula</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleEnroll} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Input label="Nome Completo" placeholder="Ex: João da Silva" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="col-span-2">
                    <Input label="E-mail" type="email" placeholder="joao@email.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Turma</label>
                    <select 
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      value={formData.classId}
                      onChange={e => setFormData({ ...formData, classId: e.target.value })}
                    >
                      <option value="r1">R1 (Segundas)</option>
                      <option value="ex1">EX1 (Sábados)</option>
                    </select>
                  </div>

                  <div>
                    <Input label="Valor Base (R$)" type="number" value={formData.baseValue} onChange={e => setFormData({ ...formData, baseValue: e.target.value })} required />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Bolsa / Desconto</label>
                    <div className="flex gap-3">
                      {['0', '50', '100'].map(pct => (
                        <label key={pct} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${formData.discountPercent === pct ? 'border-pink-600 bg-pink-50 text-pink-700 font-semibold' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                          <input type="radio" name="discount" value={pct} className="hidden" checked={formData.discountPercent === pct} onChange={() => setFormData({ ...formData, discountPercent: pct })} />
                          {pct}%
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {formData.discountPercent === '100' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-3 text-sm text-amber-800 mt-2">
                    <svg className="w-5 h-5 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    <span>Aviso: O aluno possui bolsa integral de 100%. Lembre-se de informá-lo sobre as regras de frequência obrigatória.</span>
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="ghost" fullWidth onClick={() => setShowModal(false)}>Cancelar</Button>
                  <Button type="submit" fullWidth>Confirmar Matrícula</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
