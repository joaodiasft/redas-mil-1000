import React, { useState } from 'react';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const ProfNotas: React.FC = () => {
  const [classId, setClassId] = useState('r1');
  const [theme, setTheme] = useState('Os desafios do SUS');
  const [alunoSelecionado, setAlunoSelecionado] = useState('1');

  // Controle das notas de C1 a C5
  const [notas, setNotas] = useState({
    c1: 160, c2: 200, c3: 160, c4: 200, c5: 120
  });
  const [feedback, setFeedback] = useState('Boa estrutura argumentativa, mas o detalhamento da proposta de intervenção pode melhorar.');

  const total = notas.c1 + notas.c2 + notas.c3 + notas.c4 + notas.c5;

  const handleNotaChange = (comp: keyof typeof notas, val: string) => {
    let num = parseInt(val) || 0;
    if (num > 200) num = 200; // Bloqueio visual
    setNotas({ ...notas, [comp]: num });
  };

  const handleSave = () => {
    // API: POST /api/essays
    alert(`Nota Salva! \nTotal Frontend: ${total} \nSerá re-calculado no backend (Zero Trust). \nFeedback guardado.`);
  };

  return (
    <DashboardLayout activeLabel="Lançar Notas" role="PROFESSOR">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Lançamento de Redações</h2>
          <p className="text-sm text-slate-500 mt-1">Preencha as competências e escreva o feedback qualitativo.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Seletor Lateral */}
          <div className="lg:col-span-1 space-y-4">
            <Card padding="md">
              <div className="space-y-4">
                <div>
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
                <Input label="Tema da Redação" value={theme} onChange={e => setTheme(e.target.value)} />
                
                <hr className="border-slate-100" />
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Selecionar Aluno</label>
                  <select 
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    value={alunoSelecionado}
                    onChange={e => setAlunoSelecionado(e.target.value)}
                  >
                    <option value="1">Ana Paula Souza</option>
                    <option value="2">Carlos Eduardo</option>
                    <option value="3">Mariana Ferreira</option>
                  </select>
                </div>
              </div>
            </Card>
          </div>

          {/* Painel Central de Lançamento */}
          <div className="lg:col-span-2">
            <Card>
              <div className="mb-6 flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Nota Total</p>
                  <p className="text-3xl font-mono font-bold text-pink-600">{total}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">Validado e calculado</p>
                  <p className="text-xs text-slate-400">Regra Zero Trust Ativa</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {(['c1', 'c2', 'c3', 'c4', 'c5'] as const).map((c) => (
                  <div key={c}>
                    <Input 
                      label={c.toUpperCase()} 
                      type="number" 
                      max="200"
                      step="40"
                      value={notas[c]} 
                      onChange={e => handleNotaChange(c, e.target.value)} 
                    />
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Feedback Qualitativo</label>
                <textarea 
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 h-32 resize-none"
                  placeholder="Escreva os pontos fortes e o que o aluno precisa melhorar..."
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="ghost">Limpar</Button>
                <Button onClick={handleSave}>Salvar e Próximo Aluno</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
