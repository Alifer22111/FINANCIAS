import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { AlertTriangle, AlertCircle, ChevronRight, X } from 'lucide-react';

export const BudgetAlertBanner: React.FC = () => {
  const { budgetAlerts, formatMoney, setActiveTab } = useFinance();
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed || budgetAlerts.length === 0) return null;

  const topAlert = budgetAlerts[0];
  const isDanger = topAlert.status === 'danger';

  return (
    <div
      className={`border-b transition-colors px-4 py-2.5 ${
        isDanger
          ? 'bg-rose-500/10 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200'
          : 'bg-amber-500/10 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 overflow-hidden">
          {isDanger ? (
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          )}
          <span className="font-bold truncate">
            {isDanger ? 'Limite de Orçamento Excedido:' : 'Atenção ao Orçamento:'}
          </span>
          <span className="truncate">
            A categoria <strong>{topAlert.category}</strong> consumiu{' '}
            <strong className="underline underline-offset-2">{topAlert.percent.toFixed(0)}%</strong> do teto (
            {formatMoney(topAlert.spent)} de {formatMoney(topAlert.limit)}).
          </span>
          {budgetAlerts.length > 1 && (
            <span className="hidden md:inline-block px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-[10px] font-semibold">
              +{budgetAlerts.length - 1} outros alertas
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('budgets')}
            className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            <span>Ver Orçamentos</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-zinc-500"
            aria-label="Dispensar alerta"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
