"use client";

import { useTranslations } from "next-intl";

export default function HistoryPage() {
    const t = useTranslations('Sidebar');
    return (
        <div className="grid gap-6">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('history')}</h1>
            <div className="text-muted-foreground">Trade history page placeholder</div>
        </div>
    );
}
