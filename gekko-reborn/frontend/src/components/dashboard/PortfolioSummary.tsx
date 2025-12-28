import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Portfolio } from "@/types";
import { useTranslations } from "next-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWallet, faChartPie } from "@fortawesome/free-solid-svg-icons";

interface PortfolioSummaryProps {
  portfolio: Portfolio | null;
  loading: boolean;
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  portfolio,
  loading,
}) => {
  const t = useTranslations("Dashboard");

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalBalance")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold animate-pulse bg-slate-800/50 h-8 w-32 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">
            {t("totalBalance")}
          </CardTitle>
          <div className="p-2 bg-indigo-500/10 rounded-full">
            <FontAwesomeIcon
              icon={faWallet}
              className="h-4 w-4 text-indigo-400"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            $
            {portfolio?.total_balance_usdt.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            +20.1% {t("fromLastMonth")}
          </p>
        </CardContent>
      </Card>
      {/* Add more cards for specific assets if needed */}
      <Card className="col-span-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-slate-300">
            {t("assetAllocation")}
          </CardTitle>
          <div className="p-2 bg-purple-500/10 rounded-full">
            <FontAwesomeIcon
              icon={faChartPie}
              className="h-4 w-4 text-purple-400"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mt-2">
            {portfolio?.items.map((item) => (
              <div key={item.asset} className="flex items-center">
                <div className="w-16 font-medium text-slate-200">
                  {item.asset}
                </div>
                <div className="flex-1 bg-slate-800/50 rounded-full h-2.5 ml-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full"
                    style={{
                      width: `${
                        (item.value_in_usdt /
                          (portfolio.total_balance_usdt || 1)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="ml-4 text-sm text-slate-400 min-w-[80px] text-right">
                  $
                  {item.value_in_usdt.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioSummary;
