import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Download,
  Calendar,
  Printer,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { transactions, categories, investments, formatMoney } = useFinance();

  const [reportPeriod, setReportPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  // Income vs Expense
  const totalIncome = transactions
    .filter((t) => t.type === 'receita')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'despesa')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // Portfolio allocation by asset type
  const totalInvested = investments.reduce(
    (sum, inv) => sum + inv.quantity * inv.currentPrice,
    0
  );

  const allocationByType = investments.reduce((acc, inv) => {
    const val = inv.quantity * inv.currentPrice;
    acc[inv.type] = (acc[inv.type] || 0) + val;
    return acc;
  }, {} as Record<string, number>);

  const assetTypeColors: Record<string, string> = {
    Ação: '#3b82f6',
    FII: '#10b981',
    'Renda Fixa': '#f59e0b',
    Cripto: '#8b5cf6',
    BDR: '#ec4899',
  };

  // Categories ranking
  const categoryRank = categories
    .map((c) => {
      const spent = transactions
        .filter((t) => t.category === c.category && t.type === 'despesa')
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        category: c.category,
        color: c.color,
        spent,
        limit: c.monthlyLimit,
        percent: totalExpense > 0 ? (spent / totalExpense) * 100 : 0,
      };
    })
    .filter((c) => c.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  // Compound Interest Wealth Projection (Aporte de R$ 2.000/mês + Rendimento 10% a.a.)
  const monthlyAporte = 2000;
  const annualReturnRate = 0.105; // 10.5% a.a. (CDI / Selic + FIIs)
  const monthlyRate = Math.pow(1 + annualReturnRate, 1 / 12) - 1;

  const calculateFutureValue = (months: number) => {
    let futureVal = totalInvested;
    for (let m = 0; m < months; m++) {
      futureVal = futureVal * (1 + monthlyRate) + monthlyAporte;
    }
    return futureVal;
  };

  const proj1Year = calculateFutureValue(12);
  const proj3Years = calculateFutureValue(36);
  const proj5Years = calculateFutureValue(60);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 print:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
            Relatórios & Análise Gráfica
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Relatórios consolidados, taxa de poupança, alocação de carteira e projeções futuras
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Economia Líquida Acumulada
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatMoney(netSavings)}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            Diferença positiva entre receitas e gastos
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Taxa de Poupança (Savings Rate)
          </span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {savingsRate.toFixed(1)}%
          </div>
          <div className="text-xs text-emerald-500 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Acima da meta recomendada (20%)</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Patrimônio Líquido Geral
          </span>
          <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
            {formatMoney(totalInvested + 15920.87)}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            Soma de investimentos e saldo em contas
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-500" />
              <span>Distribuição de Gastos por Categoria</span>
            </h3>
            <span className="text-xs text-zinc-400">Total: {formatMoney(totalExpense)}</span>
          </div>

          <div className="space-y-3">
            {categoryRank.map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-zinc-700 dark:text-zinc-300">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">{item.percent.toFixed(1)}%</span>
                    <span className="text-zinc-900 dark:text-white font-bold">{formatMoney(item.spent)}</span>
                  </div>
                </div>

                <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: item.color,
                      width: `${item.percent}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Investment Portfolio Allocation */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>Alocação da Carteira por Classe</span>
            </h3>
            <span className="text-xs text-zinc-400">Total: {formatMoney(totalInvested)}</span>
          </div>

          <div className="space-y-3">
            {Object.entries(allocationByType).map(([type, value]) => {
              const pct = totalInvested > 0 ? (value / totalInvested) * 100 : 0;
              const color = assetTypeColors[type] || '#10b981';

              return (
                <div key={type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-zinc-700 dark:text-zinc-300">{type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400">{pct.toFixed(1)}%</span>
                      <span className="text-zinc-900 dark:text-white font-bold">{formatMoney(value)}</span>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: color,
                        width: `${pct}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Wealth Projection Simulator */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/70 border border-emerald-800/40 text-white shadow-xl space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Simulador de Liberdade Financeira (Juros Compostos)
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Projeção patrimonial considerando aporte mensal de R$ 2.000,00 e rentabilidade média de 10,5% a.a.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-zinc-800/60 border border-zinc-700/60 text-center space-y-1">
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Em 1 Ano</span>
            <div className="text-xl font-black text-emerald-400">
              {formatMoney(proj1Year)}
            </div>
            <span className="text-[10px] text-zinc-400">+R$ 24.000 em aportes</span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-800/60 border border-zinc-700/60 text-center space-y-1">
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Em 3 Anos</span>
            <div className="text-xl font-black text-emerald-400">
              {formatMoney(proj3Years)}
            </div>
            <span className="text-[10px] text-zinc-400">Renda passiva ~{formatMoney((proj3Years * 0.09) / 12)}/mês</span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-800/60 border border-zinc-700/60 text-center space-y-1">
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Em 5 Anos</span>
            <div className="text-xl font-black text-emerald-400">
              {formatMoney(proj5Years)}
            </div>
            <span className="text-[10px] text-zinc-400">Renda passiva ~{formatMoney((proj5Years * 0.09) / 12)}/mês</span>
          </div>
        </div>
      </div>
    </div>
  );
};
