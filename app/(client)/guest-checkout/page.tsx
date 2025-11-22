"use client";

import { useState } from "react";
import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Mail, User, Phone } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GuestCheckoutPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Store guest info in localStorage for checkout
      localStorage.setItem("guestCheckoutInfo", JSON.stringify(formData));

      // Redirect to checkout with guest info
      router.push("/checkout?guest=true");
    } catch (error) {
      console.error("Guest checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="py-8">
      <div className="max-w-md mx-auto">
        <Link
          href="/cart"
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cart
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Guest Checkout</CardTitle>
            <CardDescription>
              Enter your information to continue with your purchase
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  className="mt-1"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Continue to Checkout"}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Or{" "}
                <Link href="/sign-in" className="text-emerald-600 hover:text-emerald-700">
                  sign in to your account
                </Link>{" "}
                for faster checkout
              </div>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Why create an account?</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Save your shipping information</li>
                <li>• Track your orders</li>
                <li>• View order history</li>
                <li>• Exclusive member deals</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}