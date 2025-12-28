"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { AIModel } from "@/types";
import api from "@/lib/api";
import { Plus, RefreshCw, Cpu } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AIPage() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const t = useTranslations("AI");
  const tCommon = useTranslations("Common");

  const fetchModels = async () => {
    try {
      setLoading(true);
      const res = await api.get<AIModel[]>("/ai/models");
      setModels(res.data);
    } catch (error) {
      console.error("Failed to fetch models", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleTrainModel = async () => {
    setTraining(true);
    try {
      // Hardcoded config for demo
      const config = {
        name: `LSTM-Model-${Date.now()}`,
        exchange: "binance",
        symbol: "BTC/USDT",
        timeframe: "1h",
        start_date: "2023-01-01",
        end_date: "2023-12-31",
        model_type: "LSTM",
        feature_config: [
          { name: "close", kind: "price" },
          { name: "volume", kind: "volume" },
        ],
        configuration: {
          units: 50,
          dropout: 0.2,
          epochs: 5,
        },
      };

      await api.post("/ai/train", config);
      // Refresh list after triggering training
      // In real world, we'd poll for status or use websocket
      setTimeout(fetchModels, 2000);
    } catch (error) {
      console.error("Failed to start training", error);
      alert("Failed to start training");
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white/90">
          {t("title")}
        </h1>
        <Button
          onClick={handleTrainModel}
          disabled={training}
          className="bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          {training ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          {training ? t("training") : t("trainNew")}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              {t("totalModels")}
            </CardTitle>
            <Cpu className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{models.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-white/90">{t("registry")}</CardTitle>
          <CardDescription>{t("manageModels")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/5 hover:bg-white/5">
                <TableHead className="text-slate-400">{t("id")}</TableHead>
                <TableHead className="text-slate-400">{t("name")}</TableHead>
                <TableHead className="text-slate-400">{t("type")}</TableHead>
                <TableHead className="text-slate-400">{t("status")}</TableHead>
                <TableHead className="text-slate-400">
                  {t("accuracy")}
                </TableHead>
                <TableHead className="text-right text-slate-400">
                  {t("createdAt")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-b border-white/5 hover:bg-white/5">
                  <TableCell colSpan={6} className="text-center text-slate-400">
                    {tCommon("loading")}
                  </TableCell>
                </TableRow>
              ) : models.length === 0 ? (
                <TableRow className="border-b border-white/5 hover:bg-white/5">
                  <TableCell colSpan={6} className="text-center text-slate-500">
                    {tCommon("noData")}
                  </TableCell>
                </TableRow>
              ) : (
                models.map((model) => (
                  <TableRow
                    key={model.id}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <TableCell className="font-mono text-xs text-slate-400">
                      {model.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="text-slate-200">
                      {model.name}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {model.type}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          model.status === "ready"
                            ? "bg-green-500/10 text-green-400 ring-1 ring-inset ring-green-500/20"
                            : model.status === "training"
                            ? "bg-yellow-500/10 text-yellow-400 ring-1 ring-inset ring-yellow-500/20"
                            : "bg-slate-500/10 text-slate-400 ring-1 ring-inset ring-slate-500/20"
                        }`}
                      >
                        {model.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {model.accuracy
                        ? (model.accuracy * 100).toFixed(2) + "%"
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right text-slate-400">
                      {new Date(model.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
