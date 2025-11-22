'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Package, MapPin, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Address } from '@/types/fulfillment';

interface SteadfastShipmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  deliveryAddress: Address;
  packageDetails: {
    weight: number;
    dimensions: { length: number; width: number; height: number };
    description: string;
    value: number;
  };
  onSuccess?: (shipmentData: any) => void;
}

export default function SteadfastShipmentForm({
  open,
  onOpenChange,
  orderId,
  deliveryAddress,
  packageDetails,
  onSuccess
}: SteadfastShipmentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [createdShipment, setCreatedShipment] = useState<any>(null);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [serviceType, setServiceType] = useState<'regular' | 'express'>('regular');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/fulfillment/steadfast/shipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          deliveryAddress,
          packageDetails,
          serviceType,
          specialInstructions
        })
      });

      const result = await response.json();

      if (result.success) {
        setCreatedShipment(result.data.shipment);
        setStep('success');
        toast.success('Shipment created with Steadfast!');
        onSuccess?.(result.data);
      } else {
        toast.error(result.error || 'Failed to create shipment');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create shipment');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep('form');
    setCreatedShipment(null);
    setSpecialInstructions('');
    setServiceType('regular');
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            Create Steadfast Shipment
          </DialogTitle>
          <DialogDescription>
            Create a shipment with Steadfast courier service for order {orderId}
          </DialogDescription>
        </DialogHeader>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {/* Delivery Address Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Recipient Name</Label>
                    <p className="font-medium">{deliveryAddress.fullName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Phone</Label>
                    <p className="font-medium">{deliveryAddress.phone}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Address</Label>
                  <p className="font-medium">
                    {deliveryAddress.address}, {deliveryAddress.city}, {deliveryAddress.state}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Package Details Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Package Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Weight (kg)</Label>
                    <p className="font-medium">{packageDetails.weight} kg</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Value (BDT)</Label>
                    <p className="font-medium">৳{packageDetails.value}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Dimensions</Label>
                  <p className="font-medium">
                    {packageDetails.dimensions.length} × {packageDetails.dimensions.width} × {packageDetails.dimensions.height} cm
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Description</Label>
                  <p className="font-medium">{packageDetails.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Service Type Selection */}
            <div>
              <Label htmlFor="serviceType">Delivery Type *</Label>
              <Select value={serviceType} onValueChange={(value: 'regular' | 'express') => setServiceType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select delivery type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">
                    <div>
                      <div className="font-medium">Regular Delivery</div>
                      <div className="text-sm text-gray-500">Standard delivery (2-3 days)</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="express">
                    <div>
                      <div className="font-medium">Express Delivery</div>
                      <div className="text-sm text-gray-500">Fast delivery (1-2 days)</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Special Instructions */}
            <div>
              <Label htmlFor="specialInstructions">Special Instructions</Label>
              <Textarea
                id="specialInstructions"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special handling instructions for the courier"
                rows={3}
              />
            </div>

            {/* Steadfast Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Steadfast Courier Service:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>Cash on Delivery (COD) available</li>
                    <li>Real-time tracking will be available</li>
                    <li>Coverage: All major cities in Bangladesh</li>
                    <li>Standard insurance included</li>
                  </ul>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating Shipment...' : 'Create Shipment'}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Shipment Created Successfully!
              </h3>
              <p className="text-gray-600">
                Your package has been registered with Steadfast
              </p>
            </div>

            {createdShipment && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Shipment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600">Tracking Number</Label>
                      <p className="font-medium font-mono text-sm">{createdShipment.trackingNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Status</Label>
                      <Badge variant="outline">{createdShipment.status}</Badge>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Service Type</Label>
                      <Badge variant="secondary">{serviceType}</Badge>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Created At</Label>
                      <p className="font-medium">{new Date(createdShipment.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm text-gray-600">Track Your Package</Label>
                        <p className="text-sm mt-1">
                          Use tracking number <span className="font-medium">{createdShipment.trackingNumber}</span>
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(createdShipment.trackingNumber);
                          toast.success('Tracking number copied!');
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-1">What happens next:</p>
                  <ol className="list-decimal list-inside space-y-1 text-green-700">
                    <li>Steadfast courier will pick up the package from your location</li>
                    <li>Customer will receive tracking updates via SMS</li>
                    <li>You can track the shipment in your dashboard</li>
                    <li>Delivery will be attempted based on service type selected</li>
                  </ol>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}