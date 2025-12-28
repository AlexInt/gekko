"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGaugeHigh,
  faChartLine,
  faChessKnight,
  faBrain,
  faClockRotateLeft,
  faGear,
  faDatabase,
  faRobot,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const pathname = usePathname();
  const t = useTranslations("Sidebar");
  const locale = useLocale();

  const routes = [
    {
      label: t("dashboard"),
      icon: faGaugeHigh,
      href: `/${locale}`,
      color: "text-sky-400",
    },
    {
      label: t("market"),
      icon: faChartLine,
      href: `/${locale}/market`,
      color: "text-violet-400",
    },
    {
      label: t("bots"),
      icon: faRobot,
      href: `/${locale}/bots`,
      color: "text-emerald-400",
    },
    {
      label: t("strategies"),
      icon: faChessKnight,
      href: `/${locale}/strategies`,
      color: "text-pink-400",
    },
    {
      label: t("aiModels"),
      icon: faBrain,
      href: `/${locale}/ai`,
      color: "text-orange-400",
    },
    {
      label: t("history"),
      icon: faClockRotateLeft,
      href: `/${locale}/history`,
      color: "text-green-400",
    },
    {
      label: t("settings"),
      icon: faGear,
      href: `/${locale}/settings`,
      color: "text-gray-400",
    },
  ];

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900/30 backdrop-blur-xl border-r border-white/5 w-64 text-white">
      <div className="px-3 py-2 flex-1">
        <Link href={`/${locale}`} className="flex items-center pl-3 mb-14">
          <div className="relative w-8 h-8 mr-4">
            <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-50 rounded-full"></div>
            <div className="relative w-full h-full bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-lg">
              G
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Gekko
          </h1>
        </Link>
        <div className="space-y-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-xl transition-all duration-200",
                pathname === route.href
                  ? "bg-white/10 text-white shadow-lg shadow-indigo-500/10 border border-white/10"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <div className="flex items-center flex-1">
                <FontAwesomeIcon
                  icon={route.icon}
                  className={cn("h-5 w-5 mr-3 transition-colors", route.color)}
                />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
