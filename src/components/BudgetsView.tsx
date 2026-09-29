import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  Target,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Plus,
  Zap,
  TrendingDown,
  Sparkles,
} from 'lucide-react';

export const BudgetsView: React.FC = () => {
  const { categories, updateCategoryBudget, transactions, formatMoney, setActiveTab } = useFinance();

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newLimitInput, setNewLimitInput] = useState<string>('');

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - now.getDate();

  // Spendings by category in the current month
  const categoryStats = categories.map((cat) => {
    const spent = transactions
      .filter((t) => t.category === cat.category && t.type === 'despesa' && t.date.startsWith(currentMonthStr))
      .reduce((sum, t) => sum + t.amount, 0);

    const percent = cat.monthlyLimit > 0 ? (spent / cat.monthlyLimit) * 100 : 0;
    const remaining = Math.max(0, cat.monthlyLimit - spent);
    const dailySuggested = daysRemaining > 0 ? remaining / daysRemaining : 0;

    return {
      ...cat,
      spent,
      percent,
      remaining,
      dailySuggested,
      isOver: spent > cat.monthlyLimit,
      isWarning: percent >= 75 && percent < 100,
    };
  });

  const totalBudget = categories.reduce((sum, c) => sum + c.monthlyLimit, 0);
  const totalSpent = categoryStats.reduce((sum, c) => sum + c.spent, 0);
  const globalPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const handleStartEdit = (category: string, currentLimit: number) => {
    setEditingCategory(category);
    setNewLimitInput(currentLimit.toString());
  };

  const handleSaveBudget = (category: string) => {
    const val = parseFloat(newLimitInput.replace(',', '.'));
    if (!isNaN(val) && val >= 0) {
      updateCategoryBudget(category, val);
    }
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
            Orçamentos Personalizados por Categoria
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Defina limites mensais para evitar estouros e receba notificações preventivas
          </p>
        </div>

        <button
          onClick={() => setActiveTab('ai')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sugerir Orçamentos com IA</span>
        </button>
      </div>

      {/* Global Overview Progress Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Orçamento Global Mensal
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-zinc-900 dark:text-white">
                {formatMoney(totalSpent)}
              </span>
              <span className="text-xs text-zinc-400">
                de {formatMoney(totalBudget)} planejado
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-zinc-500">Saldo Livre Restante</span>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {formatMoney(Math.max(0, totalBudget - totalSpent))}
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div>
          <div className="w-full h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                globalPercent >= 100
                  ? 'bg-rose-500'
                  : globalPercent >= 75
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(globalPercent, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-zinc-400 mt-2">
            <span>{globalPercent.toFixed(1)}% utilizado</span>
            <span>{daysRemaining} dias restantes no mês ({formatMoney(Math.max(0, totalBudget - totalSpent) / (daysRemaining || 1))}/dia)</span>
          </div>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryStats.map((item) => (
          <div
            key={item.category}
            className={`p-5 rounded-2xl bg-white dark:bg-zinc-900 border transition-all relative overflow-hidden ${
              item.isOver
                ? 'border-rose-400 dark:border-rose-800/80 shadow-rose-500/5'
                : item.isWarning
                ? 'border-amber-400 dark:border-amber-800/80 shadow-amber-500/5'
                : 'border-zinc-200 dark:border-zinc-800/80 shadow-sm'
            }`}
          >
            {/* Category header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-sm"
                  style={{ backgroundColor: item.color }}
                >
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {item.category}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {item.isOver ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                        <AlertCircle className="w-3 h-3" />
                        Estourado ({item.percent.toFixed(0)}%)
                      </span>
                    ) : item.isWarning ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="w-3 h-3" />
                        Atenção ({item.percent.toFixed(0)}%)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        No limite ({item.percent.toFixed(0)}%)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Edit Limit Button */}
              <button
                onClick={() => handleStartEdit(item.category, item.monthlyLimit)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Editar limite"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Spent vs Limit */}
            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Gasto Atual</span>
                <div className="text-base font-black text-zinc-900 dark:text-white">
                  {formatMoney(item.spent)}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Teto Mensal</span>
                {editingCategory === item.category ? (
                  <div className="flex items-center gap-1 mt-1">
                    <input
                      type="number"
                      autoFocus
                      value={newLimitInput}
                      onChange={(e) => setNewLimitInput(e.target.value)}
                      className="w-20 px-2 py-0.5 text-xs rounded border border-emerald-500 bg-white dark:bg-zinc-950 font-bold"
                    />
                    <button
                      onClick={() => handleSaveBudget(item.category)}
                      className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <div className="text-sm font-extrabold text-zinc-700 dark:text-zinc-300">
                    {formatMoney(item.monthlyLimit)}
                  </div>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  item.isOver
                    ? 'bg-rose-500'
                    : item.isWarning
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(item.percent, 100)}%` }}
              />
            </div>

            {/* Footer details */}
            <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/60">
              <span>Restante: <strong className="text-zinc-800 dark:text-zinc-200">{formatMoney(item.remaining)}</strong></span>
              <span>Disponível: <strong>{formatMoney(item.dailySuggested)}/dia</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
