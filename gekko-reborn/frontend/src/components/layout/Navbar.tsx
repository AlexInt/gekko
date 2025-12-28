"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faUser } from "@fortawesome/free-solid-svg-icons";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/theme/ModeToggle";

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
        <div className="glass px-4 py-2 rounded-full flex items-center gap-x-4">
          {/* Segmented Control for Language */}
          <div className="relative flex w-24 bg-muted/50 border border-border/50 rounded-full p-1 h-8">
            <motion.div
              className="absolute top-1 bottom-1 bg-primary rounded-full shadow-sm z-0"
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
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
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
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              中文
            </button>
          </div>

          <div className="h-6 w-px bg-border/50"></div>

          <ModeToggle />

          <button className="p-2 rounded-full hover:bg-accent transition text-muted-foreground hover:text-foreground">
            <FontAwesomeIcon icon={faBell} className="h-5 w-5" />
          </button>

          <div className="h-6 w-px bg-border/50"></div>

          <button className="flex items-center gap-x-2 p-1 pr-3 rounded-full hover:bg-accent transition">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold shadow-sm text-white">
              <FontAwesomeIcon icon={faUser} className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-foreground">User</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
