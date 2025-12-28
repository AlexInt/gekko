"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Assuming this exists or I'll implement inline
import { AIModel } from "@/types";
import { Brain, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface ModelListProps {
    models: AIModel[];
}

export default function ModelList({ models }: ModelListProps) {
    const t = useTranslations('AI');

    const getStatusIcon = (status: string) => {
        switch(status) {
            case 'ready': return <CheckCircle2 className="h-4 w-4 text-green-400" />;
            case 'training': return <Clock className="h-4 w-4 text-yellow-400 animate-pulse" />;
            case 'failed': return <XCircle className="h-4 w-4 text-red-400" />;
            default: return <Clock className="h-4 w-4 text-slate-400" />;
        }
    };

    return (
        <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
                <CardTitle>{t('registry')}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-400">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-3">{t('name')}</th>
                                <th className="px-6 py-3">{t('type')}</th>
                                <th className="px-6 py-3">{t('status')}</th>
                                <th className="px-6 py-3">{t('accuracy')}</th>
                                <th className="px-6 py-3">{t('createdAt')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {models.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        No models found. Train your first AI model above.
                                    </td>
                                </tr>
                            ) : (
                                models.map((model) => (
                                    <tr key={model.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                                            <div className="p-1.5 rounded bg-indigo-500/10">
                                                <Brain className="h-4 w-4 text-indigo-400" />
                                            </div>
                                            {model.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                                                {model.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(model.status)}
                                                <span className="capitalize">{model.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-white">
                                            {model.accuracy ? `${(model.accuracy * 100).toFixed(2)}%` : '-'}
                                        </td>
                                        <td className="px-6 py-4">
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
