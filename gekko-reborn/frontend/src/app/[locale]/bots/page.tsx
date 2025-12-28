"use client";

import { useState, useEffect } from "react";
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
import api from "@/lib/api";
import { Loader2, Play, Square, Trash2, Bot as BotIcon } from "lucide-react";

// Mock strategies for dropdown
const STRATEGIES = ["Golden Cross", "RSI Reversal", "LSTM AI Model"];

interface Bot {
  id: number;
  name: string;
  strategy: string;
  mode: string;
  exchange: string;
  symbol: string;
  status: string;
  current_balance: number;
  created_at: string;
}

export default function BotsPage() {
  const t = useTranslations("Bots");
  const tCommon = useTranslations("Common");
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  // Form
  const [name, setName] = useState("");
  const [strategy, setStrategy] = useState(STRATEGIES[0]);
  const [exchange, setExchange] = useState("binance");
  const [symbol, setSymbol] = useState("BTC/USDT");
  const [mode, setMode] = useState("paper");

  useEffect(() => {
    fetchBots();
  }, []);

  const fetchBots = async () => {
    try {
      const res = await api.get("/bots/");
      setBots(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      await api.post("/bots/", {
        name: name || `${strategy} - ${symbol}`,
        strategy,
        exchange,
        symbol,
        mode,
        initial_balance: 1000, // Default
      });
      setShowCreate(false);
      fetchBots();
    } catch (e) {
      console.error(e);
      alert("Failed to create bot");
    } finally {
      setCreating(false);
    }
  };

  const handleAction = async (
    id: number,
    action: "start" | "stop" | "delete"
  ) => {
    try {
      if (action === "delete") {
        if (!confirm("Delete this bot?")) return;
        await api.delete(`/bots/${id}`);
      } else {
        await api.post(`/bots/${id}/${action}`);
      }
      fetchBots();
    } catch (e) {
      console.error(e);
      alert(`Failed to ${action} bot`);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white/90">
          {t("title")}
        </h1>
        <Button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-emerald-600 hover:bg-emerald-500"
        >
          {showCreate ? "Cancel" : t("createBot")}
        </Button>
      </div>

      {showCreate && (
        <Card className="border-emerald-500/20 bg-emerald-900/10">
          <CardHeader>
            <CardTitle>{t("createBot")}</CardTitle>
            <CardDescription>{t("createDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  {tCommon("strategy")}
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                >
                  {STRATEGIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  {t("mode")}
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                >
                  <option value="paper">{t("paperTrader")}</option>
                  <option value="live">{t("liveTrader")}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  {tCommon("exchange")}
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={exchange}
                  onChange={(e) => setExchange(e.target.value)}
                >
                  <option value="binance">Binance</option>
                  <option value="kraken">Kraken</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  {tCommon("symbol")}
                </label>
                <Input
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="BTC/USDT"
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                {tCommon("name")} ({tCommon("labelOptional")})
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Moon Bot"
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-500"
              onClick={handleCreate}
              disabled={creating}
            >
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("createBot")}
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center text-slate-400 py-10">
            Loading bots...
          </div>
        ) : bots.length === 0 ? (
          <Card className="bg-slate-900/50 border-dashed border-slate-800">
            <CardContent className="flex flex-col items-center justify-center py-10 text-slate-500">
              <BotIcon className="h-10 w-10 mb-4 opacity-20" />
              <p>{t("noBots")}</p>
            </CardContent>
          </Card>
        ) : (
          bots.map((bot) => (
            <Card key={bot.id} className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-3 rounded-full ${
                        bot.status === "running"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      <BotIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg text-white">
                          {bot.name}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            bot.mode === "live"
                              ? "bg-red-900/30 text-red-400 border border-red-900/50"
                              : "bg-blue-900/30 text-blue-400 border border-blue-900/50"
                          }`}
                        >
                          {bot.mode.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400 mt-1">
                        {bot.strategy} • {bot.exchange.toUpperCase()}{" "}
                        {bot.symbol}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs text-slate-500 uppercase">
                        Status
                      </div>
                      <div
                        className={`font-medium ${
                          bot.status === "running"
                            ? "text-emerald-400"
                            : "text-slate-400"
                        }`}
                      >
                        {bot.status.toUpperCase()}
                      </div>
                    </div>
                    <div className="text-right hidden md:block">
                      <div className="text-xs text-slate-500 uppercase">
                        Balance
                      </div>
                      <div className="font-mono text-white">
                        ${bot.current_balance.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-l border-slate-800 pl-6">
                      {bot.status === "stopped" ? (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-emerald-400 hover:bg-emerald-900/20"
                          onClick={() => handleAction(bot.id, "start")}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-yellow-400 hover:bg-yellow-900/20"
                          onClick={() => handleAction(bot.id, "stop")}
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-400 hover:bg-red-900/20"
                        onClick={() => handleAction(bot.id, "delete")}
                        disabled={bot.status === "running"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
