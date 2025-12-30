"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIModel } from "@/types";
import { Brain, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface ModelListProps {
  models: AIModel[];
}

export default function ModelList({ models }: ModelListProps) {
  const t = useTranslations("AI");
  const tCommon = useTranslations("Common");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case "training":
        return <Clock className="h-4 w-4 text-yellow-400 animate-pulse" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("registry")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative -mx-4 sm:mx-0 overflow-x-auto">
          <table className="w-full text-sm text-left text-muted-foreground">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 whitespace-nowrap">
              <tr>
                <th className="px-3 sm:px-6 py-3">{t("name")}</th>
                <th className="px-3 sm:px-6 py-3">{t("type")}</th>
                <th className="px-3 sm:px-6 py-3">{t("status")}</th>
                <th className="px-3 sm:px-6 py-3">{t("accuracy")}</th>
                <th className="hidden sm:table-cell px-6 py-3">
                  {t("createdAt")}
                </th>
              </tr>
            </thead>
            <tbody>
              {models.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 sm:px-6 py-8 text-center text-muted-foreground"
                  >
                    {tCommon("noData")}
                  </td>
                </tr>
              ) : (
                models.map((model) => (
                  <tr
                    key={model.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-3 sm:px-6 py-4 font-medium text-foreground">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1.5 rounded bg-indigo-500/10">
                          <Brain className="h-4 w-4 text-indigo-400" />
                        </div>
                        <span className="truncate">{model.name}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-muted text-muted-foreground border border-border">
                        {model.type}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(model.status)}
                        <span className="capitalize">{model.status}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 font-mono text-foreground whitespace-nowrap">
                      {model.accuracy
                        ? `${(model.accuracy * 100).toFixed(2)}%`
                        : "-"}
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                      {new Date(model.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
