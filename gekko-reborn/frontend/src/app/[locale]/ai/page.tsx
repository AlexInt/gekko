"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AIModel } from "@/types";
import api from "@/lib/api";
import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import TrainModelConfig from "@/components/ai/TrainModelConfig";
import ModelList from "@/components/ai/ModelList";

export default function AIPage() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [showTrainConfig, setShowTrainConfig] = useState(false);
  const t = useTranslations("AI");

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

  const handleTrainModel = async (config: any) => {
    setTraining(true);
    try {
      await api.post("/ai/train", config);
      // In real world, we'd poll for status or use websocket
      // For now, assume it starts async
      setShowTrainConfig(false);
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
          onClick={() => setShowTrainConfig(!showTrainConfig)}
          disabled={training}
          className="bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          {showTrainConfig ? (
            <>
              <X className="mr-2 h-4 w-4" /> Cancel
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" /> {t("trainNew")}
            </>
          )}
        </Button>
      </div>

      {showTrainConfig && (
        <div className="animate-in slide-in-from-top-4 duration-300">
          <TrainModelConfig onTrain={handleTrainModel} loading={training} />
        </div>
      )}

      <ModelList models={models} />
    </div>
  );
}
