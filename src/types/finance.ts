export type TransactionType = 'despesa' | 'receita' | 'investimento';

export type PaymentMethod = 
  | 'Pix' 
  | 'Cartão de Crédito' 
  | 'Cartão de Débito' 
  | 'Boleto' 
  | 'Transferência' 
  | 'Dinheiro';

export interface Transaction {
  id: string;
  description: string;
  amount: number; // Stored in BRL as base currency
  type: TransactionType;
  category: string;
  date: string; // ISO date YYYY-MM-DD
  paymentMethod: PaymentMethod;
  bankId: string;
  notes?: string;
}

export interface CategoryBudget {
  category: string;
  monthlyLimit: number; // in BRL
  color: string;
  iconName: string;
}

export type AssetType = 'Ação' | 'FII' | 'BDR' | 'Renda Fixa' | 'Cripto';

export interface InvestmentAsset {
  id: string;
  ticker: string;
  name: string;
  type: AssetType;
  quantity: number;
  averagePrice: number; // Preço Médio em BRL
  currentPrice: number; // Preço Atual sincronizado via Investidor 10
  change24h: number; // % variação 24h
  p_l?: number;
  p_vp?: number;
  dy12m: number; // % Dividend Yield anual
  grahamPrice?: number;
  bazinPrice?: number;
  lastDividend?: number;
  nextDividendDate?: string;
  sector: string;
  broker: string; // Ex: XP, NuInvest, Inter, Rico, BTG
  notes?: string;
}

export interface BankAccount {
  id: string;
  name: string;
  code: string;
  color: string;
  connected: boolean;
  accountNumber: string;
  balance: number;
  creditLimit: number;
  currentInvoice: number;
  lastSync: string | null;
}

export type SupportedCurrency = 'BRL' | 'USD' | 'EUR' | 'BTC';

export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  rateToBase: number; // Rate against BRL (e.g. 1 BRL = rateToBase in that currency)
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'success' | 'info' | 'opportunity';
  timestamp: string;
  read: boolean;
  actionLink?: string;
}

export interface AIExpensesAnalysis {
  overallHealthScore: number;
  summary: string;
  keyInsights: string[];
  monthlySavingsTips: {
    category: string;
    action: string;
    potentialMonthlySaving: number;
    impact: 'Alto' | 'Médio' | 'Baixo';
  }[];
  budgetAlerts: string[];
  rule50_30_20: {
    needsPercentage: number;
    wantsPercentage: number;
    savingsPercentage: number;
    assessment: string;
  };
}

export interface AIInvestmentsAnalysis {
  marketSentiment: string;
  portfolioHealth: string;
  opportunities: {
    ticker: string;
    type: string;
    recommendation: string;
    fairPrice: string;
    currentPrice: string;
    upsidePotential: string;
    dividendYield: string;
    reason: string;
  }[];
  assetSignals: {
    ticker: string;
    signal: 'COMPRAR' | 'MANTER' | 'AGUARDAR_CORREÇÃO' | 'REALIZAR_LUCRO' | 'APORTE_FRACIONADO';
    note: string;
  }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  registeredAt: string;
}

export type DebtStatus = 'pendente' | 'pago' | 'parcial' | 'atrasado';

export interface DebtPayment {
  date: string;
  amount: number;
  method: string;
  notes?: string;
}

export interface DebtorRecord {
  id: string;
  debtorName: string;
  description: string;
  originalAmount: number; // Valor original emprestado
  agreedAmount: number; // Valor acordado com juros/lucro
  amountPaid: number; // Total já recebido desta pessoa
  loanDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: DebtStatus;
  phone?: string;
  pixKey?: string;
  notes?: string;
  paymentHistory: DebtPayment[];
}

