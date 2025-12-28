"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faUser } from "@fortawesome/free-solid-svg-icons";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (nextLocale: string) => {
    if (nextLocale === locale) return;

    startTransition(() => {
      let path = pathname;
      // Remove current locale prefix if present
      if (path.startsWith(`/${locale}`)) {
        path = path.substring(locale.length + 1);
      }

      // Ensure path starts with /
      if (!path.startsWith("/")) {
        path = "/" + path;
      }

      router.push(`/${nextLocale}${path}`);
    });
  };

  return (
    <div className="flex items-center p-4 w-full justify-end bg-transparent h-16 z-50">
      <div className="flex items-center gap-x-4">
        <div className="glass px-4 py-2 rounded-full flex items-center gap-x-4 border border-white/5 bg-slate-900/30 backdrop-blur-md">
          {/* Segmented Control for Language */}
          <div className="relative flex w-24 bg-slate-950/40 border border-white/10 rounded-full p-1 h-8">
            <motion.div
              className="absolute top-1 bottom-1 bg-indigo-600 rounded-full shadow-lg shadow-indigo-500/20 z-0"
              initial={false}
              animate={{
                x: locale === "en" ? 0 : "100%",
              }}
              style={{
                width: "calc(50% - 4px)",
                left: "4px",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
            <button
              onClick={() => switchLocale("en")}
              disabled={isPending}
              className={cn(
                "relative z-10 w-1/2 flex items-center justify-center text-[10px] font-bold transition-colors duration-200",
                locale === "en"
                  ? "text-white"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              EN
            </button>
            <button
              onClick={() => switchLocale("zh")}
              disabled={isPending}
              className={cn(
                "relative z-10 w-1/2 flex items-center justify-center text-[10px] font-bold transition-colors duration-200",
                locale === "zh"
                  ? "text-white"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              中文
            </button>
          </div>

          <div className="h-6 w-px bg-white/10"></div>

          <button className="p-2 rounded-full hover:bg-white/10 transition text-slate-400 hover:text-white">
            <FontAwesomeIcon icon={faBell} className="h-5 w-5" />
          </button>

          <div className="h-6 w-px bg-white/10"></div>

          <button className="flex items-center gap-x-2 p-1 pr-3 rounded-full hover:bg-white/10 transition">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-500/20">
              <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-200">User</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
