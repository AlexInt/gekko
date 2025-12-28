import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Order } from "@/types";
import { useTranslations } from "next-intl";

interface ActiveOrdersProps {
  orders: Order[];
  loading: boolean;
}

const ActiveOrders: React.FC<ActiveOrdersProps> = ({ orders, loading }) => {
  const t = useTranslations("Dashboard");
  const tCommon = useTranslations("Common");

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>{t("recentOrders")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/5 hover:bg-white/5">
              <TableHead className="text-slate-400">Symbol</TableHead>
              <TableHead className="text-slate-400">Side</TableHead>
              <TableHead className="text-slate-400">Type</TableHead>
              <TableHead className="text-slate-400">Price</TableHead>
              <TableHead className="text-slate-400">Amount</TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
              <TableHead className="text-right text-slate-400">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-b border-white/5 hover:bg-white/5">
                <TableCell colSpan={7} className="text-center text-slate-400">
                  {tCommon("loading")}
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow className="border-b border-white/5 hover:bg-white/5">
                <TableCell colSpan={7} className="text-center text-slate-500">
                  {tCommon("noData")}
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow
                  key={order.id}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <TableCell className="font-medium text-slate-200">
                    {order.symbol}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        order.side === "buy"
                          ? "bg-green-500/10 text-green-400 ring-1 ring-inset ring-green-500/20"
                          : "bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20"
                      }`}
                    >
                      {order.side.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {order.type.toUpperCase()}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    ${order.price}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {order.quantity}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {order.status}
                  </TableCell>
                  <TableCell className="text-right text-slate-400">
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ActiveOrders;
