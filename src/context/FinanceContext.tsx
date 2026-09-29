import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Transaction,
  CategoryBudget,
  InvestmentAsset,
  BankAccount,
  SupportedCurrency,
  NotificationItem,
  AIExpensesAnalysis,
  AIInvestmentsAnalysis,
  User,
  DebtorRecord,
} from '../types/finance';
import {
  INITIAL_CATEGORIES,
  INITIAL_BANKS,
  INITIAL_TRANSACTIONS,
  INITIAL_INVESTMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_DEBTORS,
  DEFAULT_USER,
} from '../data/initialData';

interface FinanceContextType {
  // Authentication
  currentUser: User | null;
  login: (email: string, password?: string) => { success: boolean; message?: string };
  register: (name: string, email: string, password?: string) => { success: boolean; message?: string };
  logout: () => void;

  // Transactions
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (tx: Transaction) => void;
  importBankTransactions: (bankId: string, count?: number) => void;

  // Debtors & Receivables (Pessoas que me devem)
  debtors: DebtorRecord[];
  addDebtor: (debtor: Omit<DebtorRecord, 'id' | 'amountPaid' | 'paymentHistory'>) => void;
  updateDebtor: (debtor: DebtorRecord) => void;
  deleteDebtor: (id: string) => void;
  recordDebtorPayment: (debtorId: string, amount: number, method?: string, notes?: string) => void;
  overdueDebtorsCount: number;

  // Categories & Budgets
  categories: CategoryBudget[];
  updateCategoryBudget: (category: string, newLimit: number) => void;

  // Investments & Investidor 10
  investments: InvestmentAsset[];
  addInvestment: (inv: Omit<InvestmentAsset, 'id'>) => void;
  deleteInvestment: (id: string) => void;
  updateInvestment: (inv: InvestmentAsset) => void;
  isSyncingInvestidor10: boolean;
  lastInvestidor10Sync: string | null;
  syncInvestidor10: () => Promise<void>;

  // Open Finance Banks
  banks: BankAccount[];
  toggleBankConnection: (bankId: string) => void;
  syncBank: (bankId: string) => Promise<void>;
  isSyncingBank: string | null;

  // Multi-Currency
  currentCurrency: SupportedCurrency;
  setCurrency: (curr: SupportedCurrency) => void;
  formatMoney: (amountInBRL: number) => string;
  currencyRates: Record<SupportedCurrency, number>;

  // Theme (Dark / Light)
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Notifications & Budget Alerts
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  budgetAlerts: { category: string; spent: number; limit: number; percent: number; status: 'warning' | 'danger' }[];

  // Active Tab navigation
  activeTab: 'dashboard' | 'transactions' | 'budgets' | 'investments' | 'openfinance' | 'debtors' | 'ai' | 'reports';
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'budgets' | 'investments' | 'openfinance' | 'debtors' | 'ai' | 'reports') => void;

  // AI Cached State
  aiExpensesAnalysis: AIExpensesAnalysis | null;
  setAiExpensesAnalysis: (data: AIExpensesAnalysis | null) => void;
  aiInvestmentsAnalysis: AIInvestmentsAnalysis | null;
  setAiInvestmentsAnalysis: (data: AIInvestmentsAnalysis | null) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const CURRENCY_RATES: Record<SupportedCurrency, number> = {
  BRL: 1.0,
  USD: 0.18,
  EUR: 0.17,
  BTC: 0.00000274,
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('finvance_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_USER;
      }
    }
    // Default to DEFAULT_USER so returning/registered user enters directly
    return DEFAULT_USER;
  });

  const login = (email: string, password?: string) => {
    const registeredUsersStr = localStorage.getItem('finvance_registered_users');
    let registeredUsers: User[] = registeredUsersStr ? JSON.parse(registeredUsersStr) : [DEFAULT_USER];

    const found = registeredUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('finvance_current_user', JSON.stringify(found));
      return { success: true };
    }

    // If not found in custom list, create session with name from email
    const namePart = email.split('@')[0];
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: formattedName,
      email: email.trim(),
      registeredAt: new Date().toISOString(),
    };
    registeredUsers.push(newUser);
    localStorage.setItem('finvance_registered_users', JSON.stringify(registeredUsers));
    localStorage.setItem('finvance_current_user', JSON.stringify(newUser));
    setCurrentUser(newUser);
    return { success: true };
  };

  const register = (name: string, email: string, password?: string) => {
    const registeredUsersStr = localStorage.getItem('finvance_registered_users');
    let registeredUsers: User[] = registeredUsersStr ? JSON.parse(registeredUsersStr) : [DEFAULT_USER];

    const existing = registeredUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setCurrentUser(existing);
      localStorage.setItem('finvance_current_user', JSON.stringify(existing));
      return { success: true, message: 'Conta já existia, você foi conectado diretamente!' };
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: name.trim() || 'Usuário',
      email: email.trim(),
      registeredAt: new Date().toISOString(),
    };

    registeredUsers.push(newUser);
    localStorage.setItem('finvance_registered_users', JSON.stringify(registeredUsers));
    localStorage.setItem('finvance_current_user', JSON.stringify(newUser));
    setCurrentUser(newUser);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('finvance_current_user');
    setCurrentUser(null);
  };

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('finvance_dark_mode');
    return saved !== null ? JSON.parse(saved) : true; // Default to elegant dark mode
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('finvance_dark_mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Active Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'budgets' | 'investments' | 'openfinance' | 'debtors' | 'ai' | 'reports'>('dashboard');

  // Debtors & Receivables State
  const [debtors, setDebtors] = useState<DebtorRecord[]>(() => {
    const saved = localStorage.getItem('finvance_debtors');
    const list: DebtorRecord[] = saved ? JSON.parse(saved) : INITIAL_DEBTORS;
    const today = new Date().toISOString().split('T')[0];

    // Recalculate status based on dates
    return list.map((d) => {
      if (d.amountPaid >= d.agreedAmount) {
        return { ...d, status: 'pago' };
      }
      if (d.dueDate < today && d.amountPaid < d.agreedAmount) {
        return { ...d, status: 'atrasado' };
      }
      if (d.amountPaid > 0) {
        return { ...d, status: 'parcial' };
      }
      return { ...d, status: 'pendente' };
    });
  });

  useEffect(() => {
    localStorage.setItem('finvance_debtors', JSON.stringify(debtors));
  }, [debtors]);

  const addDebtor = (newD: Omit<DebtorRecord, 'id' | 'amountPaid' | 'paymentHistory'>) => {
    const record: DebtorRecord = {
      ...newD,
      id: `deb-${Date.now()}`,
      amountPaid: 0,
      paymentHistory: [],
    };
    setDebtors((prev) => [record, ...prev]);

    // Add alert notification
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Novo Registro a Receber',
      message: `${record.debtorName} adicionado: R$ ${record.agreedAmount.toFixed(2)} com vencimento em ${new Date(record.dueDate).toLocaleDateString('pt-BR')}.`,
      type: 'info',
      timestamp: new Date().toISOString(),
      read: false,
      actionLink: 'debtors',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const updateDebtor = (updated: DebtorRecord) => {
    setDebtors((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  const deleteDebtor = (id: string) => {
    setDebtors((prev) => prev.filter((d) => d.id !== id));
  };

  const recordDebtorPayment = (debtorId: string, amount: number, method = 'Pix', notes?: string) => {
    setDebtors((prev) =>
      prev.map((d) => {
        if (d.id === debtorId) {
          const newAmountPaid = d.amountPaid + amount;
          const isPaidOff = newAmountPaid >= d.agreedAmount;
          const today = new Date().toISOString().split('T')[0];

          const newPayment = {
            date: today,
            amount,
            method,
            notes: notes || 'Pagamento abatido',
          };

          const updatedStatus = isPaidOff
            ? 'pago'
            : d.dueDate < today
            ? 'atrasado'
            : 'parcial';

          // Add transaction automatically into incomes!
          addTransaction({
            description: `Recebimento de Empréstimo - ${d.debtorName}`,
            amount,
            type: 'receita',
            category: 'Valores a Receber',
            date: today,
            paymentMethod: method as any,
            bankId: 'nubank',
            notes: `Amortização de dívida (${notes || 'Quitado/Parcial'})`,
          });

          // Add notification
          const notif: NotificationItem = {
            id: `notif-${Date.now()}`,
            title: isPaidOff ? `🎉 Dívida Quitada: ${d.debtorName}` : `Pagamento Recebido: ${d.debtorName}`,
            message: `Recebido R$ ${amount.toFixed(2)} de ${d.debtorName}.${isPaidOff ? ' Dívida 100% liquidada com lucro!' : ` Restam R$ ${(d.agreedAmount - newAmountPaid).toFixed(2)}.`}`,
            type: 'success',
            timestamp: new Date().toISOString(),
            read: false,
            actionLink: 'debtors',
          };
          setNotifications((prevN) => [notif, ...prevN]);

          return {
            ...d,
            amountPaid: newAmountPaid,
            status: updatedStatus,
            paymentHistory: [newPayment, ...d.paymentHistory],
          };
        }
        return d;
      })
    );
  };

  const overdueDebtorsCount = debtors.filter((d) => d.status === 'atrasado').length;

  // Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('finvance_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  useEffect(() => {
    localStorage.setItem('finvance_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Categories & Budgets State
  const [categories, setCategories] = useState<CategoryBudget[]>(() => {
    const saved = localStorage.getItem('finvance_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  useEffect(() => {
    localStorage.setItem('finvance_categories', JSON.stringify(categories));
  }, [categories]);

  // Investments State
  const [investments, setInvestments] = useState<InvestmentAsset[]>(() => {
    const saved = localStorage.getItem('finvance_investments');
    return saved ? JSON.parse(saved) : INITIAL_INVESTMENTS;
  });

  useEffect(() => {
    localStorage.setItem('finvance_investments', JSON.stringify(investments));
  }, [investments]);

  // Banks State
  const [banks, setBanks] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem('finvance_banks');
    return saved ? JSON.parse(saved) : INITIAL_BANKS;
  });

  useEffect(() => {
    localStorage.setItem('finvance_banks', JSON.stringify(banks));
  }, [banks]);

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('finvance_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  useEffect(() => {
    localStorage.setItem('finvance_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Currency State
  const [currentCurrency, setCurrency] = useState<SupportedCurrency>('BRL');

  // Investidor 10 Sync State
  const [isSyncingInvestidor10, setIsSyncingInvestidor10] = useState(false);
  const [lastInvestidor10Sync, setLastInvestidor10Sync] = useState<string | null>('Hoje às 09:42');
  const [isSyncingBank, setIsSyncingBank] = useState<string | null>(null);

  // AI Analysis Cache
  const [aiExpensesAnalysis, setAiExpensesAnalysis] = useState<AIExpensesAnalysis | null>(null);
  const [aiInvestmentsAnalysis, setAiInvestmentsAnalysis] = useState<AIInvestmentsAnalysis | null>(null);

  // Format money helper
  const formatMoney = (amountInBRL: number) => {
    const rate = CURRENCY_RATES[currentCurrency];
    const converted = amountInBRL * rate;

    switch (currentCurrency) {
      case 'USD':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(converted);
      case 'EUR':
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(converted);
      case 'BTC':
        return `₿ ${converted.toFixed(6)}`;
      case 'BRL':
      default:
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(converted);
    }
  };

  // Transaction Actions
  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Check budget alert after adding transaction
    if (newTx.type === 'despesa') {
      const catBudget = categories.find((c) => c.category === newTx.category);
      if (catBudget) {
        const totalSpent = transactions
          .filter((t) => t.category === newTx.category && t.type === 'despesa')
          .reduce((acc, t) => acc + t.amount, 0) + newTx.amount;

        const percent = (totalSpent / catBudget.monthlyLimit) * 100;
        if (percent >= 100) {
          const alertNotif: NotificationItem = {
            id: `notif-${Date.now()}`,
            title: `⚠️ Orçamento Estourado: ${newTx.category}`,
            message: `Atenção! Você ultrapassou 100% do orçamento de ${newTx.category} (${formatMoney(totalSpent)} de ${formatMoney(catBudget.monthlyLimit)}).`,
            type: 'alert',
            timestamp: new Date().toISOString(),
            read: false,
            actionLink: 'budgets',
          };
          setNotifications((prev) => [alertNotif, ...prev]);
        } else if (percent >= 80) {
          const alertNotif: NotificationItem = {
            id: `notif-${Date.now()}`,
            title: `Alerta: Orçamento em ${percent.toFixed(0)}%`,
            message: `A categoria ${newTx.category} atingiu ${percent.toFixed(0)}% do limite planejado.`,
            type: 'alert',
            timestamp: new Date().toISOString(),
            read: false,
            actionLink: 'budgets',
          };
          setNotifications((prev) => [alertNotif, ...prev]);
        }
      }
    }
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTransaction = (updated: Transaction) => {
    setTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  // Update Category Budget
  const updateCategoryBudget = (categoryName: string, newLimit: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.category === categoryName ? { ...c, monthlyLimit: newLimit } : c))
    );
  };

  // Investments Actions
  const addInvestment = (inv: Omit<InvestmentAsset, 'id'>) => {
    const newInv: InvestmentAsset = {
      ...inv,
      id: `inv-${Date.now()}`,
    };
    setInvestments((prev) => [...prev, newInv]);
  };

  const deleteInvestment = (id: string) => {
    setInvestments((prev) => prev.filter((inv) => inv.id !== id));
  };

  const updateInvestment = (updated: InvestmentAsset) => {
    setInvestments((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)));
  };

  // Sincronização automática com API do Investidor 10
  const syncInvestidor10 = async () => {
    setIsSyncingInvestidor10(true);
    try {
      const response = await fetch('/api/investidor10/sync', { method: 'POST' });
      const data = await response.json();

      if (data.quotes) {
        setInvestments((prev) =>
          prev.map((inv) => {
            const updatedQuote = data.quotes[inv.ticker];
            if (updatedQuote) {
              return {
                ...inv,
                currentPrice: updatedQuote.price,
                change24h: updatedQuote.change24h,
                p_l: updatedQuote.p_l ?? inv.p_l,
                p_vp: updatedQuote.p_vp ?? inv.p_vp,
                dy12m: updatedQuote.dy12m ?? inv.dy12m,
                bazinPrice: updatedQuote.bazinPrice ?? inv.bazinPrice,
                grahamPrice: updatedQuote.grahamPrice ?? inv.grahamPrice,
                lastDividend: updatedQuote.lastDividend ?? inv.lastDividend,
                nextDividendDate: updatedQuote.nextDividendDate ?? inv.nextDividendDate,
              };
            }
            return inv;
          })
        );
      }

      const now = new Date();
      setLastInvestidor10Sync(`Hoje às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`);

      // Add notification
      const syncNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Investidor 10: Carteira Atualizada',
        message: 'Cotações da B3, FIIs e Dividendos sincronizados em tempo real com sucesso.',
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false,
        actionLink: 'investments',
      };
      setNotifications((prev) => [syncNotif, ...prev]);
    } catch (err) {
      console.error('Falha ao sincronizar com Investidor 10:', err);
    } finally {
      setIsSyncingInvestidor10(false);
    }
  };

  // Bank Actions
  const toggleBankConnection = (bankId: string) => {
    setBanks((prev) =>
      prev.map((b) => {
        if (b.id === bankId) {
          const nextState = !b.connected;
          return {
            ...b,
            connected: nextState,
            balance: nextState ? (b.balance > 0 ? b.balance : 3450.0) : 0,
            accountNumber: nextState ? (b.accountNumber || `${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(Math.random() * 9)}`) : '',
            lastSync: nextState ? new Date().toISOString() : null,
          };
        }
        return b;
      })
    );
  };

  const syncBank = async (bankId: string) => {
    setIsSyncingBank(bankId);
    await new Promise((res) => setTimeout(res, 1200));

    const bank = banks.find((b) => b.id === bankId);
    if (bank) {
      setBanks((prev) =>
        prev.map((b) => (b.id === bankId ? { ...b, lastSync: new Date().toISOString() } : b))
      );

      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: `Open Finance: ${bank.name} Sincronizado`,
        message: `Saldo e lançamentos de ${bank.name} atualizados com segurança via Open Finance.`,
        type: 'info',
        timestamp: new Date().toISOString(),
        read: false,
        actionLink: 'openfinance',
      };
      setNotifications((prev) => [notif, ...prev]);
    }
    setIsSyncingBank(null);
  };

  // Import mock transactions from bank
  const importBankTransactions = (bankId: string) => {
    const bank = banks.find((b) => b.id === bankId);
    if (!bank) return;

    const sampleTransactions: Transaction[] = [
      {
        id: `tx-import-${Date.now()}-1`,
        description: `Supermercado Express (${bank.name})`,
        amount: 142.30,
        type: 'despesa',
        category: 'Alimentação',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cartão de Débito',
        bankId: bank.id,
      },
      {
        id: `tx-import-${Date.now()}-2`,
        description: `Farmácia Popular (${bank.name})`,
        amount: 88.50,
        type: 'despesa',
        category: 'Saúde e Cuidados',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Pix',
        bankId: bank.id,
      },
    ];

    setTransactions((prev) => [...sampleTransactions, ...prev]);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Transações Importadas',
      message: `${sampleTransactions.length} lançamentos de ${bank.name} categorizados automaticamente.`,
      type: 'success',
      timestamp: new Date().toISOString(),
      read: false,
      actionLink: 'transactions',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Active Budget Alerts calculation
  const budgetAlerts = categories
    .map((cat) => {
      const spent = transactions
        .filter((t) => t.category === cat.category && t.type === 'despesa')
        .reduce((sum, t) => sum + t.amount, 0);

      const percent = cat.monthlyLimit > 0 ? (spent / cat.monthlyLimit) * 100 : 0;
      if (percent >= 100) {
        return { category: cat.category, spent, limit: cat.monthlyLimit, percent, status: 'danger' as const };
      }
      if (percent >= 75) {
        return { category: cat.category, spent, limit: cat.monthlyLimit, percent, status: 'warning' as const };
      }
      return null;
    })
    .filter(Boolean) as { category: string; spent: number; limit: number; percent: number; status: 'warning' | 'danger' }[];

  return (
    <FinanceContext.Provider
      value={{
        currentUser,
        login,
        register,
        logout,
        transactions,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        importBankTransactions,
        debtors,
        addDebtor,
        updateDebtor,
        deleteDebtor,
        recordDebtorPayment,
        overdueDebtorsCount,
        categories,
        updateCategoryBudget,
        investments,
        addInvestment,
        deleteInvestment,
        updateInvestment,
        isSyncingInvestidor10,
        lastInvestidor10Sync,
        syncInvestidor10,
        banks,
        toggleBankConnection,
        syncBank,
        isSyncingBank,
        currentCurrency,
        setCurrency,
        formatMoney,
        currencyRates: CURRENCY_RATES,
        isDarkMode,
        toggleDarkMode,
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        budgetAlerts,
        activeTab,
        setActiveTab,
        aiExpensesAnalysis,
        setAiExpensesAnalysis,
        aiInvestmentsAnalysis,
        setAiInvestmentsAnalysis,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
