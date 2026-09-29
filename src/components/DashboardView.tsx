import React from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  PieChart,
  BarChart3,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Landmark,
  ChevronRight,
  Plus,
  HandCoins,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenNewTransaction: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenNewTransaction }) => {
  const {
    transactions,
    categories,
    investments,
    banks,
    debtors,
    formatMoney,
    setActiveTab,
    isSyncingInvestidor10,
    syncInvestidor10,
    lastInvestidor10Sync,
    budgetAlerts,
  } = useFinance();

  // Current month calculation
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthTransactions = transactions.filter((t) => t.date.startsWith(currentMonthStr));

  const totalIncome = currentMonthTransactions
    .filter((t) => t.type === 'receita')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = currentMonthTransactions
    .filter((t) => t.type === 'despesa')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalInvestedAportes = currentMonthTransactions
    .filter((t) => t.type === 'investimento')
    .reduce((sum, t) => sum + t.amount, 0);

  // Bank Balances
  const totalBankBalance = banks
    .filter((b) => b.connected)
    .reduce((sum, b) => sum + b.balance, 0);

  // Total Portfolio Value from Investidor 10
  const totalPortfolioValue = investments.reduce(
    (sum, inv) => sum + inv.quantity * inv.currentPrice,
    0
  );

  const totalPortfolioCost = investments.reduce(
    (sum, inv) => sum + inv.quantity * inv.averagePrice,
    0
  );

  const totalPortfolioProfit = totalPortfolioValue - totalPortfolioCost;
  const portfolioProfitPercent = totalPortfolioCost > 0 ? (totalPortfolioProfit / totalPortfolioCost) * 100 : 0;

  // Monthly Budget Target vs Real
  const totalBudgetLimit = categories.reduce((sum, c) => sum + c.monthlyLimit, 0);
  const budgetUsagePercent = totalBudgetLimit > 0 ? (totalExpense / totalBudgetLimit) * 100 : 0;

  // Monthly History Mock for the interactive chart (last 6 months)
  const monthlyFlow = [
    { month: 'Abr', income: 8400, expense: 4100 },
    { month: 'Mai', income: 8600, expense: 4350 },
    { month: 'Jun', income: 8900, expense: 4600 },
    { month: 'Jul', income: 9100, expense: 4200 },
    { month: 'Ago', income: 9400, expense: 4800 },
    { month: 'Set', income: totalIncome || 10228.5, expense: totalExpense || 4701.3 },
  ];

  // Category Breakdown for the donut chart / progress bars
  const categoryExpenses = categories
    .map((cat) => {
      const spent = currentMonthTransactions
        .filter((t) => t.category === cat.category && t.type === 'despesa')
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        category: cat.category,
        color: cat.color,
        spent,
        limit: cat.monthlyLimit,
        percent: cat.monthlyLimit > 0 ? (spent / cat.monthlyLimit) * 100 : 0,
      };
    })
    .filter((c) => c.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner & Date Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
            Painel Financeiro & Investimentos
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Acompanhamento em tempo real sincronizado com a B3 e Open Finance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-600 dark:text-zinc-400">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">Setembro de 2026</span>
          </div>

          <button
            onClick={onOpenNewTransaction}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Lançamento</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bank Balance */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Saldo em Bancos
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-zinc-900 dark:text-white">
              {formatMoney(totalBankBalance)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span>{banks.filter((b) => b.connected).length} bancos Open Finance ativos</span>
            </div>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Receitas do Mês
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatMoney(totalIncome)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+8.2% vs mês anterior</span>
            </div>
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Despesas do Mês
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {formatMoney(totalExpense)}
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
              <span>{budgetUsagePercent.toFixed(0)}% do orçamento global</span>
              <span>Teto: {formatMoney(totalBudgetLimit)}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 mt-1 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  budgetUsagePercent >= 100
                    ? 'bg-rose-500'
                    : budgetUsagePercent >= 75
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Investidor 10 Portfolio */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-800/30 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Patrimônio Investidor 10
            </span>
            <button
              onClick={syncInvestidor10}
              disabled={isSyncingInvestidor10}
              className="p-1 rounded-lg hover:bg-white/10 text-emerald-400 transition-colors"
              title="Sincronizar carteira"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingInvestidor10 ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">
              {formatMoney(totalPortfolioValue)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <span
                className={`font-bold ${
                  totalPortfolioProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {totalPortfolioProfit >= 0 ? '+' : ''}
                {formatMoney(totalPortfolioProfit)} ({portfolioProfitPercent.toFixed(1)}%)
              </span>
              <span className="text-zinc-400 text-[10px]">• {investments.length} ativos</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Smart Insight Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-amber-500/20 dark:border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                FinVance AI Advisor & Radar de Oportunidades
              </h2>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-0.5 leading-relaxed">
              Detectamos que seus gastos com <strong>Alimentação fora de casa</strong> atingiram 83% do orçamento.
              Além disso, o FII <strong>MXRF11</strong> está com P/VP em 0,98 no Investidor 10 (oportunidade de aporte com desconto).
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('ai')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-sm shrink-0 transition-all"
        >
          <span>Abrir Diagnóstico IA</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Valores a Receber & Devedores Highlight Banner */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
            <HandCoins className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Valores a Receber & Empréstimos Pessoais
              </h2>
              {debtors.filter((d) => d.status === 'atrasado').length > 0 && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-rose-500 text-white animate-pulse">
                  {debtors.filter((d) => d.status === 'atrasado').length} atrasados
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-1 text-xs">
              <span className="text-zinc-600 dark:text-zinc-300">
                A receber:{' '}
                <strong className="text-zinc-900 dark:text-white font-black">
                  {formatMoney(
                    debtors
                      .filter((d) => d.status !== 'pago')
                      .reduce((sum, d) => sum + Math.max(0, d.agreedAmount - d.amountPaid), 0)
                  )}
                </strong>
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                Lucro Ganho com Juros:{' '}
                <strong className="font-black">
                  +
                  {formatMoney(
                    debtors.reduce((sum, d) => {
                      const interest = Math.max(0, d.agreedAmount - d.originalAmount);
                      return d.status === 'pago'
                        ? sum + interest
                        : d.amountPaid > d.originalAmount
                        ? sum + (d.amountPaid - d.originalAmount)
                        : sum;
                    }, 0)
                  )}
                </strong>
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('debtors')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shrink-0 transition-all"
        >
          <span>Gerenciar Devedores</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Flow Chart (Bar/Area) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                <span>Evolução Mensal (Receitas vs Despesas)</span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Acompanhamento semestral dos fluxos</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-zinc-600 dark:text-zinc-400">Receitas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-500" />
                <span className="text-zinc-600 dark:text-zinc-400">Despesas</span>
              </div>
            </div>
          </div>

          {/* Custom SVG Bar Chart */}
          <div className="mt-6 h-64 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
            {monthlyFlow.map((item, index) => {
              const maxVal = 12000;
              const incomeHeight = (item.income / maxVal) * 100;
              const expenseHeight = (item.expense / maxVal) * 100;

              return (
                <div key={item.month} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1.5 h-48">
                    {/* Income Bar */}
                    <div
                      className="w-full max-w-[20px] rounded-t-md bg-emerald-500/80 hover:bg-emerald-500 transition-all cursor-pointer relative"
                      style={{ height: `${incomeHeight}%` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow pointer-events-none transition-opacity whitespace-nowrap z-20">
                        {formatMoney(item.income)}
                      </div>
                    </div>

                    {/* Expense Bar */}
                    <div
                      className="w-full max-w-[20px] rounded-t-md bg-rose-500/80 hover:bg-rose-500 transition-all cursor-pointer relative"
                      style={{ height: `${expenseHeight}%` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow pointer-events-none transition-opacity whitespace-nowrap z-20">
                        {formatMoney(item.expense)}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-3">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
            <span>Poupança líquida no mês: <strong>{formatMoney(totalIncome - totalExpense)}</strong></span>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
            >
              <span>Ver relatórios detalhados</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Expenses by Category Breakdown */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-500" />
                <span>Gastos por Categoria</span>
              </h2>
              <button
                onClick={() => setActiveTab('budgets')}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                Tetos
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              {categoryExpenses.slice(0, 5).map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      {cat.category}
                    </span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {formatMoney(cat.spent)}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        backgroundColor: cat.color,
                        width: `${Math.min(cat.percent, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400">
                    <span>{cat.percent.toFixed(0)}% do limite</span>
                    <span>Meta: {formatMoney(cat.limit)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-4">
            <button
              onClick={() => setActiveTab('budgets')}
              className="w-full py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-center"
            >
              Configurar Tetos & Orçamentos
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Investidor 10 Live Watchlist & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Investidor 10 Assets Preview */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Ativos Investidor 10 (Cotações & DY)</span>
              </h2>
              <span className="text-[10px] text-zinc-400">
                Último sync: {lastInvestidor10Sync || 'Agora'}
              </span>
            </div>
            <button
              onClick={() => setActiveTab('investments')}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
            >
              Ver Carteira Completa
            </button>
          </div>

          <div className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {investments.slice(0, 4).map((asset) => {
              const totalVal = asset.quantity * asset.currentPrice;
              const profitVal = (asset.currentPrice - asset.averagePrice) * asset.quantity;
              const profitPct = ((asset.currentPrice - asset.averagePrice) / asset.averagePrice) * 100;

              return (
                <div key={asset.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-extrabold text-xs text-zinc-900 dark:text-white">
                      {asset.ticker.slice(0, 4)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-zinc-900 dark:text-white">
                          {asset.ticker}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          {asset.type}
                        </span>
                        {asset.p_vp && asset.p_vp < 1 && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                            P/VP {asset.p_vp.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-[140px]">
                        {asset.name}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-extrabold text-xs text-zinc-900 dark:text-white">
                      {formatMoney(totalVal)}
                    </div>
                    <div className="flex items-center justify-end gap-1.5 text-[11px]">
                      <span className="text-zinc-400">{asset.quantity} cotas</span>
                      <span
                        className={`font-semibold ${
                          profitVal >= 0 ? 'text-emerald-500' : 'text-rose-500'
                        }`}
                      >
                        {profitVal >= 0 ? '+' : ''}
                        {profitPct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-500" />
              <span>Últimos Lançamentos</span>
            </h2>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
            >
              Ver Extrato Completo
            </button>
          </div>

          <div className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {transactions.slice(0, 4).map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === 'receita'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : tx.type === 'investimento'
                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {tx.type === 'receita' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : tx.type === 'investimento' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-zinc-900 dark:text-white line-clamp-1">
                      {tx.description}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400">
                      <span>{tx.category}</span>
                      <span>•</span>
                      <span>{new Date(tx.date).toLocaleDateString('pt-BR')}</span>
                      <span>•</span>
                      <span>{tx.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`font-black text-xs ${
                      tx.type === 'receita'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : tx.type === 'investimento'
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {tx.type === 'receita' ? '+' : '-'} {formatMoney(tx.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
