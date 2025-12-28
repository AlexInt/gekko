"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { Loader2, BrainCircuit } from "lucide-react";

interface TrainConfigProps {
  onTrain: (config: any) => void;
  loading: boolean;
}

export default function TrainModelConfig({
  onTrain,
  loading,
}: TrainConfigProps) {
  const t = useTranslations("AI");

  // Config State
  const [name, setName] = useState("");
  const [exchange, setExchange] = useState("binance");
  const [symbol, setSymbol] = useState("BTC/USDT");
  const [timeframe, setTimeframe] = useState("1h");
  const [startDate, setStartDate] = useState("2023-01-01T00:00");
  const [endDate, setEndDate] = useState("2023-12-31T23:59");
  const [modelType, setModelType] = useState("LSTM");

  // Hyperparameters
  const [epochs, setEpochs] = useState(10);
  const [batchSize, setBatchSize] = useState(32);
  const [learningRate, setLearningRate] = useState(0.001);
  const [seqLength, setSeqLength] = useState(60);

  const handleTrain = () => {
    onTrain({
      name: name || `${modelType}-${symbol}-${timeframe}`,
      exchange,
      symbol,
      timeframe,
      start_date: new Date(startDate).toISOString(), // Ensure ISO string
      end_date: new Date(endDate).toISOString(),
      model_type: modelType,
      feature_config: [
        { name: "close", kind: "price" },
        { name: "volume", kind: "volume" },
        { name: "rsi", kind: "technical", params: { period: 14 } },
        { name: "macd", kind: "technical" },
      ],
      configuration: {
        epochs,
        batch_size: batchSize,
        learning_rate: learningRate,
        seq_length: seqLength,
        units: 50,
        dropout: 0.2,
      },
    });
  };

  return (
    <Card className="border-orange-500/20 bg-slate-900/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-orange-400" />
          {t("trainNew")}
        </CardTitle>
        <CardDescription>
          Configure dataset and hyperparameters for training
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Model Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Alpha Model"
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Model Architecture
            </label>
            <select
              className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={modelType}
              onChange={(e) => setModelType(e.target.value)}
            >
              <option value="LSTM">LSTM (Long Short-Term Memory)</option>
              <option value="GRU">GRU (Gated Recurrent Unit)</option>
              <option value="Transformer">Transformer (Experimental)</option>
            </select>
          </div>
        </div>

        {/* Data Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Exchange
            </label>
            <select
              className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={exchange}
              onChange={(e) => setExchange(e.target.value)}
            >
              <option value="binance">Binance</option>
              <option value="kraken">Kraken</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Symbol</label>
            <Input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Start Date
            </label>
            <Input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              End Date
            </label>
            <Input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>
        </div>

        {/* Hyperparameters */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h4 className="text-sm font-medium text-slate-400">
            Hyperparameters
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase">
                Epochs
              </label>
              <Input
                type="number"
                value={epochs}
                onChange={(e) => setEpochs(Number(e.target.value))}
                className="bg-slate-900 border-slate-700 text-white h-9"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase">
                Batch Size
              </label>
              <Input
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                className="bg-slate-900 border-slate-700 text-white h-9"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase">
                Learning Rate
              </label>
              <Input
                type="number"
                step="0.0001"
                value={learningRate}
                onChange={(e) => setLearningRate(Number(e.target.value))}
                className="bg-slate-900 border-slate-700 text-white h-9"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase">
                Sequence Length
              </label>
              <Input
                type="number"
                value={seqLength}
                onChange={(e) => setSeqLength(Number(e.target.value))}
                className="bg-slate-900 border-slate-700 text-white h-9"
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold h-11"
          onClick={handleTrain}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Training Model...
            </>
          ) : (
            <>
              <BrainCircuit className="mr-2 h-5 w-5" />
              Start Training
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
