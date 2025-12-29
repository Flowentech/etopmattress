import Container from "@/components/Container";
import NoAccessToCart from "@/components/NoAccessToCart";
import OrdersComponent from "@/components/OrdersComponent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getMyOrders } from "@/sanity/helpers";
import { auth } from "@clerk/nextjs/server";
import { FileX } from "lucide-react";
import Link from "next/link";
import React from "react";

const OrdersPage = async () => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return <NoAccessToCart />;
    }

    const orders = await getMyOrders(userId);

    // Ensure orders is always an array
    const ordersList = Array.isArray(orders) ? orders : [];

    return (
    <div>
      <Container className="py-10">
        {ordersList.length > 0 ? (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl">Order List</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px] md:w-auto">
                        Order Number
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Date
                      </TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Email
                      </TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <OrdersComponent orders={ordersList} />
                </Table>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <FileX className="h-24 w-24 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900">
              No orders found
            </h2>
            <p className="mt-2 text-sm text-gray-600 text-center max-w-md">
              It looks like you haven&apos;t placed any orders yet. Start
              shopping to see your orders here!
            </p>
            <Button asChild className="mt-6">
              <Link href="/">Browse Products</Link>
            </Button>
          </div>
        )}
      </Container>
    </div>
    );
  } catch (error) {
    console.error("Error loading orders page:", error);
    return (
      <div>
        <Container className="py-10">
          <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <FileX className="h-24 w-24 text-red-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Error Loading Orders
            </h2>
            <p className="mt-2 text-sm text-gray-600 text-center max-w-md">
              We encountered an error while loading your orders. Please try refreshing the page or contact support if the issue persists.
            </p>
            <div className="flex gap-3 mt-6">
              <Button asChild variant="outline">
                <Link href="/">Go Home</Link>
              </Button>
              <Button asChild>
                <Link href="/orders">Try Again</Link>
              </Button>
            </div>
          </div>
        </Container>
      </div>
    );
  }
};

export default OrdersPage;
