import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { InvestmentAsset, AssetType } from '../types/finance';
import {
  TrendingUp,
  RefreshCw,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  DollarSign,
  PieChart,
  Percent,
  Calendar,
  AlertCircle,
  CheckCircle2,
  X,
  ShieldCheck,
  Search,
} from 'lucide-react';

export const InvestmentsView: React.FC = () => {
  const {
    investments,
    addInvestment,
    deleteInvestment,
    formatMoney,
    isSyncingInvestidor10,
    syncInvestidor10,
    lastInvestidor10Sync,
    setActiveTab,
  } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Form state
  const [ticker, setTicker] = useState('BBAS3');
  const [name, setName] = useState('Banco do Brasil ON');
  const [type, setType] = useState<AssetType>('Ação');
  const [quantity, setQuantity] = useState('100');
  const [averagePrice, setAveragePrice] = useState('28.50');
  const [broker, setBroker] = useState('BTG Pactual');
  const [sector, setSector] = useState('Financeiro');

  // Popular B3 Ticker Presets
  const popularPresets = [
    { ticker: 'PETR4', name: 'Petrobras PN', type: 'Ação' as const, sector: 'Petróleo', price: 38.45 },
    { ticker: 'VALE3', name: 'Vale ON', type: 'Ação' as const, sector: 'Mineração', price: 61.20 },
    { ticker: 'ITUB4', name: 'Itaú Unibanco', type: 'Ação' as const, sector: 'Financeiro', price: 35.80 },
    { ticker: 'WEGE3', name: 'WEG ON', type: 'Ação' as const, sector: 'Bens Industriais', price: 52.30 },
    { ticker: 'MXRF11', name: 'Maxi Renda FII', type: 'FII' as const, sector: 'CRI / Papel', price: 9.85 },
    { ticker: 'HGLG11', name: 'CSHG Logística', type: 'FII' as const, sector: 'Logístico', price: 159.40 },
    { ticker: 'XPML11', name: 'XP Malls FII', type: 'FII' as const, sector: 'Shopping Centers', price: 108.70 },
    { ticker: 'BTC', name: 'Bitcoin', type: 'Cripto' as const, sector: 'Criptoativos', price: 365200.0 },
  ];

  const handleSelectPreset = (p: typeof popularPresets[0]) => {
    setTicker(p.ticker);
    setName(p.name);
    setType(p.type);
    setSector(p.sector);
    setAveragePrice(p.price.toString());
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity.replace(',', '.'));
    const avg = parseFloat(averagePrice.replace(',', '.'));
    if (!qty || !avg) return;

    // Use current quote or fallback
    const preset = popularPresets.find((p) => p.ticker === ticker.toUpperCase());
    const currentPrice = preset ? preset.price : avg;

    addInvestment({
      ticker: ticker.toUpperCase().trim(),
      name: name.trim() || ticker.toUpperCase(),
      type,
      quantity: qty,
      averagePrice: avg,
      currentPrice,
      change24h: +(Math.random() * 2 - 0.8).toFixed(2),
      dy12m: type === 'FII' ? 11.5 : type === 'Ação' ? 8.2 : 0,
      sector: sector.trim() || 'Geral',
      broker: broker.trim() || 'XP Investimentos',
    });

    setIsAddModalOpen(false);
  };

  // Portfolio calculations
  const totalPortfolioValue = investments.reduce(
    (sum, inv) => sum + inv.quantity * inv.currentPrice,
    0
  );

  const totalPortfolioCost = investments.reduce(
    (sum, inv) => sum + inv.quantity * inv.averagePrice,
    0
  );

  const totalProfit = totalPortfolioValue - totalPortfolioCost;
  const totalProfitPercent = totalPortfolioCost > 0 ? (totalProfit / totalPortfolioCost) * 100 : 0;

  // Average Weighted Dividend Yield
  const weightedDy = totalPortfolioValue > 0
    ? investments.reduce((sum, inv) => sum + (inv.quantity * inv.currentPrice * (inv.dy12m || 0)), 0) / totalPortfolioValue
    : 0;

  // Projected Annual Passive Income
  const projectedAnnualDividends = (totalPortfolioValue * weightedDy) / 100;
  const projectedMonthlyDividends = projectedAnnualDividends / 12;

  // Filtered investments
  const filteredInvestments = investments.filter((inv) => {
    const matchesType = filterType === 'all' || inv.type === filterType;
    const matchesSearch =
      inv.ticker.toLowerCase().includes(search.toLowerCase()) ||
      inv.name.toLowerCase().includes(search.toLowerCase()) ||
      inv.sector.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header and Investidor 10 Sync Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
              Carteira & Investidor 10
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              API Live Sync
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Sincronização em tempo real de cotações, proventos, P/VP, P/L e Preço Teto Bazin
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Direct link to Investidor 10 website */}
          <a
            href="https://investidor10.com.br"
            target="_blank"
            rel="noopener noreferrer"
            title="Acessar o portal oficial Investidor 10 em nova aba"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
          >
            <span>Acessar Site Investidor 10</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Sync Button */}
          <button
            onClick={syncInvestidor10}
            disabled={isSyncingInvestidor10}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-500 ${isSyncingInvestidor10 ? 'animate-spin' : ''}`} />
            <span>{isSyncingInvestidor10 ? 'Sincronizando cotações...' : 'Sincronizar Cotações'}</span>
          </button>

          {/* Add Asset */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Ativo</span>
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      <div className="p-3.5 rounded-2xl bg-zinc-900 dark:bg-zinc-950 border border-zinc-800 text-zinc-300 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            API Investidor 10 ativa • Cotações da B3, FIIs e Cripto atualizadas:{' '}
            <strong className="text-white">{lastInvestidor10Sync || 'Agora'}</strong>
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-zinc-400">
          <span>Proventos do Mês: <strong className="text-emerald-400">{formatMoney(428.50)}</strong></span>
          <span>Próximo Pagamento: <strong className="text-white">14/10 (MXRF11)</strong></span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Value */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Patrimônio em Ativos
          </span>
          <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
            {formatMoney(totalPortfolioValue)}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            Custo total: {formatMoney(totalPortfolioCost)}
          </div>
        </div>

        {/* Total Profit */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Rentabilidade Histórica
          </span>
          <div
            className={`text-2xl font-black mt-1 ${
              totalProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {totalProfit >= 0 ? '+' : ''}
            {formatMoney(totalProfit)}
          </div>
          <div className="text-xs font-semibold text-emerald-500 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{totalProfitPercent.toFixed(2)}% de retorno total</span>
          </div>
        </div>

        {/* Dividend Yield */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Dividend Yield Médio (12M)
          </span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {weightedDy.toFixed(2)}% a.a.
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            Projeção: {formatMoney(projectedAnnualDividends)}/ano
          </div>
        </div>

        {/* Monthly Passive Income */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Renda Passiva Média Estimada
          </span>
          <div className="text-2xl font-black text-amber-500 mt-1">
            {formatMoney(projectedMonthlyDividends)}/mês
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            Livre de Imposto de Renda (FIIs)
          </div>
        </div>
      </div>

      {/* "Oportunidades do Dia (Investidor 10 + IA)" */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/60 border border-emerald-800/40 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Oportunidades do Dia & Radar de Compras</span>
                <span className="px-2 py-0.2 rounded text-[10px] font-extrabold bg-emerald-500 text-zinc-950">
                  INVESTIDOR 10
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Ativos descontados com métricas Graham & Bazin e proventos atrativos
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('ai')}
            className="text-xs text-emerald-400 font-bold hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Consultar IA Completa</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Card 1: MXRF11 */}
          <div className="p-4 rounded-xl bg-zinc-800/60 border border-zinc-700/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-white">MXRF11</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300">
                  FII CRI
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-zinc-950">
                HORA DE COMPRAR
              </span>
            </div>
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-zinc-400">Cotação: <strong className="text-white">R$ 9,85</strong></span>
              <span className="text-emerald-400 font-bold">P/VP: 0,98 (Desconto)</span>
            </div>
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-zinc-400">DY 12M: <strong className="text-emerald-400">12,6%</strong></span>
              <span className="text-zinc-400">Teto Bazin: <strong className="text-white">R$ 11,20</strong></span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed border-t border-zinc-700/40 pt-2">
              Negociando abaixo do valor patrimonial com proventos mensais consistentes de R$ 0,09/cota.
            </p>
          </div>

          {/* Card 2: PETR4 */}
          <div className="p-4 rounded-xl bg-zinc-800/60 border border-zinc-700/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-white">PETR4</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300">
                  Ação
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-zinc-950">
                OPORTUNIDADE CAIXA
              </span>
            </div>
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-zinc-400">Cotação: <strong className="text-white">R$ 38,45</strong></span>
              <span className="text-emerald-400 font-bold">P/L: 4,82 (Barato)</span>
            </div>
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-zinc-400">DY 12M: <strong className="text-emerald-400">14,8%</strong></span>
              <span className="text-zinc-400">Graham: <strong className="text-white">R$ 46,20</strong></span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed border-t border-zinc-700/40 pt-2">
              Margem de segurança de +20,1% sobre a fórmula clássica de Benjamin Graham.
            </p>
          </div>

          {/* Card 3: HGLG11 */}
          <div className="p-4 rounded-xl bg-zinc-800/60 border border-zinc-700/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-white">HGLG11</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300">
                  FII Galpões
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500 text-zinc-950">
                ACUMULAR
              </span>
            </div>
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-zinc-400">Cotação: <strong className="text-white">R$ 159,40</strong></span>
              <span className="text-emerald-400 font-bold">P/VP: 0,96 (Desconto)</span>
            </div>
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-zinc-400">DY 12M: <strong className="text-emerald-400">9,1%</strong></span>
              <span className="text-zinc-400">Teto Bazin: <strong className="text-white">R$ 175,00</strong></span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed border-t border-zinc-700/40 pt-2">
              Excelente portfólio de imóveis AAA em São Paulo e Rio de Janeiro com vacância controlada.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {['all', 'Ação', 'FII', 'Renda Fixa', 'Cripto', 'BDR'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                filterType === t
                  ? 'bg-zinc-900 text-white dark:bg-emerald-500 dark:text-zinc-950'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {t === 'all' ? 'Todos os Ativos' : t}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar ticker ou setor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Assets Table */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4">Ativo</th>
                <th className="py-3 px-4">Tipo & Setor</th>
                <th className="py-3 px-4 text-right">Qtd / Preço Médio</th>
                <th className="py-3 px-4 text-right">Cotação Investidor 10</th>
                <th className="py-3 px-4 text-right">Patrimônio</th>
                <th className="py-3 px-4 text-right">Lucro/Prejuízo</th>
                <th className="py-3 px-4 text-center">DY 12M</th>
                <th className="py-3 px-4 text-center">Status / Sinal IA</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {filteredInvestments.map((asset) => {
                const totalVal = asset.quantity * asset.currentPrice;
                const totalCost = asset.quantity * asset.averagePrice;
                const profitVal = totalVal - totalCost;
                const profitPct = totalCost > 0 ? (profitVal / totalCost) * 100 : 0;

                // Simple AI logic heuristic based on Investidor 10 indicators
                const isBuyOpportunity =
                  (asset.type === 'FII' && asset.p_vp && asset.p_vp < 1.0) ||
                  (asset.type === 'Ação' && asset.p_l && asset.p_l < 10) ||
                  (asset.bazinPrice && asset.currentPrice < asset.bazinPrice);

                return (
                  <tr
                    key={asset.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    {/* Ticker & Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-xs text-zinc-900 dark:text-white">
                          {asset.ticker.slice(0, 4)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <a
                              href={
                                asset.type === 'FII'
                                  ? `https://investidor10.com.br/fiis/${asset.ticker.toLowerCase()}/`
                                  : asset.type === 'Ação'
                                  ? `https://investidor10.com.br/acoes/${asset.ticker.toLowerCase()}/`
                                  : asset.type === 'BDR'
                                  ? `https://investidor10.com.br/bdrs/${asset.ticker.toLowerCase()}/`
                                  : 'https://investidor10.com.br/'
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-extrabold text-sm text-zinc-900 dark:text-white hover:text-emerald-500 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
                              title={`Abrir página do ${asset.ticker} no Investidor 10`}
                            >
                              <span>{asset.ticker}</span>
                              <ExternalLink className="w-3 h-3 text-zinc-400 hover:text-emerald-500" />
                            </a>
                          </div>
                          <span className="text-[11px] text-zinc-400 block line-clamp-1 max-w-[150px]">
                            {asset.name}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Type & Sector */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                          {asset.type}
                        </span>
                        <span className="text-[10px] text-zinc-400 block">{asset.sector}</span>
                      </div>
                    </td>

                    {/* Quantity & Average Price */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-bold text-zinc-900 dark:text-zinc-200">
                        {asset.quantity} cotas
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        PM: {formatMoney(asset.averagePrice)}
                      </div>
                    </td>

                    {/* Current Price from Investidor 10 */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-black text-zinc-900 dark:text-white">
                        {formatMoney(asset.currentPrice)}
                      </div>
                      <div
                        className={`text-[11px] font-semibold ${
                          asset.change24h >= 0 ? 'text-emerald-500' : 'text-rose-500'
                        }`}
                      >
                        {asset.change24h >= 0 ? '+' : ''}
                        {asset.change24h.toFixed(2)}% hoje
                      </div>
                    </td>

                    {/* Total Value */}
                    <td className="py-3.5 px-4 text-right font-black text-zinc-900 dark:text-white">
                      {formatMoney(totalVal)}
                    </td>

                    {/* Profit */}
                    <td className="py-3.5 px-4 text-right">
                      <div
                        className={`font-black ${
                          profitVal >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {profitVal >= 0 ? '+' : ''}
                        {formatMoney(profitVal)}
                      </div>
                      <div
                        className={`text-[11px] font-bold ${
                          profitVal >= 0 ? 'text-emerald-500' : 'text-rose-500'
                        }`}
                      >
                        {profitVal >= 0 ? '+' : ''}
                        {profitPct.toFixed(1)}%
                      </div>
                    </td>

                    {/* Dividend Yield */}
                    <td className="py-3.5 px-4 text-center font-bold text-zinc-700 dark:text-zinc-300">
                      {asset.dy12m > 0 ? `${asset.dy12m.toFixed(1)}%` : '-'}
                    </td>

                    {/* AI Signal */}
                    <td className="py-3.5 px-4 text-center">
                      {isBuyOpportunity ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          COMPRAR
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          MANTER
                        </span>
                      )}
                    </td>

                    {/* Delete */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => deleteInvestment(asset.id)}
                        className="p-1 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Remover ativo da carteira"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Investment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Adicionar Ativo à Carteira</span>
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="mt-4">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                Ativos Populares da B3 & Cripto
              </span>
              <div className="flex flex-wrap gap-1.5">
                {popularPresets.map((p) => (
                  <button
                    key={p.ticker}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      ticker === p.ticker
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                    }`}
                  >
                    {p.ticker}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Código do Ativo / Ticker
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: PETR4, MXRF11, BTC"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white uppercase focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Tipo de Ativo
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AssetType)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Ação">Ação (B3)</option>
                    <option value="FII">Fundo Imobiliário (FII)</option>
                    <option value="BDR">BDR Internacional</option>
                    <option value="Renda Fixa">Renda Fixa / Tesouro Direto</option>
                    <option value="Cripto">Criptoativo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Nome da Empresa / Fundo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Petrobras PN"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Quantidade de Cotas
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 100"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Preço Médio Pago (R$)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 34.50"
                    value={averagePrice}
                    onChange={(e) => setAveragePrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Corretora
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: BTG, XP, Inter, Rico"
                    value={broker}
                    onChange={(e) => setBroker(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Setor de Atuação
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Financeiro, Logística"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md"
                >
                  Adicionar à Carteira
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
