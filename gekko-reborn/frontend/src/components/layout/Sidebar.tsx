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
  faRobot,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

type SidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

const Sidebar = ({ className, onNavigate }: SidebarProps) => {
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
    <div
      className={cn(
        "space-y-4 py-4 flex flex-col h-full bg-sidebar border-r border-sidebar-border w-64 text-sidebar-foreground",
        className
      )}
    >
      <div className="px-3 py-2 flex-1">
        <Link
          href={`/${locale}`}
          onClick={onNavigate}
          className="flex items-center pl-3 mb-14"
        >
          <div className="relative w-8 h-8 mr-4">
            <div className="absolute inset-0 bg-primary blur-lg opacity-50 rounded-full"></div>
            <div className="relative w-full h-full bg-primary rounded-lg flex items-center justify-center font-bold text-lg text-primary-foreground">
              G
            </div>
          </div>
          <h1 className="text-2xl font-bold text-sidebar-foreground">Gekko</h1>
        </Link>
        <div className="space-y-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={onNavigate}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-xl transition-all duration-200",
                pathname === route.href
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm ring-1 ring-sidebar-ring/20"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/80 hover:ring-1 hover:ring-sidebar-ring/20 dark:hover:bg-sidebar-accent/50"
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
