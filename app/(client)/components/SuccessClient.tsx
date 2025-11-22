'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Home, Package, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Container from '@/components/Container';
import { Button } from '@/components/ui/button';

interface SuccessClientProps {
  orderNumber?: string;
  session_id?: string;
}

const SuccessClient = ({ orderNumber, session_id }: SuccessClientProps) => {
  const [isClient, setIsClient] = useState(false);

  // Simulate loading state
  React.useEffect(() => {
    const timer = setTimeout(() => setIsClient(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Loading indicator */}
      {!isClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 border-t-transparent"></div>
              <p className="text-lg font-medium text-gray-900 mb-2">Loading...</p>
              <p className="text-sm text-gray-600">Preparing your order confirmation</p>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="w-full h-screen flex items-center justify-center py-10 px-4"
      >
        <Container className="text-center">
          <div className="flex justify-center mb-8">
            <div className="bg-green-100 rounded-full p-6">
              <Check className="w-16 h-16 text-green-600 mb-4" />
            </div>
          </div>

          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold text-green-600 mb-4">Order Placed Successfully!</h1>
            <p className="text-lg text-gray-700 mb-2">
              Thank you for your order. We&rsquo;ve received it and are preparing it for shipment.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-center space-x-4 mb-8">
            <Link href="/">
              <Button className="flex items-center">
                <Home className="w-5 h-5 mr-2" />
                Continue Shopping
              </Button>
            </Link>
            <Link href="/orders">
              <Button variant="outline" className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                View Orders
              </Button>
            </Link>
          </div>
        </Container>
      </motion.div>
    </>
  );
};

export default SuccessClient;