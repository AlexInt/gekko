"use client";

import { useEffect, useState } from "react";
import PortfolioSummary from "@/components/dashboard/PortfolioSummary";
import ActiveOrders from "@/components/dashboard/ActiveOrders";
import api from "@/lib/api";
import { Portfolio, Order, PortfolioItem } from "@/types";
import { useTranslations } from "next-intl";

export default function Home() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const t = useTranslations("Dashboard");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);
        
        console.log("Fetching dashboard data...");
        console.log("API Base URL:", api.defaults.baseURL);

        // Fetch Portfolio
        const portfolioRes = await api.get<PortfolioItem[]>("/portfolio/");
        console.log("Portfolio response:", portfolioRes);
        
        const items = portfolioRes.data;
        // Calculate total balance (mock calculation as backend returns raw list)
        // Assuming we can sum up 'total' * price, but we don't have price here.
        // For now, let's just sum up USDT or assume value_in_usdt is present or calculated.
        // If backend doesn't return value_in_usdt, we might need to fetch prices.
        // Let's assume for now backend returns simple balance objects.
        // The backend returns: { asset, free, locked, total } (based on probable Portfolio model)

        // We need to map response to PortfolioItem
        // Let's assume backend returns fields that match or we map them.
        const portfolioItems: PortfolioItem[] = items.map((item: any) => ({
          asset: item.asset,
          free: item.free,
          locked: item.locked,
          total: item.free + item.locked,
          value_in_usdt: 0, // Placeholder until we have prices
        }));

        const totalBalance = portfolioItems.reduce(
          (acc, item) => acc + item.value_in_usdt,
          0
        );

        setPortfolio({
          total_balance_usdt: totalBalance,
          items: portfolioItems,
        });

        // Fetch Orders
        const ordersRes = await api.get<Order[]>("/orders/");
        setOrders(ordersRes.data);
      } catch (error: any) {
        console.error("Failed to fetch dashboard data:", error);
        setErrorMsg(error.message || "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white/90">
          {t("title")}
        </h1>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-4">
          Error: {errorMsg}
          <br />
          <span className="text-xs text-red-500/70">Check console for details. API URL: {api.defaults.baseURL}</span>
        </div>
      )}

      <PortfolioSummary portfolio={portfolio} loading={loading} />

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-4">
        <ActiveOrders orders={orders} loading={loading} />
      </div>
    </div>
  );
}
