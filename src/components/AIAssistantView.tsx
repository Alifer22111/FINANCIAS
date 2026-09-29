import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  Sparkles,
  TrendingUp,
  PiggyBank,
  CheckCircle2,
  AlertTriangle,
  Send,
  Bot,
  User,
  ArrowRight,
  RefreshCw,
  Target,
  DollarSign,
  ShieldAlert,
  Percent,
} from 'lucide-react';

export const AIAssistantView: React.FC = () => {
  const {
    transactions,
    categories,
    investments,
    formatMoney,
    aiExpensesAnalysis,
    setAiExpensesAnalysis,
    aiInvestmentsAnalysis,
    setAiInvestmentsAnalysis,
    currentCurrency,
  } = useFinance();

  const [aiSubTab, setAiSubTab] = useState<'expenses' | 'investments' | 'chat'>('expenses');
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);
  const [isLoadingInvestments, setIsLoadingInvestments] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; time: string }>>([
    {
      sender: 'assistant',
      text: 'Olá! Sou seu assistente financeiro FinVance AI, treinado no ecossistema da B3, Investidor 10 e finanças pessoais brasileiras. Como posso ajudar a otimizar seus gastos ou encontrar oportunidades de investimento hoje?',
      time: 'Agora',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Run Expenses Analysis
  const handleAnalyzeExpenses = async () => {
    setIsLoadingExpenses(true);
    try {
      const now = new Date();
      const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const monthExpenses = transactions.filter((t) => t.type === 'despesa' && t.date.startsWith(currentMonthStr));
      const income = transactions.filter((t) => t.type === 'receita' && t.date.startsWith(currentMonthStr)).reduce((s, t) => s + t.amount, 0);

      const response = await fetch('/api/gemini/analyze-expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          income: income || 9800,
          expenses: monthExpenses,
          budgets: categories,
          month: 'Setembro/2026',
        }),
      });

      const data = await response.json();
      setAiExpensesAnalysis(data);
    } catch (err) {
      console.error('Error analyzing expenses:', err);
    } finally {
      setIsLoadingExpenses(false);
    }
  };

  // Run Investment Analysis
  const handleAnalyzeInvestments = async () => {
    setIsLoadingInvestments(true);
    try {
      const response = await fetch('/api/gemini/analyze-investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolio: investments,
        }),
      });

      const data = await response.json();
      setAiInvestmentsAnalysis(data);
    } catch (err) {
      console.error('Error analyzing investments:', err);
    } finally {
      setIsLoadingInvestments(false);
    }
  };

  // Send message in interactive chat
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSendingChat) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [...prev, { sender: 'user', text: userMsg, time: nowTime }]);
    setIsSendingChat(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ content: userMsg }],
          context: {
            totalPortfolioAssets: investments.length,
            currency: currentCurrency,
          },
        }),
      });

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: data.reply || 'Desculpe, não consegui processar a resposta neste momento.',
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Houve uma oscilação na conexão com a IA. Por favor, tente novamente.',
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
              FinVance Inteligência Artificial
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Gemini 3.8 Flash
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Diagnóstico profundo de gastos, estratégias de economia mensal e radar de compras na B3
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60">
          <button
            onClick={() => setAiSubTab('expenses')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              aiSubTab === 'expenses'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Análise de Gastos
          </button>
          <button
            onClick={() => setAiSubTab('investments')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              aiSubTab === 'investments'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Radar de Investimentos
          </button>
          <button
            onClick={() => setAiSubTab('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              aiSubTab === 'chat'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Chat com a IA
          </button>
        </div>
      </div>

      {/* 1. EXPENSES ANALYSIS TAB */}
      {aiSubTab === 'expenses' && (
        <div className="space-y-6">
          {/* Action Trigger Card if not analyzed yet */}
          {!aiExpensesAnalysis ? (
            <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-950 border border-amber-500/20 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center shadow-lg">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-lg font-black text-white">
                  Diagnóstico Inteligente dos seus Gastos Mensais
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  A IA analisa todos os seus lançamentos, compara com seus limites orçamentários, calcula a regra 50-30-20 e gera planos objetivos para poupar dinheiro.
                </p>
              </div>
              <button
                onClick={handleAnalyzeExpenses}
                disabled={isLoadingExpenses}
                className="px-6 py-3 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20 active:scale-95 transition-all inline-flex items-center gap-2"
              >
                {isLoadingExpenses ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processando seus dados com Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Iniciar Análise de Gastos</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in">
              {/* Health Score & Summary Strip */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Score */}
                <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                  <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-zinc-100 dark:text-zinc-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-emerald-500 transition-all duration-1000 ease-out"
                        strokeDasharray={`${aiExpensesAnalysis.overallHealthScore}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-xl font-black text-zinc-900 dark:text-white">
                        {aiExpensesAnalysis.overallHealthScore}
                      </span>
                      <span className="text-[9px] text-zinc-400 font-bold">/100</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Saúde Financeira
                    </span>
                    <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white mt-0.5">
                      {aiExpensesAnalysis.overallHealthScore >= 80
                        ? 'Excelente Disciplina'
                        : aiExpensesAnalysis.overallHealthScore >= 60
                        ? 'Equilibrado com Alertas'
                        : 'Atenção Necessária'}
                    </h4>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Calculado com base em orçamentos e reservas.
                    </p>
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="md:col-span-2 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Diagnóstico Executivo da IA
                      </span>
                      <button
                        onClick={handleAnalyzeExpenses}
                        disabled={isLoadingExpenses}
                        className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingExpenses ? 'animate-spin' : ''}`} />
                        <span>Reavaliar</span>
                      </button>
                    </div>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-2 leading-relaxed">
                      {aiExpensesAnalysis.summary}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap gap-2">
                    {aiExpensesAnalysis.keyInsights?.map((insight, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>{insight}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actionable Monthly Savings Tips Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <PiggyBank className="w-4 h-4 text-emerald-500" />
                    <span>Formas Práticas de Economizar Este Mês</span>
                  </h3>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    Economia Estimada Total: R$ 464,90/mês
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {aiExpensesAnalysis.monthlySavingsTips?.map((tip, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          {tip.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase ${
                            tip.impact === 'Alto'
                              ? 'text-rose-500'
                              : tip.impact === 'Médio'
                              ? 'text-amber-500'
                              : 'text-zinc-400'
                          }`}
                        >
                          Impacto {tip.impact}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-snug">
                        {tip.action}
                      </p>

                      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-baseline justify-between">
                        <span className="text-[10px] text-zinc-400">Economia Potencial:</span>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                          +{formatMoney(tip.potentialMonthlySaving)}/mês
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rule 50-30-20 Breakdown */}
              {aiExpensesAnalysis.rule50_30_20 && (
                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                        Regra de Ouro Financeira: 50 - 30 - 20
                      </h4>
                      <p className="text-xs text-zinc-500">
                        50% Necessidades • 30% Desejos Pessoais • 20% Poupança & Investimentos
                      </p>
                    </div>
                    <span className="text-xs text-zinc-400 font-medium">Sua Distribuição Real</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-center">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Necessidades</span>
                      <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                        {aiExpensesAnalysis.rule50_30_20.needsPercentage}%
                      </div>
                      <span className="text-[10px] text-zinc-500">Ideal: até 50%</span>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-center">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Desejos & Lazer</span>
                      <div className="text-lg font-black text-amber-500 mt-0.5">
                        {aiExpensesAnalysis.rule50_30_20.wantsPercentage}%
                      </div>
                      <span className="text-[10px] text-zinc-500">Ideal: até 30%</span>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-center">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Investimentos</span>
                      <div className="text-lg font-black text-emerald-500 mt-0.5">
                        {aiExpensesAnalysis.rule50_30_20.savingsPercentage}%
                      </div>
                      <span className="text-[10px] text-zinc-500">Ideal: no mínimo 20%</span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-300 italic">
                    "{aiExpensesAnalysis.rule50_30_20.assessment}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. INVESTMENTS RADAR TAB */}
      {aiSubTab === 'investments' && (
        <div className="space-y-6">
          {!aiInvestmentsAnalysis ? (
            <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-zinc-900 to-zinc-950 border border-emerald-500/20 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
                <TrendingUp className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-lg font-black text-white">
                  Radar de Compras & Oportunidades do Dia (Investidor 10)
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  A IA analisa os múltiplos fundamentalistas da B3 (P/VP, P/L, Dividend Yield, Preço Teto Bazin e Graham) para indicar quando é a hora ideal de comprar e onde estão as assimetrias.
                </p>
              </div>
              <button
                onClick={handleAnalyzeInvestments}
                disabled={isLoadingInvestments}
                className="px-6 py-3 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all inline-flex items-center gap-2"
              >
                {isLoadingInvestments ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Consultando múltiplos com Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Escanear Carteira e Oportunidades</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in">
              {/* Macro & Sentiment */}
              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                    Visão de Mercado & Estratégia B3
                  </span>
                  <p className="text-xs text-zinc-800 dark:text-zinc-200 font-semibold mt-1">
                    {aiInvestmentsAnalysis.marketSentiment}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    {aiInvestmentsAnalysis.portfolioHealth}
                  </p>
                </div>
                <button
                  onClick={handleAnalyzeInvestments}
                  disabled={isLoadingInvestments}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingInvestments ? 'animate-spin' : ''}`} />
                  <span>Atualizar Sinais</span>
                </button>
              </div>

              {/* Day Opportunities */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                  Oportunidades em Destaque (Hora de Comprar)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {aiInvestmentsAnalysis.opportunities?.map((opp, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-zinc-900 border border-emerald-800/40 text-white space-y-3 shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-base">{opp.ticker}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300">
                            {opp.type}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500 text-zinc-950">
                          {opp.recommendation}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs border-y border-zinc-800 py-2">
                        <div>
                          <span className="text-[10px] text-zinc-400 block">Preço Atual:</span>
                          <span className="font-bold text-white">{opp.currentPrice}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-400 block">Preço Justo (Bazin):</span>
                          <span className="font-bold text-emerald-400">{opp.fairPrice}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-400 block">DY 12M:</span>
                          <span className="font-bold text-emerald-400">{opp.dividendYield}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-400 block">Potencial Upside:</span>
                          <span className="font-bold text-emerald-400">{opp.upsidePotential}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-zinc-300 leading-relaxed">
                        {opp.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signals for all assets */}
              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Sinais Individuais da Carteira
                </h4>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {aiInvestmentsAnalysis.assetSignals?.map((sig, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-zinc-900 dark:text-white w-16">
                          {sig.ticker}
                        </span>
                        <span className="text-zinc-600 dark:text-zinc-300">{sig.note}</span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                          sig.signal === 'COMPRAR'
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : sig.signal === 'MANTER'
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                            : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {sig.signal}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. CHAT TAB */}
      {aiSubTab === 'chat' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col h-[520px]">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span className="text-[10px] opacity-70 block text-right mt-1.5">{msg.time}</span>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                  </div>
                )}
              </div>
            ))}
            {isSendingChat && (
              <div className="flex items-center gap-2 text-xs text-zinc-400 italic">
                <Bot className="w-4 h-4 animate-bounce" />
                <span>FinVance AI pensando...</span>
              </div>
            )}
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSendMessage} className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
            <input
              type="text"
              placeholder="Pergunte sobre seus gastos, orçamentos, ações ou FIIs..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={isSendingChat || !chatInput.trim()}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-md transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
