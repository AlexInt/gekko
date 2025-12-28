"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Strategy } from "@/types";
import api from "@/lib/api";
import BacktestConfig from "@/components/backtester/BacktestConfig";
import BacktestResult from "@/components/backtester/BacktestResult";

// Mock Strategies
const MOCK_STRATEGIES: Strategy[] = [
  {
    id: "golden_cross",
    name: "Golden Cross",
    description: "Classic strategy using SMA 50 and SMA 200 crossover.",
    parameters: {
      short_window: 50,
      long_window: 200,
    },
  },
  {
    id: "rsi_strategy",
    name: "RSI Reversal",
    description: "Buy when RSI < 30, Sell when RSI > 70.",
    parameters: {
      period: 14,
      overbought: 70,
      oversold: 30,
    },
  },
  {
    id: "lstm_prediction",
    name: "LSTM AI Model",
    description: "Trade based on LSTM model price predictions.",
    parameters: {
      model_id: "latest",
      threshold: 0.02,
    },
  },
];

export default function StrategiesPage() {
  const t = useTranslations("Strategies");
  const [backtestResult, setBacktestResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunBacktest = async (config: any) => {
    setLoading(true);
    setError(null);
    setBacktestResult(null);

    try {
      const res = await api.post("/backtest/run", config);
      setBacktestResult(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Backtest failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t("title")}
        </h1>
      </div>

      <BacktestConfig
        strategies={MOCK_STRATEGIES}
        onRunBacktest={handleRunBacktest}
        loading={loading}
      />

      {error && (
        <div className="p-4 bg-red-500/10 text-red-600 ring-1 ring-inset ring-red-500/20 rounded-md dark:bg-red-900/20 dark:text-red-400 dark:ring-0 dark:border dark:border-red-900/50">
          Error: {error}
        </div>
      )}

      {backtestResult && <BacktestResult result={backtestResult} />}
    </div>
  );
}
