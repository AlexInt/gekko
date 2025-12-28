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
import { Loader2, Trash2, Key } from "lucide-react";

interface ApiKey {
  id: number;
  exchange: string;
  name: string;
  key: string;
  created_at: string;
}

export default function SettingsPage() {
  const t = useTranslations("Settings");
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // Form State
  const [exchange, setExchange] = useState("binance");
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await api.get("/settings/api-keys");
      setKeys(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKey = async () => {
    if (!apiKey || !apiSecret) return;

    setAdding(true);
    try {
      await api.post("/settings/api-keys", {
        exchange,
        name: name || exchange,
        key: apiKey,
        secret: apiSecret,
      });

      // Clear form
      setApiKey("");
      setApiSecret("");
      setName("");

      // Refresh list
      fetchKeys();
    } catch (e) {
      console.error(e);
      alert("Failed to add key");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.delete(`/settings/api-keys/${id}`);
      setKeys(keys.filter((k) => k.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white/90">
          {t("title")}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Add New Key Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t("addKey")}</CardTitle>
            <CardDescription>{t("addKeyDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Exchange
              </label>
              <select
                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={exchange}
                onChange={(e) => setExchange(e.target.value)}
              >
                <option value="binance">Binance</option>
                <option value="kraken">Kraken</option>
                <option value="coinbase">Coinbase</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Label (Optional)
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Main Account"
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                API Key
              </label>
              <Input
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter API Key"
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                API Secret
              </label>
              <Input
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="Enter API Secret"
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-500"
              onClick={handleAddKey}
              disabled={adding || !apiKey || !apiSecret}
            >
              {adding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("saveKey")}
            </Button>
          </CardFooter>
        </Card>

        {/* Existing Keys List */}
        <Card>
          <CardHeader>
            <CardTitle>{t("manageKeys")}</CardTitle>
            <CardDescription>{t("manageKeysDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-slate-400 py-8">Loading...</div>
            ) : keys.length === 0 ? (
              <div className="text-center text-slate-500 py-8">
                No API keys found
              </div>
            ) : (
              <div className="space-y-4">
                {keys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-800"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-indigo-500/10 rounded-full">
                        <Key className="h-5 w-5 text-indigo-400" />
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {key.exchange.toUpperCase()}
                        </div>
                        <div className="text-xs text-slate-400">{key.name}</div>
                        <div className="text-xs text-slate-500 font-mono mt-1">
                          {key.key}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      onClick={() => handleDelete(key.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
