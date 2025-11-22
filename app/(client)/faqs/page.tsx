"use client";

import React, { useState } from "react";
import Container from "@/components/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  ShoppingBag, 
  Truck, 
  CreditCard, 
  Palette, 
  Phone,
  MessageCircle,
  Mail
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // General/About
  {
    category: "General",
    question: "What is InterioWale?",
    answer: "InterioWale is Bangladesh's premier online marketplace for interior design products, home decor, furniture, and plants. We also offer AI-powered interior design services to help you visualize and plan your spaces."
  },
  {
    category: "General",
    question: "Do I need to create an account to shop?",
    answer: "No! You can shop as a guest and complete your purchase without creating an account. However, creating an account allows you to track orders, save favorites, and access exclusive offers."
  },
  {
    category: "General",
    question: "What areas do you deliver to?",
    answer: "We deliver across Bangladesh, with free delivery to major cities including Dhaka, Chittagong, Sylhet, Rajshahi, Khulna, Barisal, Rangpur, and Mymensingh. Delivery charges may apply for remote areas."
  },

  // Orders & Shopping
  {
    category: "Orders",
    question: "How do I place an order?",
    answer: "Simply browse our products, add items to your cart, and proceed to checkout. You can pay cash on delivery or use our secure online payment system. No account required for guest checkout!"
  },
  {
    category: "Orders",
    question: "Can I modify or cancel my order?",
    answer: "You can modify or cancel your order within 2 hours of placing it by calling us at +88017-23560254. After this time, orders enter our processing system and changes may not be possible."
  },
  {
    category: "Orders",
    question: "How do I track my order?",
    answer: "After placing an order, you'll receive a confirmation with your order number. You can track your order status through our website or by calling our customer service. We'll also send SMS updates for major milestones."
  },
  {
    category: "Orders",
    question: "What if I receive a damaged or wrong item?",
    answer: "Contact us immediately at +88017-23560254 or email support@interiowale.com. We'll arrange for immediate replacement or refund. Please take photos of damaged items to help us process your claim quickly."
  },
  {
    category: "Orders",
    question: "Can I change my delivery address?",
    answer: "Yes, you can change your delivery address before your order ships by calling us. Once shipped, address changes may not be possible depending on the courier service."
  },

  // Payment & Pricing
  {
    category: "Payment",
    question: "What payment methods do you accept?",
    answer: "We accept Cash on Delivery (COD) for all areas, and secure online payments via Stripe (credit/debit cards). Mobile banking options (bKash, Nagad, Rocket) are coming soon!"
  },
  {
    category: "Payment",
    question: "Is Cash on Delivery (COD) available everywhere?",
    answer: "Yes! COD is available for all delivery areas across Bangladesh. You pay when your order arrives at your doorstep. Only cash payments are accepted for COD orders."
  },
  {
    category: "Payment",
    question: "Are your online payments secure?",
    answer: "Absolutely! We use Stripe, a world-leading secure payment processor with bank-level encryption. Your payment information is never stored on our servers."
  },
  {
    category: "Payment",
    question: "Do you offer installment payments?",
    answer: "Currently, we don't offer installment payments, but this feature is coming soon! Follow us on social media for updates on new payment options."
  },
  {
    category: "Payment",
    question: "Why are prices in BDT?",
    answer: "All our prices are in Bangladeshi Taka (BDT) since we're a Bangladesh-based company serving local customers. This eliminates currency conversion confusion and ensures transparent pricing."
  },

  // Delivery & Shipping
  {
    category: "Delivery",
    question: "How long does delivery take?",
    answer: "Delivery times vary by location: Dhaka (1-2 days), Chittagong & Sylhet (2-3 days), other major cities (3-5 days). Remote areas may take 5-7 days. We'll provide estimated delivery dates at checkout."
  },
  {
    category: "Delivery",
    question: "Is delivery free?",
    answer: "Yes! We offer free delivery to all major cities in Bangladesh. Small delivery charges may apply for very remote areas, which will be clearly mentioned during checkout."
  },
  {
    category: "Delivery",
    question: "What if I'm not home during delivery?",
    answer: "Our delivery team will call you before arrival. If you're not available, they can deliver to a trusted neighbor or reschedule for a convenient time. We offer flexible delivery timing."
  },
  {
    category: "Delivery",
    question: "Can I schedule a specific delivery time?",
    answer: "While we can't guarantee exact times, you can request morning or evening delivery in the order notes. Our team will try to accommodate your preference and call before delivery."
  },
  {
    category: "Delivery",
    question: "Do you deliver furniture and large items?",
    answer: "Yes! We deliver all sizes of furniture and plants. Large items may require special handling and our team will coordinate with you for safe delivery and placement."
  },

  // AI Interior Design
  {
    category: "AI Design",
    question: "How does your AI interior design service work?",
    answer: "Upload a photo of your room, choose your preferred style, and our AI generates design recommendations with product suggestions from our store. It's like having a personal interior designer!"
  },
  {
    category: "AI Design",
    question: "How much do AI design credits cost?",
    answer: "Our credit packages start from ৳500 for 10 designs. We also offer 3 free credits for new users to try the service. Check our AI design page for current pricing and packages."
  },
  {
    category: "AI Design",
    question: "Can I get product recommendations from AI designs?",
    answer: "Yes! Our AI not only creates design visualizations but also suggests specific products from our inventory that match your design, complete with pricing and availability."
  },
  {
    category: "AI Design",
    question: "What types of rooms can I design?",
    answer: "You can design any indoor space: living rooms, bedrooms, kitchens, offices, bathrooms, and more. Our AI understands different room types and provides appropriate design suggestions."
  },
  {
    category: "AI Design",
    question: "Do AI design credits expire?",
    answer: "Yes, credits expire 12 months from purchase date. However, any designs you've created remain saved in your account forever, and you can always purchase new credits."
  },

  // Returns & Exchanges
  {
    category: "Returns",
    question: "What is your return policy?",
    answer: "We offer a 7-day return policy for most items in original condition and packaging. Plants and custom items are non-returnable. Return shipping may apply depending on the reason for return."
  },
  {
    category: "Returns",
    question: "How do I return an item?",
    answer: "Contact us at +88017-23560254 or email returns@interiowale.com within 7 days of delivery. We'll guide you through the return process and arrange pickup if needed."
  },
  {
    category: "Returns",
    question: "When will I get my refund?",
    answer: "Refunds are processed within 7-14 business days after we receive the returned item. COD refunds are sent via bank transfer or mobile banking, while online payments are refunded to the original payment method."
  },
  {
    category: "Returns",
    question: "Can I exchange an item instead of returning it?",
    answer: "Yes! If you want a different size, color, or similar item, we can arrange an exchange. Contact us to check availability and coordinate the exchange process."
  },

  // Account & Technical
  {
    category: "Account",
    question: "How do I create an account?",
    answer: "Click 'Sign Up' in the top right corner and follow the simple registration process. You can also sign up with your Google account for quick registration."
  },
  {
    category: "Account",
    question: "I forgot my password. How do I reset it?",
    answer: "Click 'Forgot Password' on the sign-in page and enter your email. You'll receive a password reset link via email. If you don't see it, check your spam folder."
  },
  {
    category: "Account",
    question: "Can I change my email address?",
    answer: "Yes, you can update your email address in your account settings. You'll need to verify the new email address before the change takes effect."
  },
  {
    category: "Account",
    question: "How do I delete my account?",
    answer: "Contact our support team at privacy@interiowale.com to request account deletion. We'll permanently delete your account and data within 30 days as per our privacy policy."
  },

  // Products & Inventory
  {
    category: "Products",
    question: "Do you have physical stores?",
    answer: "We&apos;re currently an online-only marketplace, but we&apos;re planning to open physical showrooms in Dhaka and Chittagong soon. Follow us for updates on store locations!"
  },
  {
    category: "Products",
    question: "Are your plants healthy and well-maintained?",
    answer: "Absolutely! All our plants are sourced from trusted nurseries and are health-checked before delivery. We provide care instructions and 7-day support for any plant health issues."
  },
  {
    category: "Products",
    question: "Can I see products before buying?",
    answer: "While we don't have physical stores yet, our product photos are high-quality and detailed. We also offer easy returns if products don't meet your expectations."
  },
  {
    category: "Products",
    question: "Do you offer bulk discounts for large orders?",
    answer: "Yes! Contact us at bulk@interiowale.com for corporate orders, event planning, or large quantity purchases. We offer special pricing for bulk orders and interior design projects."
  },

  // Customer Support
  {
    category: "Support",
    question: "How can I contact customer support?",
    answer: "Call us at +88017-23560254 (9 AM - 9 PM), email support@interiowale.com, or use our website chat. We aim to respond to emails within 24 hours and answer calls during business hours."
  },
  {
    category: "Support",
    question: "What are your customer service hours?",
    answer: "Our phone support is available 9 AM to 9 PM, 7 days a week. Email support is available 24/7 with responses within 24 hours. We&apos;re here to help whenever you need us!"
  },
  {
    category: "Support",
    question: "Do you offer interior design consultation?",
    answer: "Yes! In addition to our AI service, we partner with professional interior designers for custom projects. Contact us to discuss your requirements and get connected with experts."
  }
];

const categories = [
  { name: "All", icon: HelpCircle, count: faqData.length },
  { name: "General", icon: HelpCircle, count: faqData.filter(f => f.category === "General").length },
  { name: "Orders", icon: ShoppingBag, count: faqData.filter(f => f.category === "Orders").length },
  { name: "Payment", icon: CreditCard, count: faqData.filter(f => f.category === "Payment").length },
  { name: "Delivery", icon: Truck, count: faqData.filter(f => f.category === "Delivery").length },
  { name: "AI Design", icon: Palette, count: faqData.filter(f => f.category === "AI Design").length },
  { name: "Returns", icon: HelpCircle, count: faqData.filter(f => f.category === "Returns").length },
  { name: "Account", icon: HelpCircle, count: faqData.filter(f => f.category === "Account").length },
  { name: "Products", icon: ShoppingBag, count: faqData.filter(f => f.category === "Products").length },
  { name: "Support", icon: MessageCircle, count: faqData.filter(f => f.category === "Support").length },
];

const FAQPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<number[]>([]);

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <Container className="max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about InterioWale&apos;s products, services, 
            delivery, and more. Can&apos;t find what you&apos;re looking for? Contact our support team!
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.name}
                      variant={selectedCategory === category.name ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category.name)}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {category.name}
                      <span className="ml-auto text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {filteredFAQs.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No FAQs Found</h3>
                    <p className="text-gray-600 mb-4">
                      We couldn&apos;t find any FAQs matching your search. Try a different search term or category.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("All");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredFAQs.map((faq, index) => (
                  <Card key={index}>
                    <Collapsible
                      open={openItems.includes(index)}
                      onOpenChange={() => toggleItem(index)}
                    >
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-start gap-3">
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                {faq.category}
                              </span>
                              <CardTitle className="text-left text-lg leading-relaxed">
                                {faq.question}
                              </CardTitle>
                            </div>
                            {openItems.includes(index) ? (
                              <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            )}
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          <p className="text-gray-700 leading-relaxed pl-16">
                            {faq.answer}
                          </p>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))
              )}
            </div>

            {/* Contact Support Section */}
            <Card className="mt-8 bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Still Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-800 mb-4">
                  Can&apos;t find the answer you&apos;re looking for? Our friendly customer support team is here to help!
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <Phone className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-sm">Call Us</p>
                      <p className="text-blue-600 text-sm">+88017-23560254</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">Email Us</p>
                      <p className="text-blue-600 text-sm">support@interiowale.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <MessageCircle className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-sm">Live Chat</p>
                      <p className="text-blue-600 text-sm">Available on website</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Support Hours:</strong> 9 AM - 9 PM (7 days a week) | 
                    <strong> Email Response:</strong> Within 24 hours
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default FAQPage;