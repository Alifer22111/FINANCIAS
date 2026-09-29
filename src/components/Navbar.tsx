import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { SupportedCurrency } from '../types/finance';
import {
  Wallet,
  LayoutDashboard,
  Receipt,
  Target,
  TrendingUp,
  Landmark,
  Sparkles,
  BarChart3,
  Sun,
  Moon,
  Bell,
  Plus,
  ChevronDown,
  Check,
  RefreshCw,
  ExternalLink,
  HandCoins,
  User,
  LogOut,
} from 'lucide-react';

interface NavbarProps {
  onOpenNewTransaction: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewTransaction }) => {
  const {
    activeTab,
    setActiveTab,
    currentCurrency,
    setCurrency,
    isDarkMode,
    toggleDarkMode,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    isSyncingInvestidor10,
    syncInvestidor10,
    currentUser,
    logout,
    overdueDebtorsCount,
  } = useFinance();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const currencies: { code: SupportedCurrency; label: string; symbol: string }[] = [
    { code: 'BRL', label: 'Real Brasileiro', symbol: 'R$' },
    { code: 'USD', label: 'Dólar Americano', symbol: 'US$' },
    { code: 'EUR', label: 'Euro Europeu', symbol: '€' },
    { code: 'BTC', label: 'Bitcoin', symbol: '₿' },
  ];

  const navItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transações', icon: Receipt },
    { id: 'budgets', label: 'Orçamentos', icon: Target },
    { id: 'investments', label: 'Investidor 10', icon: TrendingUp },
    {
      id: 'debtors',
      label: 'A Receber',
      icon: HandCoins,
      badge: overdueDebtorsCount > 0 ? `${overdueDebtorsCount}` : undefined,
      isDanger: overdueDebtorsCount > 0,
    },
    { id: 'openfinance', label: 'Open Finance', icon: Landmark },
    { id: 'ai', label: 'Assistente IA', icon: Sparkles, highlight: true },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md transition-colors duration-200">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-zinc-900 dark:text-white">
                  Fin<span className="text-emerald-600 dark:text-emerald-400">Vance</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/40 dark:border-emerald-700/50">
                  Investidor 10 Sync
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:block">
                Gestão Financeira & IA de Investimentos
              </p>
            </div>
          </div>

          {/* Quick links & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* DIRECT LINK TO INVESTIDOR 10 WEBSITE */}
            <a
              href="https://investidor10.com.br"
              target="_blank"
              rel="noopener noreferrer"
              title="Acessar o site oficial Investidor 10 (investidor10.com.br)"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 transition-all shadow-sm"
            >
              <span>Site Investidor 10</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Quick Investidor 10 sync */}
            <button
              onClick={syncInvestidor10}
              disabled={isSyncingInvestidor10}
              title="Sincronizar cotações com Investidor 10"
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-500 ${isSyncingInvestidor10 ? 'animate-spin' : ''}`} />
              <span>{isSyncingInvestidor10 ? 'Sync...' : 'Sync Cotações'}</span>
            </button>

            {/* Currency Selector */}
            <div className="relative">
              <button
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 transition-colors"
              >
                <span className="text-emerald-600 dark:text-emerald-400">
                  {currencies.find((c) => c.code === currentCurrency)?.symbol}
                </span>
                <span>{currentCurrency}</span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {showCurrencyDropdown && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl shadow-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Moeda de Exibição
                  </div>
                  {currencies.map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => {
                        setCurrency(curr.code);
                        setShowCurrencyDropdown(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 w-5">
                          {curr.symbol}
                        </span>
                        <span>{curr.label}</span>
                      </div>
                      {currentCurrency === curr.code && <Check className="w-4 h-4 text-emerald-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              aria-label="Alternar tema"
              title={isDarkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
            </button>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                aria-label="Notificações"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-zinc-900 dark:text-white">Alertas & Notificações</span>
                      {unreadNotificationsCount > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
                          {unreadNotificationsCount} novas
                        </span>
                      )}
                    </div>
                    {unreadNotificationsCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        Marcar lidas
                      </button>
                    )}
                  </div>

                  <div className="mt-3 max-h-72 overflow-y-auto space-y-2.5 pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-center text-xs text-zinc-400 py-6">Nenhum alerta recente.</p>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            markNotificationAsRead(item.id);
                            if (item.actionLink) {
                              setActiveTab(item.actionLink as any);
                              setShowNotifications(false);
                            }
                          }}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            item.read
                              ? 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800/60 opacity-70'
                              : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 shadow-sm'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</span>
                            {!item.read && <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />}
                          </div>
                          <p className="text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">{item.message}</p>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-2 block">
                            {new Date(item.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Menu */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                    {currentUser.name ? currentUser.name.slice(0, 1).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 hidden md:inline max-w-[100px] truncate">
                    {currentUser.name}
                  </span>
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 z-50 animate-in fade-in zoom-in-95 space-y-2">
                    <div className="px-2 py-1 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                      <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {currentUser.email}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        logout();
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sair / Trocar de Conta</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Add Transaction Button */}
            <button
              onClick={onOpenNewTransaction}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Lançamento</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none border-t border-zinc-100 dark:border-zinc-800/60">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-emerald-500 dark:text-zinc-950 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${tab.highlight && !isActive ? 'text-amber-500 animate-pulse' : ''}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                      tab.isDanger
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
                {tab.highlight && (
                  <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-300">
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

