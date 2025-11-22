"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CheckCircle, Clock, MapPin, Package, Truck } from "lucide-react";
import PriceFormatter from "./PriceFormatter";
import { getOrderStatusColor, getOrderStatusText } from "@/lib/orderUtils";

interface OrderUpdate {
  status: string;
  message: string;
  timestamp: string;
  location?: string;
}

interface DeliveryAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  country: string;
}

interface OrderTrackingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    orderNumber: string;
    customerName: string;
    email: string;
    totalPrice: number;
    status: string;
    orderDate: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
    deliveryAddress?: DeliveryAddress;
    orderUpdates?: OrderUpdate[];
  } | null;
}

const OrderTrackingDialog: React.FC<OrderTrackingDialogProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  if (!order) return null;

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "confirmed":
      case "paid":
        return <CheckCircle className="w-4 h-4" />;
      case "processing":
        return <Package className="w-4 h-4" />;
      case "shipped":
      case "out_for_delivery":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Tracking - {order.orderNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="font-semibold">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge className={getOrderStatusColor(order.status)}>
                    {getOrderStatusText(order.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p>{new Date(order.orderDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <PriceFormatter amount={order.totalPrice} className="font-semibold" />
                </div>
                {order.trackingNumber && (
                  <div>
                    <p className="text-sm text-gray-500">Tracking Number</p>
                    <p className="font-mono">{order.trackingNumber}</p>
                  </div>
                )}
                {order.estimatedDelivery && (
                  <div>
                    <p className="text-sm text-gray-500">Estimated Delivery</p>
                    <p>{new Date(order.estimatedDelivery).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          {order.deliveryAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-semibold">{order.deliveryAddress.fullName}</p>
                  <p>{order.deliveryAddress.phone}</p>
                  <p>{order.deliveryAddress.address}</p>
                  <p>
                    {order.deliveryAddress.city}, {order.deliveryAddress.state}{" "}
                    {order.deliveryAddress.zipCode}
                  </p>
                  <p>{order.deliveryAddress.country}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Tracking Timeline */}
          {order.orderUpdates && order.orderUpdates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.orderUpdates
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((update, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getStatusIcon(update.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={getOrderStatusColor(update.status)}
                            >
                              {getOrderStatusText(update.status)}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(update.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{update.message}</p>
                          {update.location && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {update.location}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderTrackingDialog;