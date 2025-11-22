"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Container from "@/components/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Package, Phone, Mail, Home } from "lucide-react";
import Link from "next/link";

const OrderSuccessPage = () => {
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);
  
  const orderNumber = searchParams.get("orderNumber");
  const orderType = searchParams.get("type"); // 'guest' or 'user'

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <Container className="max-w-2xl">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Order Placed Successfully!</CardTitle>
            <p className="text-gray-600">Thank you for shopping with InterioWale</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {orderNumber && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Your Order Number</p>
                <p className="text-xl font-bold text-gray-900">{orderNumber}</p>
              </div>
            )}

            <div className="space-y-4 text-left">
              <h3 className="font-semibold text-lg">What happens next?</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Order Confirmation Call</p>
                    <p className="text-sm text-gray-600">We&apos;ll call you within 2-4 hours to confirm your order details</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Order Processing</p>
                    <p className="text-sm text-gray-600">Your order will be prepared and packed within 24 hours</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Home className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Delivery</p>
                    <p className="text-sm text-gray-600">Free delivery to your doorstep within 1-5 business days</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg text-left">
              <h4 className="font-semibold text-blue-900 mb-2">Payment Method</h4>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                Cash on Delivery (COD)
              </Badge>
              <p className="text-sm text-blue-700 mt-2">
                Pay when your order arrives at your doorstep. Only cash payments accepted.
              </p>
            </div>

            {orderType === "guest" && (
              <div className="bg-emerald-50 p-4 rounded-lg text-left">
                <h4 className="font-semibold text-emerald-900 mb-2">💡 Create an Account</h4>
                <p className="text-sm text-emerald-700 mb-3">
                  Sign up to track your orders, save favorites, and get exclusive offers!
                </p>
                <Button asChild size="sm" variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-100">
                  <Link href="/sign-up">Create Account</Link>
                </Button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="flex-1">
                <Link href="/">Continue Shopping</Link>
              </Button>
              {orderType !== "guest" && (
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/orders">View Orders</Link>
                </Button>
              )}
            </div>

            <div className="pt-4 border-t text-sm text-gray-500">
              <p>Need help? Contact us:</p>
              <div className="flex items-center justify-center gap-4 mt-2">
                <a href="tel:+88017-23560254" className="flex items-center gap-1 text-blue-600 hover:underline">
                  <Phone className="w-4 h-4" />
                  +88017-23560254
                </a>
                <a href="mailto:support@interiowale.com" className="flex items-center gap-1 text-blue-600 hover:underline">
                  <Mail className="w-4 h-4" />
                  support@interiowale.com
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};

export default OrderSuccessPage;