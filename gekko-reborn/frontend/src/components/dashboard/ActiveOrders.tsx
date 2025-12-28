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
    <Card className="col-span-1 lg:col-span-4">
      <CardHeader>
        <CardTitle>{t("recentOrders")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-muted/50">
              <TableHead className="text-muted-foreground">Symbol</TableHead>
              <TableHead className="text-muted-foreground">Side</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Price</TableHead>
              <TableHead className="text-muted-foreground">Amount</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-right text-muted-foreground">
                Date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-b border-border hover:bg-muted/50">
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  {tCommon("loading")}
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow className="border-b border-border hover:bg-muted/50">
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  {tCommon("noData")}
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow
                  key={order.id}
                  className="border-b border-border hover:bg-muted/50"
                >
                  <TableCell className="font-medium text-foreground">
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
                  <TableCell className="text-muted-foreground">
                    {order.type.toUpperCase()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    ${order.price}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {order.quantity}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {order.status}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
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
