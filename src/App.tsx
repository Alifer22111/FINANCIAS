import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Navbar } from './components/Navbar';
import { BudgetAlertBanner } from './components/BudgetAlertBanner';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { BudgetsView } from './components/BudgetsView';
import { InvestmentsView } from './components/InvestmentsView';
import { DebtorsView } from './components/DebtorsView';
import { OpenFinanceView } from './components/OpenFinanceView';
import { AIAssistantView } from './components/AIAssistantView';
import { ReportsView } from './components/ReportsView';
import { AuthView } from './components/AuthView';
import { NewTransactionModal } from './components/NewTransactionModal';
import { ShieldCheck, TrendingUp, Sparkles, Heart } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, currentUser } = useFinance();
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);

  // If user is not logged in / not registered, show the Auth / Login screen
  if (!currentUser) {
    return <AuthView />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      {/* Navigation Bar with Investidor 10 link and User Profile */}
      <Navbar onOpenNewTransaction={() => setIsNewTxModalOpen(true)} />

      {/* Top Budget Alert Banner */}
      <BudgetAlertBanner />

      {/* Active Tab View */}
      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && <DashboardView onOpenNewTransaction={() => setIsNewTxModalOpen(true)} />}
        {activeTab === 'transactions' && <TransactionsView onOpenNewTransaction={() => setIsNewTxModalOpen(true)} />}
        {activeTab === 'budgets' && <BudgetsView />}
        {activeTab === 'investments' && <InvestmentsView />}
        {activeTab === 'debtors' && <DebtorsView />}
        {activeTab === 'openfinance' && <OpenFinanceView />}
        {activeTab === 'ai' && <AIAssistantView />}
        {activeTab === 'reports' && <ReportsView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60 py-6 text-xs text-zinc-500 dark:text-zinc-400 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-zinc-900 dark:text-white">FinVance</span>
            <span>•</span>
            <span>Sincronizado com API Investidor 10 & Open Finance Brasil</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Gemini 3.8 Flash AI</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Segurança BCB Open Finance</span>
            </span>
          </div>
        </div>
      </footer>

      {/* New Transaction Modal */}
      <NewTransactionModal
        isOpen={isNewTxModalOpen}
        onClose={() => setIsNewTxModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <MainContent />
    </FinanceProvider>
  );
}

