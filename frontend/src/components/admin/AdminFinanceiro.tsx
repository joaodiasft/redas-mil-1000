import React, { useState } from 'react';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const AdminFinanceiro: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [formData, setFormData] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'PIX',
    generateNext: true
  });

  // Lista Mockada para interface (API seria conectada via GET /api/finance)
  const invoices = [
    { id: '1', aluno: 'Carlos Eduardo', dueDate: '05/06/2026', value: '400.00', status: 'OVERDUE' },
    { id: '2', aluno: 'Ana Paula Souza', dueDate: '10/06/2026', value: '400.00', status: 'PENDING' },
    { id: '3', aluno: 'Mariana Ferreira', dueDate: '01/06/2026', value: '0.00', status: 'PAID', method: 'Bolsa 100%' },
  ];

  const handleOpenModal = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    // Chamada para PUT /api/finance/:id/pay
    alert(`Baixa confirmada para Fatura ${selectedInvoice.id}!\nDados: ${JSON.stringify(formData, null, 2)}`);
    setShowModal(false);
    setSelectedInvoice(null);
  };

  return (
    <DashboardLayout activeLabel="Financeiro">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Gestão Financeira</h2>
          <p className="text-sm text-slate-500 mt-1">Acompanhe vencimentos e realize a baixa manual de mensalidades.</p>
        </div>

        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase px-6 py-4">Vencimento</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-4">Aluno</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-4">Valor (R$)</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-4">Status</th>
                  <th className="px-4 py-4">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">{inv.dueDate}</td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-slate-900">{inv.aluno}</p>
                    </td>
                    <td className="px-4 py-4 text-sm font-mono text-slate-800">{inv.value}</td>
                    <td className="px-4 py-4">
                      <Badge 
                        variant={inv.status === 'PAID' ? 'success' : inv.status === 'OVERDUE' ? 'error' : 'warning'} 
                        dot
                      >
                        {inv.status === 'PAID' ? 'Pago' : inv.status === 'OVERDUE' ? 'Atrasado' : 'Pendente'}
                      </Badge>
                      {inv.method && <p className="text-xs text-slate-400 mt-1">{inv.method}</p>}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {inv.status !== 'PAID' && (
                        <Button size="sm" onClick={() => handleOpenModal(inv)}>Dar Baixa</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modal de Pagamento (Dar Baixa) */}
        {showModal && selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 animate-[slideUp_0.3s_ease-out]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Confirmar Pagamento</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-100">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Aluno</p>
                <p className="font-semibold text-slate-900 mb-2">{selectedInvoice.aluno}</p>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-sm text-slate-600">Valor a pagar:</span>
                  <span className="font-mono font-bold text-lg text-pink-600">R$ {selectedInvoice.value}</span>
                </div>
              </div>

              <form onSubmit={handlePay} className="space-y-4">
                <Input 
                  label="Data do Pagamento" 
                  type="date" 
                  value={formData.paymentDate}
                  onChange={e => setFormData({ ...formData, paymentDate: e.target.value })}
                  required 
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Método de Pagamento</label>
                  <select 
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    value={formData.paymentMethod}
                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                  >
                    <option value="PIX">PIX</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Transferência">Transferência Bancária</option>
                  </select>
                </div>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors mt-2">
                  <input 
                    type="checkbox" 
                    className="mt-0.5 w-4 h-4 text-pink-600 rounded border-slate-300 focus:ring-pink-500"
                    checked={formData.generateNext}
                    onChange={e => setFormData({ ...formData, generateNext: e.target.checked })}
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Gerar próxima fatura</p>
                    <p className="text-xs text-slate-500">Cria um novo boleto automaticamente para o próximo mês.</p>
                  </div>
                </label>

                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="ghost" fullWidth onClick={() => setShowModal(false)}>Cancelar</Button>
                  <Button type="submit" fullWidth>Confirmar Baixa</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
