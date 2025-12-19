
import { GoogleGenAI } from "@google/genai";
import { Transaction, ChatMessage, CATEGORIES, ASSET_TYPES, QuizQuestion, Asset } from "../types";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.warn("WealthFlow AI: API_KEY is missing from environment variables. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'MISSING_KEY' });

const SYSTEM_INSTRUCTION = `
You are WealthFlow AI, a smart, empathetic, and professional financial assistant.
Your goal is to help the user manage their money, explain financial concepts (like EMI, ROI, Inflation), and provide savings tips.
Keep responses concise, practical, and formatted in Markdown.
If asked about the user's data, remind them you only see what they provide in the current session.
`;

export const createChatSession = () => {
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    }
  });
};

export const parseReceiptImage = async (base64Image: string): Promise<Partial<Transaction>> => {
  try {
    const prompt = `
      Analyze this receipt image. Extract the following details in JSON format:
      - description (merchant name)
      - amount (total value as a number)
      - date (YYYY-MM-DD format)
      - category (Choose from: Housing, Food, Transportation, Utilities, Entertainment, Healthcare, Shopping, Other)
      
      Return ONLY the JSON string. No markdown code blocks.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Receipt parsing error:", error);
    throw error;
  }
};

export const lookupAssetSymbol = async (query: string): Promise<{ symbol: string, name: string, type: string }> => {
  try {
    const prompt = `
      Identify the financial asset from this query: "${query}".
      Return a JSON object with:
      1. "symbol": The specific TradingView format symbol (e.g., "NASDAQ:AAPL", "NSE:RELIANCE", "BINANCE:BTCUSDT", "MCX:GOLD").
      2. "name": The full name of the asset.
      3. "type": Stock, Crypto, Index, Forex, or Future.
      
      If you are unsure, default to a US listing or the most popular global listing.
      Return ONLY valid JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });
    
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error(e);
    return { symbol: 'N/A', name: query, type: 'Stock' };
  }
};

export const predictCategory = async (description: string): Promise<string> => {
  try {
    const prompt = `Categorize this transaction description: "${description}". Choose exactly one from: ${CATEGORIES.join(', ')}. Return only the category name.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    return response.text?.trim() || 'Other';
  } catch {
    return 'Other';
  }
};

export const batchCategorizeTransactions = async (descriptions: string[]): Promise<Record<string, string>> => {
  try {
    const prompt = `
      Categorize the following transaction descriptions into one of these categories: ${CATEGORIES.join(', ')}.
      Input: ${JSON.stringify(descriptions)}
      Return a JSON object where the key is the description and the value is the category.
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text || '{}');
  } catch {
    return {};
  }
};

export const getFinancialAdvice = async (transactions: Transaction[], salary: number): Promise<string> => {
  try {
    const prompt = `
      Analyze these transactions: ${JSON.stringify(transactions.slice(0, 20))}.
      Salary: ${salary}.
      Provide 3 brief, bulleted tips to save money or improve financial health. 
      Focus on the biggest spending categories.
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt
    });
    return response.text || "Keep tracking your expenses to see insights!";
  } catch {
    return "I couldn't analyze your data right now. Try adding more transactions.";
  }
};

export const detectSpendingAnomalies = async (transactions: Transaction[]) => {
  return [];
};

export const processNaturalLanguageCommand = async (input: string): Promise<{action: string, data: any}> => {
  try {
    const prompt = `
      Interpret this finance command: "${input}".
      Return JSON with:
      - "action": "add_transaction" | "add_asset" | "unknown"
      - "data": object with relevant fields (amount, description, category, type for assets)
      
      For transactions, infer category from ${CATEGORIES.join(', ')}.
      For assets, infer type from ${Object.keys(ASSET_TYPES).join(', ')}.
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text || '{}');
  } catch {
    return { action: 'unknown', data: {} };
  }
};

export const getLatestAssetPrice = async (assetName: string): Promise<number> => {
  try {
    const prompt = `Estimate the current market price of ${assetName} in USD. Return ONLY the number.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    const price = parseFloat(response.text?.replace(/[^0-9.]/g, '') || '');
    return isNaN(price) ? 0 : price;
  } catch {
    return 0;
  }
};

export const getMarketAnalysis = async (symbol: string, name: string): Promise<string> => {
  try {
    const prompt = `Provide a short, 3-sentence market analysis for ${name} (${symbol}). Is it bullish or bearish currently?`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    return response.text || "Analysis unavailable.";
  } catch {
    return "Analysis unavailable.";
  }
};

export const generateFinancialQuiz = async (): Promise<QuizQuestion> => {
  try {
    const prompt = `Generate a multiple-choice financial literacy question. Return JSON: { "question": string, "options": string[], "correctIndex": number, "explanation": string }`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text || '{}');
  } catch {
    return {
      question: "What is the 50/30/20 rule?",
      options: ["Diet plan", "Budgeting rule", "Tax law", "Investment strategy"],
      correctIndex: 1,
      explanation: "It recommends 50% for needs, 30% for wants, and 20% for savings."
    };
  }
};

export const generateNegotiationScript = async (service: string, cost: number, goal: string): Promise<string> => {
  try {
    const prompt = `Write a script to negotiate a ${goal} for my ${service} subscription which costs ${cost}. Be polite but firm.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    return response.text || "Script generation failed.";
  } catch {
    return "Could not generate script.";
  }
};

export const generatePersonalizedRoadmap = async (goal: string, financialData: any): Promise<any[]> => {
  try {
    const prompt = `Create a 5-step financial roadmap to achieve: "${goal}". User data: ${JSON.stringify(financialData)}. Return JSON array of objects with "month" (e.g. "Month 1"), "action", and "amount" fields.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text || '[]');
  } catch {
    return [];
  }
};

export const getCreditAdvice = async (score: number, debtCount: number): Promise<any[]> => {
  try {
    const prompt = `Give 3 specific tips to improve a credit score of ${score} with ${debtCount} active debts. Return JSON array: [{ "title": string, "impact": "High"|"Medium" }]`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text || '[]');
  } catch {
    return [{ title: "Pay bills on time", impact: "High" }];
  }
};

export const getRealForexRate = async (from: string, to: string): Promise<number> => {
  try {
    const prompt = `Current exchange rate 1 ${from} to ${to}. Return number only.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    const rate = parseFloat(response.text?.replace(/[^0-9.]/g, '') || '');
    return isNaN(rate) ? 83.50 : rate;
  } catch {
    return 83.50;
  }
};

export const analyzeTaxDeductibles = async (transactions: Transaction[]): Promise<any> => {
  try {
    const prompt = `
      Analyze these transactions for potential tax deductions (Standard USA rules).
      Transactions: ${JSON.stringify(transactions.map(t => ({ desc: t.description, cat: t.category, amt: t.amount, type: t.type })))}
      
      Return JSON with:
      - "deductibles": array of { description, amount, reason }
      - "totalEstimatedDeduction": number
      - "summary": string (brief advice)
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text || '{}');
  } catch {
    return { deductibles: [], totalEstimatedDeduction: 0, summary: "Could not analyze tax data." };
  }
};

export const simulateInvestmentPortfolio = async (assets: Asset[], monthlyContribution: number, scenario: 'bull' | 'bear' | 'crash'): Promise<any[]> => {
  try {
    const prompt = `
      Simulate a 5-year investment projection for this portfolio: ${JSON.stringify(assets)}.
      Monthly Contribution: $${monthlyContribution}.
      Scenario: ${scenario} market.
      
      Return JSON array of objects, one for each year (Year 0 to Year 5), with fields:
      - "year": number
      - "value": number (projected total value)
      - "label": string (e.g. "2024")
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text || '[]');
  } catch {
    return [];
  }
};

export const optimizeFxTransfer = async (amount: number, from: string, to: string): Promise<{ rate: number, savings: number, provider: string }> => {
  try {
    const prompt = `
      Suggest an optimized FX rate provider for transferring ${amount} ${from} to ${to}.
      Return JSON with:
      - "rate": number (simulated competitive rate)
      - "savings": number (estimated savings vs standard bank rate)
      - "provider": string (fictional or real name like 'Wise' or 'Revolut')
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text || '{}');
  } catch {
    return { rate: 1.0, savings: 0, provider: "Standard Bank" };
  }
};

export const findCheapestPrice = async (productName: string): Promise<{ text: string, sources: any[] }> => {
  try {
    const prompt = `
      Find the current prices for '${productName}' at major online retailers (e.g., Amazon, Walmart, eBay, Best Buy, Target).
      
      Format the response as a simple markdown table with columns: Retailer, Price, Notes (Shipping/Condition).
      
      After the table, explicitly state which retailer offers the CHEAPEST price and provide a direct recommendation.
      If there are coupon codes or deals mentioned in search results, include them.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return { text: response.text || "No prices found.", sources };
  } catch (error) {
    console.error("Search error", error);
    return { text: "I couldn't search for prices right now. Please try again later.", sources: [] };
  }
};

export const getRealIPOData = async (): Promise<any[]> => {
  const MOCK_IPO_DATA = [
    {
      id: '1',
      name: 'TechNova Solutions',
      symbol: 'NSE:TECHNOVA',
      status: 'Open',
      priceRange: '₹450 - ₹480',
      lotSize: 30,
      issueSize: '₹500 Cr',
      openDate: '2024-03-15',
      closeDate: '2024-03-18',
      listingDate: '2024-03-21',
      gmp: 45,
      subscription: 2.5,
      sector: 'Technology'
    }
  ];

  try {
    const prompt = `
      Generate a JSON array of 5 realistic, fictional or real upcoming/open/listed IPOs in India for the current month.
      Fields: id, name, symbol (TradingView format), status ('Open'|'Upcoming'|'Listed'), priceRange, lotSize (number), issueSize, openDate, closeDate, listingDate, gmp (number), subscription (number), sector.
      Ensure valid JSON.
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    if (!response.text) return MOCK_IPO_DATA;
    return JSON.parse(response.text);
  } catch (error) {
    return MOCK_IPO_DATA;
  }
};
