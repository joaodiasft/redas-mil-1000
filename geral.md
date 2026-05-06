Documentação Mestre: Plataforma Redação Nota Mil

Contexto para a IA Desenvolvedora: Atue como um Tech Lead Full-Stack e Arquiteto de Software. O objetivo é desenvolver o ERP/LMS educacional "Redação Nota Mil". Leia atentamente todas as seções abaixo antes de gerar os códigos. O sistema possui 3 atores principais: Admin (Secretaria), Professor e Aluno/Responsável.

1. Configurações e Stack Tecnológica

A arquitetura do projeto deve ser moderna, escalável e dividida entre Front-end e Back-end.

Front-end: React.js com TypeScript, empacotado via Vite.

Estilização: Tailwind CSS + Lucide React (para ícones).

Back-end: Node.js com TypeScript (Express ou NestJS).

Banco de Dados: PostgreSQL hospedado no Neon (Serverless).

ORM: Prisma ORM.

BaaS (Autenticação/Storage): Supabase Auth (JWT).

2. Dados Fixos e Estrutura Acadêmica

O sistema deve nascer com estes dados pré-configurados no banco (Seed):

A. Curso de Redação (Professora: Martinha)
Limites: Máximo 30 alunos por turma.

R1: Terça-feira | 18:00 às 19:30

R2: Terça-feira | 19:30 às 21:00

R3: Sábado | 07:30 às 09:00

R4: Sábado | 09:00 às 10:30

R5: Sábado | 10:30 às 12:00

R6: Sábado | 15:00 às 16:30

B. Curso de Exatas
Limites: Máximo 30 alunos por turma.

EX1: Segunda-feira | 19:00 às 22:00

Professores: Bruno (Matemática), Adriano (Física), Marcus (Química).

C. Credenciais de Acesso Externo

Coredação (Uso de todos os alunos): Email: naredacanota1000@gmail.com | Senha: EUSOU1000

Plataforma Sofia (IA): O sistema deve sincronizar. O login e senha da Sofia são idênticos ao login e senha do Portal do Aluno.

3. Banco de Dados e Segurança (Zero Trust)

A segurança é rigorosa. O Front-end nunca é confiável (Proteção anti-F12).

A. Estrutura Base do Banco (Prisma):

Users (Admin, Professores, Alunos).

Classes (Turmas R1 a EX1).

Enrollments (Matrículas conectando Aluno a Turma, com Base Value, % de Bolsa e Final Value).

Attendance (Frequência).

Essays (Redações com notas C1 a C5 em formato JSON).

Finances (Boletos gerados).

B. Regras de Segurança Back-end:

Matemática no Servidor: O Front-end envia apenas o "Valor Base" e a "Bolsa (0%, 50% ou 100%)". O Back-end calcula o valor real a pagar. Se o aluno tentar injetar um desconto via Payload (JSON), a API deve bloquear.

Soma de Notas: O Front-end envia as notas de C1 a C5. O Back-end é quem faz a soma do Total (Máx 1000) e salva no banco.

IDOR e JWT: Rotas do aluno só buscam dados baseados no ID dentro do Token JWT fornecido pelo Supabase.

4. Estilos e Identidade Visual (UI/UX)

O visual deve ser Premium, assemelhando-se a plataformas SaaS modernas (ex: Vercel, Stripe).

Paleta de Cores:

Fundo: Branco (bg-white ou bg-slate-50 para contraste).

Primária (Destaques/Ações): Rosa Vibrante (bg-pink-600, hover: bg-pink-700). (Nota: Abandone o azul clássico, use Rosa para manter a identidade da marca).

Textos: Preto e Cinza Escuro (text-slate-900, text-slate-500).

Feedback: Verde/emerald (Sucesso), Vermelho/red (Erro), Amarelo/amber (Alerta).

Tipografia:

Plus Jakarta Sans ou Inter para a interface geral, menus e botões.

JetBrains Mono estritamente para números, notas das redações e valores financeiros.

Componentes: Uso intenso de bordas arredondadas (rounded-2xl, rounded-full), sombras suaves (shadow-sm) e efeitos Glassmorphism (Fundos desfocados com backdrop-blur em modais e alertas).

5. Fluxo do Admin (Secretaria)

O Admin tem controle total e visão gerencial.

Dashboard: Visão geral de alunos ativos, inadimplentes, redações pendentes de validação e caixa previsto.

Gestão de Alunos: Matricular aluno (Dados pessoais, responsável, selecionar turmas (ex: R1 e EX1), definir valor e bolsa). Avisar sobre obrigações caso bolsa seja 100%.

Validação de Redação: O Admin vê as notas lançadas e clica em "Validar e Bloquear". Após isso, o aluno não pode mais editar a nota daquela redação.

Financeiro: O sistema não processa cartão real, serve para registro. O Admin clica em "Dar Baixa", informa a data, método (PIX, Dinheiro) e gera o vencimento do mês seguinte.

Acessos: O Admin pode redefinir a senha do aluno a qualquer momento.

6. Fluxo do Professor

O Professor tem acesso restrito apenas à sua área pedagógica.

Dashboard do Professor: Vê apenas as turmas nas quais leciona (ex: Martinha só vê R1 a R6).

Diário de Frequência: Filtra a turma e data. Pode marcar os seguintes status exatos:

Presente

Falta

Justificou

Reposição Agendada (Inserir data futura)

Reposição Feita Nesta Aula

Reposição Feita (Atualizar a data da falta original)

Lançamento de Notas: O Professor pode lançar as notas (C1, C2, C3, C4, C5 e Total automático pelo back) e escrever um feedback em texto para o aluno.

7. Fluxo do Aluno / Responsável

Focado em transparência, desempenho e acesso rápido a ferramentas.

Dashboard do Aluno: Vê a sua frequência atualizada e o status financeiro (Em dia / Pendente).

Meus Cursos: Vê as turmas matriculadas, módulo atual, horário e os feedbacks dos professores.

Painel de Redações: Vê os temas. Pode registrar as próprias notas (se for auto-avaliação) e comparar com a nota dada pela IA (Sofia) e a nota final do Professor.

Financeiro: Vê o histórico de mensalidades, vencimentos e o que já foi pago.

Links de Acesso: Cartões estilizados mostrando as credenciais fixas da Coredação e atalhos para os grupos de WhatsApp da sua respectiva turma.

Solicitações: Botões/Modais para solicitar à Secretaria: "Troca de Turma" ou "Rematrícula".

8. Automações (Sugestões para Implementação)

Para tornar o sistema "inteligente", as seguintes automações devem ser consideradas via Cron Jobs ou Triggers do Supabase/Prisma:

Geração de Faturas Cíclica: No dia 1º de cada mês, um script verifica todos os alunos status: ativo e gera automaticamente a fatura do mês atual baseada no final_value do contrato.

Sincronização de Senha: Sempre que o Admin der reset na senha do aluno, disparar um Webhook/API interna para atualizar a senha da plataforma "Sofia" simultaneamente.

Alerta de Reposição: Se um aluno tiver o status de presença como "Reposição Agendada" para a data de hoje, o sistema destaca o nome dele no diário do professor com uma badge amarela.

Bloqueio de Inadimplência: Se uma fatura passar de 5 dias de atraso, o sistema altera o status financeiro do aluno no painel para "Atrasado" e exibe uma Tarja Vermelha (Alert) bloqueando o envio de novas redações até a regularização.