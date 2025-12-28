"use client";

import { useTranslations } from "next-intl";

export default function SettingsPage() {
    const t = useTranslations('Sidebar');
    return (
        <div className="grid gap-6">
            <h1 className="text-2xl font-bold tracking-tight text-white/90">{t('settings')}</h1>
            <div className="text-slate-400">Settings page placeholder</div>
        </div>
    );
}
