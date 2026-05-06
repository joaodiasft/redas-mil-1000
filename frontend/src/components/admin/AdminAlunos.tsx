import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ApiError, apiFetch } from '../../lib/api';

interface ClassOpt {
  id: string;
  name: string;
  schedule: string | null;
}

interface EnrollmentInc {
  class: { name: string };
}

interface StudentRow {
  id: string;
  name: string | null;
  email: string;
  enrollments: EnrollmentInc[];
}

export const AdminAlunos: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [classes, setClasses] = useState<ClassOpt[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    classId: '',
    baseValue: '400',
    discountPercent: '0',
  });

  const load = () => {
    Promise.all([apiFetch<StudentRow[]>('students'), apiFetch<ClassOpt[]>('classes')])
      .then(([s, c]) => {
        setStudents(s);
        setClasses(c);
        setFormData((prev) => ({
          ...prev,
          classId: prev.classId || (c[0]?.id ?? ''),
        }));
        setListError(null);
      })
      .catch((e) =>
        setListError(e instanceof ApiError ? e.message : 'Erro ao carregar dados.'),
      );
  };

  useEffect(() => {
    load();
  }, []);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      const created = await apiFetch<{ id: string }>('admin/students', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
          name: formData.name.trim(),
        }),
      });

      await apiFetch('enrollments', {
        method: 'POST',
        body: JSON.stringify({
          userId: created.id,
          classId: formData.classId,
          baseValue: Number(formData.baseValue),
          discountPercent: Number(formData.discountPercent),
        }),
      });

      setShowModal(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        classId: classes[0]?.id ?? '',
        baseValue: '400',
        discountPercent: '0',
      });
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Falha ao matricular.');
    }
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

        {listError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {listError}
          </div>
        )}

        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase px-6 py-4">Aluno</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-4">Contato</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-4">Turmas</th>
                  <th className="px-4 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900">{s.name || '—'}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500">{s.email}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {s.enrollments?.length ? (
                          s.enrollments.map((en) => (
                            <Badge key={en.class.name} variant="brand">
                              {en.class.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">Sem turma</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-xs text-slate-400 font-mono">{s.id.slice(0, 8)}…</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 animate-[slideUp_0.3s_ease-out]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Nova Matrícula</h3>
                <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {formError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  {formError}
                </div>
              )}

              <form onSubmit={handleEnroll} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Input
                      label="Nome Completo"
                      placeholder="Ex: João da Silva"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      label="E-mail"
                      type="email"
                      placeholder="joao@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      label="Senha inicial do Portal"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Turma</label>
                    <select
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      value={formData.classId}
                      onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                      required
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                          {c.schedule ? ` — ${c.schedule}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Input
                      label="Valor Base (R$)"
                      type="number"
                      value={formData.baseValue}
                      onChange={(e) => setFormData({ ...formData, baseValue: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Bolsa / Desconto</label>
                    <div className="flex gap-3">
                      {['0', '50', '100'].map((pct) => (
                        <label
                          key={pct}
                          className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${formData.discountPercent === pct ? 'border-pink-600 bg-pink-50 text-pink-700 font-semibold' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                        >
                          <input
                            type="radio"
                            name="discount"
                            value={pct}
                            className="hidden"
                            checked={formData.discountPercent === pct}
                            onChange={() => setFormData({ ...formData, discountPercent: pct })}
                          />
                          {pct}%
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {formData.discountPercent === '100' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-3 text-sm text-amber-800 mt-2">
                    <svg className="w-5 h-5 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Bolsa integral: informe o aluno sobre frequência obrigatória.</span>
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="ghost" fullWidth onClick={() => setShowModal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" fullWidth>
                    Confirmar Matrícula
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
