import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
app.use(express.json());

// Initialize Gemini SDK with User-Agent as required by AI Studio guidelines
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Mock database / cache for Investidor 10 market quotes
const MARKET_QUOTES: Record<string, {
  ticker: string;
  name: string;
  type: 'Ação' | 'FII' | 'BDR' | 'Renda Fixa' | 'Cripto';
  price: number;
  change24h: number;
  p_l?: number;
  p_vp?: number;
  dy12m: number;
  grahamPrice?: number;
  bazinPrice?: number;
  lastDividend?: number;
  nextDividendDate?: string;
  sector: string;
}> = {
  PETR4: {
    ticker: 'PETR4',
    name: 'Petrobras PN',
    type: 'Ação',
    price: 38.45,
    change24h: 1.25,
    p_l: 4.82,
    p_vp: 1.15,
    dy12m: 14.8,
    grahamPrice: 46.20,
    bazinPrice: 42.50,
    lastDividend: 1.42,
    nextDividendDate: '2026-10-15',
    sector: 'Petróleo e Gás',
  },
  VALE3: {
    ticker: 'VALE3',
    name: 'Vale ON',
    type: 'Ação',
    price: 61.20,
    change24h: -0.65,
    p_l: 6.10,
    p_vp: 1.28,
    dy12m: 9.4,
    grahamPrice: 74.80,
    bazinPrice: 68.00,
    lastDividend: 2.10,
    nextDividendDate: '2026-11-20',
    sector: 'Mineração',
  },
  ITUB4: {
    ticker: 'ITUB4',
    name: 'Itaú Unibanco PN',
    type: 'Ação',
    price: 35.80,
    change24h: 0.85,
    p_l: 8.50,
    p_vp: 1.62,
    dy12m: 7.2,
    grahamPrice: 39.50,
    bazinPrice: 38.00,
    lastDividend: 0.32,
    nextDividendDate: '2026-10-01',
    sector: 'Financeiro',
  },
  WEGE3: {
    ticker: 'WEGE3',
    name: 'WEG ON',
    type: 'Ação',
    price: 52.30,
    change24h: 1.95,
    p_l: 32.4,
    p_vp: 10.8,
    dy12m: 1.8,
    grahamPrice: 28.50,
    bazinPrice: 22.00,
    lastDividend: 0.18,
    nextDividendDate: '2026-10-25',
    sector: 'Bens Industriais',
  },
  MXRF11: {
    ticker: 'MXRF11',
    name: 'Maxi Renda FII',
    type: 'FII',
    price: 9.85,
    change24h: 0.20,
    p_vp: 0.98,
    dy12m: 12.6,
    bazinPrice: 11.20,
    lastDividend: 0.09,
    nextDividendDate: '2026-10-14',
    sector: 'FII Papel / CRI',
  },
  HGLG11: {
    ticker: 'HGLG11',
    name: 'CSHG Logística FII',
    type: 'FII',
    price: 159.40,
    change24h: -0.30,
    p_vp: 0.96,
    dy12m: 9.1,
    bazinPrice: 175.00,
    lastDividend: 1.10,
    nextDividendDate: '2026-10-15',
    sector: 'FII Logístico',
  },
  XPML11: {
    ticker: 'XPML11',
    name: 'XP Malls FII',
    type: 'FII',
    price: 108.70,
    change24h: 0.45,
    p_vp: 0.94,
    dy12m: 9.8,
    bazinPrice: 120.00,
    lastDividend: 0.92,
    nextDividendDate: '2026-10-25',
    sector: 'FII Shopping Centers',
  },
  KNCR11: {
    ticker: 'KNCR11',
    name: 'Kinea Rendimentos Imobiliários',
    type: 'FII',
    price: 102.30,
    change24h: 0.10,
    p_vp: 1.01,
    dy12m: 13.2,
    bazinPrice: 110.00,
    lastDividend: 1.02,
    nextDividendDate: '2026-10-14',
    sector: 'FII Papel / CDI',
  },
  AAPL34: {
    ticker: 'AAPL34',
    name: 'Apple BDR',
    type: 'BDR',
    price: 68.90,
    change24h: 1.40,
    p_l: 31.2,
    p_vp: 45.0,
    dy12m: 0.6,
    sector: 'Tecnologia Global',
  },
  BTC: {
    ticker: 'BTC',
    name: 'Bitcoin',
    type: 'Cripto',
    price: 365200.0,
    change24h: 2.80,
    dy12m: 0.0,
    sector: 'Criptoativos',
  },
  ETH: {
    ticker: 'ETH',
    name: 'Ethereum',
    type: 'Cripto',
    price: 18450.0,
    change24h: 1.10,
    dy12m: 0.0,
    sector: 'Criptoativos',
  },
  TESOURO_SELIC: {
    ticker: 'TESOURO_SELIC',
    name: 'Tesouro Selic 2029',
    type: 'Renda Fixa',
    price: 14850.20,
    change24h: 0.04,
    dy12m: 10.75,
    sector: 'Títulos Públicos',
  },
};

// 1. API: Quotes from Investidor 10
app.get('/api/investidor10/quotes', (req: Request, res: Response) => {
  res.json({
    source: 'Investidor 10 API (Sync Feed)',
    lastUpdate: new Date().toISOString(),
    quotes: MARKET_QUOTES,
  });
});

// 2. API: Trigger Sync with Investidor 10
app.post('/api/investidor10/sync', (req: Request, res: Response) => {
  // Apply realistic micro-fluctuations to simulate live sync
  const updatedQuotes: typeof MARKET_QUOTES = {};
  for (const [key, quote] of Object.entries(MARKET_QUOTES)) {
    const deltaPercent = (Math.random() * 0.8 - 0.38); // -0.38% to +0.42%
    const newPrice = +(quote.price * (1 + deltaPercent / 100)).toFixed(2);
    const newChange = +(quote.change24h + (Math.random() * 0.2 - 0.1)).toFixed(2);
    updatedQuotes[key] = {
      ...quote,
      price: newPrice,
      change24h: newChange,
    };
  }
  Object.assign(MARKET_QUOTES, updatedQuotes);

  res.json({
    success: true,
    message: 'Investimentos sincronizados com sucesso via Investidor 10!',
    syncTimestamp: new Date().toISOString(),
    totalAssetsTracked: Object.keys(updatedQuotes).length,
    quotes: updatedQuotes,
  });
});

// 3. API: Gemini AI Expenses Analysis & Savings Suggestions
app.post('/api/gemini/analyze-expenses', async (req: Request, res: Response) => {
  try {
    const { income, expenses, budgets, month } = req.body;

    if (!apiKey) {
      // Fallback response if API key is not configured in local environment
      return res.json({
        overallHealthScore: 78,
        summary: `No mês de ${month || 'atual'}, seus gastos representam uma proporção equilibrada da sua renda, mas há oportunidades de otimização em Delivery e Lazer.`,
        keyInsights: [
          'Você gastou mais em Alimentação fora de casa do que o planejado.',
          'Sua reserva para investimentos atingiu a meta inicial de 15% da renda.',
          'Custos fixos com assinaturas digitais podem ser reduzidos em até R$ 85,00/mês.',
        ],
        monthlySavingsTips: [
          {
            category: 'Alimentação',
            action: 'Reduzir pedidos de delivery para 1x na semana',
            potentialMonthlySaving: 320.0,
            impact: 'Alto',
          },
          {
            category: 'Lazer e Streaming',
            action: 'Cancelar serviços de streaming com baixo uso e migrar para plano família',
            potentialMonthlySaving: 64.9,
            impact: 'Médio',
          },
          {
            category: 'Contas Fixas',
            action: 'Renegociar plano de internet banda larga e operadora móvel',
            potentialMonthlySaving: 80.0,
            impact: 'Médio',
          },
        ],
        budgetAlerts: [
          'Atenção: A categoria Alimentação ultrapassou 85% do teto estipulado.',
        ],
        rule50_30_20: {
          needsPercentage: 52,
          wantsPercentage: 28,
          savingsPercentage: 20,
          assessment: 'Excelente! Sua distribuição está muito próxima da regra padrão de ouro 50-30-20.',
        },
      });
    }

    const prompt = `Você é um consultor financeiro sênior brasileiro especialista em finanças pessoais e economia doméstica.
Analise os dados financeiros do usuário abaixo para o mês de ${month || 'vigente'}:
Renda Mensal: R$ ${income || 0}
Despesas por Categoria: ${JSON.stringify(expenses || [])}
Orçamentos Definidos: ${JSON.stringify(budgets || [])}

Retorne ESTRITAMENTE um JSON válido (sem tags markdown, sem blocos \`\`\`json) com a seguinte estrutura:
{
  "overallHealthScore": <número de 0 a 100>,
  "summary": "<resumo executivo profissional de 2 a 3 frases>",
  "keyInsights": ["<insight 1>", "<insight 2>", "<insight 3>"],
  "monthlySavingsTips": [
    {
      "category": "<nome da categoria>",
      "action": "<ação clara e prática para economizar>",
      "potentialMonthlySaving": <valor numérico estimado em R$>,
      "impact": "<Alto | Médio | Baixo>"
    }
  ],
  "budgetAlerts": ["<alerta de teto excedido ou próximo>"],
  "rule50_30_20": {
    "needsPercentage": <número>,
    "wantsPercentage": <número>,
    "savingsPercentage": <número>,
    "assessment": "<avaliação da conformidade com 50% necessidades, 30% desejos, 20% poupança/investimentos>"
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const json = JSON.parse(text);
    res.json(json);
  } catch (error: any) {
    console.error('Error analyzing expenses with Gemini:', error);
    res.status(500).json({ error: error.message || 'Erro ao analisar gastos com a IA' });
  }
});

// 4. API: Gemini AI Investment Strategy & Daily Opportunities (Investidor 10 powered)
app.post('/api/gemini/analyze-investments', async (req: Request, res: Response) => {
  try {
    const { portfolio, marketQuotes } = req.body;

    if (!apiKey) {
      // High quality fallback
      return res.json({
        marketSentiment: 'Mercado favorável para FIIs com P/VP com desconto e Ações pagadoras de dividendos com P/L atrativo.',
        portfolioHealth: 'Carteira bem diversificada entre Renda Fixa, Fundos Imobiliários e Ações de valor.',
        opportunities: [
          {
            ticker: 'MXRF11',
            type: 'FII',
            recommendation: 'COMPRAR (Oportunidade do Dia)',
            fairPrice: 'R$ 10,80',
            currentPrice: 'R$ 9,85',
            upsidePotential: '+9.6%',
            dividendYield: '12.6%',
            reason: 'Negociando abaixo do valor patrimonial (P/VP 0,98) com proventos mensais consistentes e alta liquidez na B3.',
          },
          {
            ticker: 'PETR4',
            type: 'Ação',
            recommendation: 'COMPRAR (Geração de Caixa)',
            fairPrice: 'R$ 44,50',
            currentPrice: 'R$ 38,45',
            upsidePotential: '+15.7%',
            dividendYield: '14.8%',
            reason: 'P/L de 4,82 muito abaixo da média histórica e forte pagamento de dividendos extraordinários.',
          },
          {
            ticker: 'HGLG11',
            type: 'FII',
            recommendation: 'COMPRAR / ACUMULAR',
            fairPrice: 'R$ 170,00',
            currentPrice: 'R$ 159,40',
            upsidePotential: '+6.6%',
            dividendYield: '9.1%',
            reason: 'Galpões logísticos de alto padrão AAA com vacância baixa e P/VP de 0,96.',
          },
        ],
        assetSignals: [
          { ticker: 'MXRF11', signal: 'COMPRAR', note: 'Hora excelente para aporte mensal.' },
          { ticker: 'PETR4', signal: 'COMPRAR', note: 'Margem de segurança acima do preço teto Bazin.' },
          { ticker: 'VALE3', signal: 'MANTER', note: 'Aguardar definição de demanda do minério na China.' },
          { ticker: 'WEGE3', signal: 'AGUARDAR_CORREÇÃO', note: 'Múltiplo P/L elevado (32x). Manter em carteira sem novos aportes agressivos.' },
          { ticker: 'BTC', signal: 'APORTE_FRACIONADO', note: 'Estratégia DCA semanal recomendada.' },
        ],
      });
    }

    const prompt = `Você é um analista CNPI sênior e estrategista de investimentos na B3 focado em métricas do Investidor 10 (P/VP, P/L, Dividend Yield, Preço Teto Bazin, Fórmula de Graham).
Analise a carteira de investimentos e as cotações atuais abaixo:
Carteira do usuário: ${JSON.stringify(portfolio || [])}
Cotações Investidor 10: ${JSON.stringify(marketQuotes || MARKET_QUOTES)}

Retorne ESTRITAMENTE um JSON com as recomendações de compra, oportunidades do dia e análise de risco:
{
  "marketSentiment": "<Visão geral do mercado brasileiro atual e juros Selic>",
  "portfolioHealth": "<Avaliação do equilíbrio e diversificação>",
  "opportunities": [
    {
      "ticker": "<Código B3 ou Cripto>",
      "type": "<Ação | FII | BDR | Renda Fixa | Cripto>",
      "recommendation": "<COMPRAR (Oportunidade do Dia) | COMPRAR / ACUMULAR | MANTER | REALIZAR LUCRO>",
      "fairPrice": "<Preço Justo Graham / Bazin formatado em R$>",
      "currentPrice": "<Preço Atual>",
      "upsidePotential": "<Ex: +12.4%>",
      "dividendYield": "<Ex: 11.2%>",
      "reason": "<Justificativa fundamentalista objetiva com base em indicadores>"
    }
  ],
  "assetSignals": [
    {
      "ticker": "<ticker>",
      "signal": "<COMPRAR | MANTER | AGUARDAR_CORREÇÃO | REALIZAR_LUCRO>",
      "note": "<Dica rápida se é a hora de comprar ou aguardar>"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const json = JSON.parse(text);
    res.json(json);
  } catch (error: any) {
    console.error('Error analyzing investments with Gemini:', error);
    res.status(500).json({ error: error.message || 'Erro ao analisar investimentos com a IA' });
  }
});

// 5. API: Gemini AI Interactive Financial Chat
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { messages, context } = req.body;

    if (!apiKey) {
      return res.json({
        reply: 'Olá! Sou seu assistente de finanças e investimentos FinVance. Como posso ajudar com seus gastos, orçamentos ou oportunidades na B3 e Investidor 10 hoje?',
      });
    }

    const systemInstruction = `Você é o FinVance AI, um assistente financeiro pessoal de elite especializado no ecossistema financeiro brasileiro (B3, Tesouro Direto, Pix, Selic, IPCA, Fundos Imobiliários FIIs, Ações e métricas do Investidor 10).
Suas respostas são claras, práticas, encorajadoras e baseadas em dados financeiros sólidos.
Sempre ofereça orientações com cálculos reais de economia, preço teto Bazin/Graham ou redução de gastos.
Contexto do usuário no app: ${JSON.stringify(context || {})}`;

    // Format chat history
    const userPrompt = messages && messages.length > 0 ? messages[messages.length - 1].content : 'Olá';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
      },
    });

    res.json({
      reply: response.text || 'Estou à disposição para responder qualquer dúvida sobre suas finanças!',
    });
  } catch (error: any) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: error.message || 'Erro no chat do assistente' });
  }
});

// 6. API: Open Finance Brazilian Banks integration
app.get('/api/banks/open-finance', (req: Request, res: Response) => {
  res.json({
    openFinanceProtocol: 'Banco Central do Brasil (BCB) Open Finance v3.0',
    banks: [
      {
        id: 'nubank',
        name: 'Nubank',
        code: '260',
        color: '#820ad1',
        connected: true,
        accountNumber: '19482-1',
        balance: 4850.32,
        creditLimit: 12000.0,
        currentInvoice: 2140.50,
        lastSync: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
      {
        id: 'itau',
        name: 'Itaú Unibanco',
        code: '341',
        color: '#ec7000',
        connected: true,
        accountNumber: '40291-8',
        balance: 8920.15,
        creditLimit: 25000.0,
        currentInvoice: 1480.0,
        lastSync: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
      },
      {
        id: 'inter',
        name: 'Banco Inter',
        code: '077',
        color: '#ff7a00',
        connected: true,
        accountNumber: '88392-0',
        balance: 2150.40,
        creditLimit: 8000.0,
        currentInvoice: 420.0,
        lastSync: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'bradesco',
        name: 'Bradesco',
        code: '237',
        color: '#cc092f',
        connected: false,
        accountNumber: '',
        balance: 0,
        creditLimit: 0,
        currentInvoice: 0,
        lastSync: null,
      },
      {
        id: 'santander',
        name: 'Santander Brasil',
        code: '033',
        color: '#ec0000',
        connected: false,
        accountNumber: '',
        balance: 0,
        creditLimit: 0,
        currentInvoice: 0,
        lastSync: null,
      },
      {
        id: 'bb',
        name: 'Banco do Brasil',
        code: '001',
        color: '#f8d117',
        connected: false,
        accountNumber: '',
        balance: 0,
        creditLimit: 0,
        currentInvoice: 0,
        lastSync: null,
      },
      {
        id: 'btg',
        name: 'BTG Pactual',
        code: '208',
        color: '#001e3d',
        connected: false,
        accountNumber: '',
        balance: 0,
        creditLimit: 0,
        currentInvoice: 0,
        lastSync: null,
      },
    ],
  });
});

// 7. API: Multi-Currency Exchange Rates
app.get('/api/currency-rates', (req: Request, res: Response) => {
  res.json({
    base: 'BRL',
    rates: {
      BRL: 1.0,
      USD: 0.18, // 1 BRL = ~0.18 USD (1 USD = ~5.55 BRL)
      EUR: 0.17, // 1 BRL = ~0.17 EUR (1 EUR = ~5.88 BRL)
      BTC: 0.00000274, // 1 BTC = ~365,000 BRL
    },
    symbols: {
      BRL: 'R$',
      USD: '$',
      EUR: '€',
      BTC: '₿',
    },
    updatedAt: new Date().toISOString(),
  });
});

// Configure Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 FinVance Server rodando na porta ${PORT} (dev: http://localhost:${PORT})`);
  });
}

startServer();
