import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  Landmark,
  ShieldCheck,
  RefreshCw,
  Plus,
  CheckCircle2,
  Lock,
  Download,
  CreditCard,
  Building,
  ArrowRight,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export const OpenFinanceView: React.FC = () => {
  const {
    banks,
    toggleBankConnection,
    syncBank,
    isSyncingBank,
    importBankTransactions,
    formatMoney,
    setActiveTab,
  } = useFinance();

  const [connectingBankId, setConnectingBankId] = useState<string | null>(null);

  const connectedBanks = banks.filter((b) => b.connected);
  const totalBalance = connectedBanks.reduce((sum, b) => sum + b.balance, 0);
  const totalCreditLimit = connectedBanks.reduce((sum, b) => sum + b.creditLimit, 0);
  const totalInvoices = connectedBanks.reduce((sum, b) => sum + b.currentInvoice, 0);

  const handleConnectBank = async (bankId: string) => {
    setConnectingBankId(bankId);
    await new Promise((res) => setTimeout(res, 1400));
    toggleBankConnection(bankId);
    setConnectingBankId(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
              Open Finance Brasil
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Banco Central do Brasil
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Sincronização bancária automática e segura com as principais instituições financeiras do país
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-xl border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Criptografia Ponta a Ponta (Resolução BCB nº 1/2020)</span>
        </div>
      </div>

      {/* Aggregate Financial Health Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Saldo Disponível em Bancos
          </span>
          <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
            {formatMoney(totalBalance)}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            Distribuído em {connectedBanks.length} contas ativas
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Faturas de Cartão Abertas
          </span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatMoney(totalInvoices)}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            Soma dos cartões de crédito conectados
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Limite de Crédito Total
          </span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {formatMoney(totalCreditLimit)}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            Limite disponível pré-aprovado
          </div>
        </div>
      </div>

      {/* Brazilian Banks Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
          Instituições Financeiras Integradas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banks.map((bank) => {
            const isSyncing = isSyncingBank === bank.id;
            const isConnecting = connectingBankId === bank.id;

            return (
              <div
                key={bank.id}
                className={`p-5 rounded-2xl border transition-all relative overflow-hidden bg-white dark:bg-zinc-900 ${
                  bank.connected
                    ? 'border-zinc-200 dark:border-zinc-800 shadow-sm'
                    : 'border-dashed border-zinc-300 dark:border-zinc-800 opacity-80 hover:opacity-100'
                }`}
              >
                {/* Bank Brand Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-md"
                      style={{ backgroundColor: bank.color }}
                    >
                      {bank.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                        {bank.name}
                      </h3>
                      <span className="text-[11px] text-zinc-400">
                        Código COMPE: {bank.code}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      bank.connected
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {bank.connected ? 'Conectado' : 'Não Vinculado'}
                  </span>
                </div>

                {/* Account Details if connected */}
                {bank.connected ? (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-zinc-500">Saldo em Conta Corrente</span>
                      <span className="text-base font-black text-zinc-900 dark:text-white">
                        {formatMoney(bank.balance)}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-zinc-500">Fatura Atual do Cartão</span>
                      <span className="font-bold text-rose-500">
                        {formatMoney(bank.currentInvoice)}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Conta: <strong>{bank.accountNumber}</strong></span>
                      <span>Sync: {bank.lastSync ? new Date(bank.lastSync).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Hoje'}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={() => syncBank(bank.id)}
                        disabled={isSyncing}
                        className="py-1.5 px-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 text-emerald-500 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span>{isSyncing ? 'Atualizando...' : 'Sincronizar'}</span>
                      </button>

                      <button
                        onClick={() => importBankTransactions(bank.id)}
                        className="py-1.5 px-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 flex items-center justify-center gap-1.5 transition-colors"
                        title="Importa lançamentos recentes e categoriza automaticamente com IA"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Puxar Extrato</span>
                      </button>
                    </div>

                    <button
                      onClick={() => toggleBankConnection(bank.id)}
                      className="w-full text-center text-[10px] text-zinc-400 hover:text-rose-500 transition-colors pt-1"
                    >
                      Desconectar conta bancária
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 text-center space-y-3">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Conecte sua conta do <strong>{bank.name}</strong> para sincronizar transações, saldo e faturas via Open Finance.
                    </p>
                    <button
                      onClick={() => handleConnectBank(bank.id)}
                      disabled={isConnecting}
                      className="w-full py-2 rounded-xl text-xs font-bold bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-sm flex items-center justify-center gap-2 transition-all"
                    >
                      {isConnecting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Autenticando no BCB...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Conectar via Open Finance</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
