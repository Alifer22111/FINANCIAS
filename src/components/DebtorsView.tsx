import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { DebtorRecord, DebtStatus } from '../types/finance';
import {
  HandCoins,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  DollarSign,
  TrendingUp,
  MessageCircle,
  Receipt,
  Search,
  Calendar,
  X,
  ArrowUpRight,
  User,
  Phone,
  HelpCircle,
} from 'lucide-react';

export const DebtorsView: React.FC = () => {
  const { debtors, addDebtor, deleteDebtor, recordDebtorPayment, formatMoney } = useFinance();

  const [activeFilter, setActiveFilter] = useState<'all' | 'atrasado' | 'pendente' | 'pago'>('all');
  const [search, setSearch] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [paymentModalDebtor, setPaymentModalDebtor] = useState<DebtorRecord | null>(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState('');
  const [paymentMethodInput, setPaymentMethodInput] = useState('Pix');
  const [paymentNotesInput, setPaymentNotesInput] = useState('');

  // New Debtor Form State
  const [newDebtorName, setNewDebtorName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newOriginalAmount, setNewOriginalAmount] = useState('');
  const [newAgreedAmount, setNewAgreedAmount] = useState('');
  const [newLoanDate, setNewLoanDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newDueDate, setNewDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [newPhone, setNewPhone] = useState('');
  const [newPixKey, setNewPixKey] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculations
  const totalAgreed = debtors.reduce((sum, d) => sum + d.agreedAmount, 0);
  const totalOriginal = debtors.reduce((sum, d) => sum + d.originalAmount, 0);
  const totalPaid = debtors.reduce((sum, d) => sum + d.amountPaid, 0);

  // Remaining open balance to collect
  const totalRemainingToCollect = debtors
    .filter((d) => d.status !== 'pago')
    .reduce((sum, d) => sum + Math.max(0, d.agreedAmount - d.amountPaid), 0);

  // Total Profit / Interest earned
  const totalProfitEarned = debtors.reduce((sum, d) => {
    // If fully paid or partial, calculate interest component realized
    const interest = Math.max(0, d.agreedAmount - d.originalAmount);
    if (d.status === 'pago') {
      return sum + interest;
    }
    if (d.amountPaid > d.originalAmount) {
      return sum + (d.amountPaid - d.originalAmount);
    }
    return sum;
  }, 0);

  // Overdue debtors calculation
  const overdueDebtors = debtors.filter((d) => d.status === 'atrasado');
  const totalOverdueAmount = overdueDebtors.reduce(
    (sum, d) => sum + Math.max(0, d.agreedAmount - d.amountPaid),
    0
  );

  // Days difference helper
  const getDaysDifference = (dueDateStr: string) => {
    const due = new Date(dueDateStr).getTime();
    const today = new Date(todayStr).getTime();
    const diffDays = Math.round((today - due) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Filtered list
  const filteredDebtors = debtors.filter((d) => {
    const matchesFilter =
      activeFilter === 'all'
        ? true
        : activeFilter === 'atrasado'
        ? d.status === 'atrasado'
        : activeFilter === 'pago'
        ? d.status === 'pago'
        : d.status === 'pendente' || d.status === 'parcial';

    const matchesSearch =
      d.debtorName.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase()) ||
      (d.phone && d.phone.includes(search));

    return matchesFilter && matchesSearch;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orig = parseFloat(newOriginalAmount.replace(',', '.'));
    const agreed = parseFloat(newAgreedAmount.replace(',', '.')) || orig;

    if (!newDebtorName.trim() || !orig || orig <= 0) return;

    addDebtor({
      debtorName: newDebtorName.trim(),
      description: newDescription.trim() || 'Empréstimo Pessoal',
      originalAmount: orig,
      agreedAmount: agreed,
      loanDate: newLoanDate,
      dueDate: newDueDate,
      status: newDueDate < todayStr ? 'atrasado' : 'pendente',
      phone: newPhone.trim() || undefined,
      pixKey: newPixKey.trim() || undefined,
      notes: newNotes.trim() || undefined,
    });

    // Reset and close
    setNewDebtorName('');
    setNewDescription('');
    setNewOriginalAmount('');
    setNewAgreedAmount('');
    setNewPhone('');
    setNewPixKey('');
    setNewNotes('');
    setIsAddModalOpen(false);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalDebtor) return;
    const amount = parseFloat(paymentAmountInput.replace(',', '.'));
    if (!amount || amount <= 0) return;

    recordDebtorPayment(paymentModalDebtor.id, amount, paymentMethodInput, paymentNotesInput);
    setPaymentModalDebtor(null);
    setPaymentAmountInput('');
    setPaymentNotesInput('');
  };

  const generateWhatsAppCobrança = (d: DebtorRecord) => {
    const remaining = Math.max(0, d.agreedAmount - d.amountPaid);
    const dueDateFormatted = new Date(d.dueDate).toLocaleDateString('pt-BR');
    const daysDiff = getDaysDifference(d.dueDate);

    let text = `Olá, ${d.debtorName}! Tudo bem?\n\nPassando para lembrar referente a "${d.description}".\n`;
    if (daysDiff > 0) {
      text += `O valor acordado de R$ ${remaining.toFixed(2)} venceu no dia ${dueDateFormatted} (há ${daysDiff} dias).\n`;
    } else {
      text += `O saldo restante é de R$ ${remaining.toFixed(2)}, com vencimento para ${dueDateFormatted}.\n`;
    }

    if (d.pixKey) {
      text += `\nVocê pode efetuar via Pix na chave: ${d.pixKey}`;
    }
    text += `\n\nQualquer dúvida me avise. Obrigado!`;

    const encoded = encodeURIComponent(text);
    const phoneClean = (d.phone || '').replace(/\D/g, '');
    const url = phoneClean ? `https://wa.me/55${phoneClean}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
              Valores a Receber & Devedores
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Controle de Empréstimos
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Acompanhe quem te deve, veja o quanto você já ganhou de juros e identifique cobranças atrasadas
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Empréstimo / Devedor</span>
        </button>
      </div>

      {/* Overdue Alert Bar if any */}
      {overdueDebtors.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/10 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-900/60 text-rose-900 dark:text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-xs">
                Atenção: Você tem {overdueDebtors.length} {overdueDebtors.length === 1 ? 'cobrança atrasada' : 'cobranças atrasadas'}!
              </span>
              <p className="text-[11px] text-rose-700 dark:text-rose-300">
                Total de <strong>{formatMoney(totalOverdueAmount)}</strong> vencido que ainda não foi quitado pelos devedores.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveFilter('atrasado')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 transition-colors shrink-0"
          >
            Ver Devedores Atrasados
          </button>
        </div>
      )}

      {/* KPI Cards: Totais e Cálculos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total a Receber */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Total a Receber em Aberto
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <HandCoins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
            {formatMoney(totalRemainingToCollect)}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            De {formatMoney(totalAgreed)} acordados no total
          </div>
        </div>

        {/* Quanto Eu Ganhei (Lucro com Juros) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-800/40 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Quanto Eu Ganhei (Lucro/Juros)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">
            +{formatMoney(totalProfitEarned)}
          </div>
          <div className="text-xs text-zinc-300 mt-1">
            Rendimento obtido sobre o principal emprestado
          </div>
        </div>

        {/* Total Já Recebido */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Total Já Recebido (Amortizado)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white mt-2">
            {formatMoney(totalPaid)}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            {totalAgreed > 0 ? ((totalPaid / totalAgreed) * 100).toFixed(0) : 0}% do valor total liquidado
          </div>
        </div>

        {/* Em Atraso */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
              Cobranças Atrasadas
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {formatMoney(totalOverdueAmount)}
          </div>
          <div className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-1">
            {overdueDebtors.length} {overdueDebtors.length === 1 ? 'pessoa inadimplente' : 'pessoas inadimplentes'}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'all'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800'
            }`}
          >
            Todos ({debtors.length})
          </button>
          <button
            onClick={() => setActiveFilter('atrasado')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeFilter === 'atrasado'
                ? 'bg-rose-600 text-white'
                : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Atrasados ({overdueDebtors.length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('pendente')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'pendente'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800'
            }`}
          >
            Em Aberto / Parciais
          </button>
          <button
            onClick={() => setActiveFilter('pago')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'pago'
                ? 'bg-emerald-600 text-white'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800'
            }`}
          >
            Quitados ({debtors.filter((d) => d.status === 'pago').length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou motivo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Debtors List / Table */}
      <div className="space-y-4">
        {filteredDebtors.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400">
            Nenhum registro encontrado com o filtro selecionado.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDebtors.map((debtor) => {
              const remaining = Math.max(0, debtor.agreedAmount - debtor.amountPaid);
              const progressPct = debtor.agreedAmount > 0 ? (debtor.amountPaid / debtor.agreedAmount) * 100 : 0;
              const daysDiff = getDaysDifference(debtor.dueDate);
              const isOverdue = debtor.status === 'atrasado';
              const isPaid = debtor.status === 'pago';
              const interest = Math.max(0, debtor.agreedAmount - debtor.originalAmount);

              return (
                <div
                  key={debtor.id}
                  className={`p-5 rounded-2xl bg-white dark:bg-zinc-900 border transition-all space-y-4 relative ${
                    isOverdue
                      ? 'border-rose-400 dark:border-rose-800/80 shadow-md shadow-rose-500/5'
                      : isPaid
                      ? 'border-emerald-300 dark:border-emerald-800/50 opacity-80'
                      : 'border-zinc-200 dark:border-zinc-800 shadow-sm'
                  }`}
                >
                  {/* Card Top: Person & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                          isOverdue
                            ? 'bg-rose-500/10 text-rose-500'
                            : isPaid
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-indigo-500/10 text-indigo-500'
                        }`}
                      >
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white">
                          {debtor.debtorName}
                        </h3>
                        <p className="text-xs text-zinc-500 line-clamp-1">{debtor.description}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {isOverdue ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white">
                          <AlertCircle className="w-3 h-3" />
                          ATRASADO ({daysDiff} dias)
                        </span>
                      ) : isPaid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          QUITADO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <Clock className="w-3 h-3" />
                          Vence em {Math.abs(daysDiff)} dias
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Financial Values Grid */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/80 text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-semibold">Valor Emprestado</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        {formatMoney(debtor.originalAmount)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-zinc-400 block font-semibold">Total a Devolver</span>
                      <span className="font-black text-zinc-900 dark:text-white">
                        {formatMoney(debtor.agreedAmount)}
                      </span>
                      {interest > 0 && (
                        <span className="text-[9px] text-emerald-500 font-bold block">
                          +{formatMoney(interest)} lucro
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] text-zinc-400 block font-semibold">Saldo Restante</span>
                      <span
                        className={`font-black ${
                          remaining > 0 ? (isOverdue ? 'text-rose-500' : 'text-indigo-500') : 'text-zinc-400'
                        }`}
                      >
                        {formatMoney(remaining)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar of Payment */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span>Progresso do pagamento: {progressPct.toFixed(0)}%</span>
                      <span>Já pago: <strong>{formatMoney(debtor.amountPaid)}</strong></span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isPaid ? 'bg-emerald-500' : isOverdue ? 'bg-rose-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${Math.min(progressPct, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Notes / Dates info */}
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                    <span>Emprestado em: {new Date(debtor.loanDate).toLocaleDateString('pt-BR')}</span>
                    <span>Vencimento: <strong className={isOverdue ? 'text-rose-500' : 'text-zinc-700 dark:text-zinc-300'}>{new Date(debtor.dueDate).toLocaleDateString('pt-BR')}</strong></span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-2">
                    <div className="flex items-center gap-1.5">
                      {!isPaid && (
                        <button
                          onClick={() => setPaymentModalDebtor(debtor)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1.5 transition-colors"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Receber Pagamento</span>
                        </button>
                      )}

                      {!isPaid && (
                        <button
                          onClick={() => generateWhatsAppCobrança(debtor)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 flex items-center gap-1.5 transition-colors"
                          title="Enviar lembrete pelo WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Cobrar no WhatsApp</span>
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => deleteDebtor(debtor.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Excluir devedor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Novo Empréstimo / Devedor */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <HandCoins className="w-4 h-4 text-emerald-500" />
                <span>Cadastrar Valor a Receber / Empréstimo</span>
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Nome da Pessoa / Devedor *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: Carlos Eduardo, Mariana, etc."
                  value={newDebtorName}
                  onChange={(e) => setNewDebtorName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Motivo / Descrição *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Empréstimo conserto carro, Venda celular, etc."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Valor Emprestado (R$) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="1000,00"
                    value={newOriginalAmount}
                    onChange={(e) => {
                      setNewOriginalAmount(e.target.value);
                      if (!newAgreedAmount) {
                        setNewAgreedAmount(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Valor Combinado (com Juros)
                  </label>
                  <input
                    type="text"
                    placeholder="1100,00"
                    value={newAgreedAmount}
                    onChange={(e) => setNewAgreedAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Data do Empréstimo
                  </label>
                  <input
                    type="date"
                    required
                    value={newLoanDate}
                    onChange={(e) => setNewLoanDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Data Limite (Vencimento) *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    WhatsApp (para Cobrança)
                  </label>
                  <input
                    type="text"
                    placeholder="(11) 99999-9999"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Sua Chave Pix (no aviso)
                  </label>
                  <input
                    type="text"
                    placeholder="email / telefone / cpf"
                    value={newPixKey}
                    onChange={(e) => setNewPixKey(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Observações
                </label>
                <input
                  type="text"
                  placeholder="Ex: Combinado 10% de juros ao mês"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md"
                >
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Receber Pagamento / Abater Dívida */}
      {paymentModalDebtor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Receber de {paymentModalDebtor.debtorName}
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Saldo devedor: {formatMoney(paymentModalDebtor.agreedAmount - paymentModalDebtor.amountPaid)}
                </p>
              </div>
              <button
                onClick={() => setPaymentModalDebtor(null)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Valor Recebido (R$) *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder={String(paymentModalDebtor.agreedAmount - paymentModalDebtor.amountPaid)}
                  value={paymentAmountInput}
                  onChange={(e) => setPaymentAmountInput(e.target.value)}
                  className="w-full px-3 py-2 text-base font-black rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Forma de Pagamento
                </label>
                <select
                  value={paymentMethodInput}
                  onChange={(e) => setPaymentMethodInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                >
                  <option value="Pix">Pix</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Transferência">TED / Transferência</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Nota (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Parcela 1/2, Quitação..."
                  value={paymentNotesInput}
                  onChange={(e) => setPaymentNotesInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setPaymentModalDebtor(null)}
                  className="px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md"
                >
                  Confirmar Recebimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
