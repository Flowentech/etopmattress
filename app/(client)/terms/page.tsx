import React from "react";
import Container from "@/components/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Scale, Shield, AlertCircle } from "lucide-react";

const TermsPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <Container className="max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Terms & Conditions</h1>
          </div>
          <p className="text-gray-600">
            Last updated: {new Date().toLocaleDateString("en-US", { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Welcome to InterioWale (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). These Terms and Conditions (&quot;Terms&quot;) 
                govern your use of our website and services located at interiowale.com (the &quot;Service&quot;) 
                operated by InterioWale.
              </p>
              <p>
                By accessing or using our Service, you agree to be bound by these Terms. If you 
                disagree with any part of these terms, then you may not access the Service.
              </p>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle>Our Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Interior Design Products</h4>
                <p className="text-gray-700">
                  We provide a marketplace for interior design products including furniture, 
                  home decor, plants, and landscaping materials delivered across Bangladesh.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">AI Interior Design Services</h4>
                <p className="text-gray-700">
                  We offer AI-powered interior design consultation services using artificial 
                  intelligence to help customers visualize and plan their spaces.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Delivery Services</h4>
                <p className="text-gray-700">
                  We provide delivery services across major cities in Bangladesh including 
                  Dhaka, Chittagong, Sylhet, and other major metropolitan areas.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card>
            <CardHeader>
              <CardTitle>User Accounts and Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Account Creation</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>You may create an account to access additional features</li>
                  <li>Guest shopping is available without registration</li>
                  <li>You must provide accurate and complete information</li>
                  <li>You are responsible for maintaining account security</li>
                  <li>You must be at least 18 years old to create an account</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Account Responsibilities</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Keep your login credentials confidential</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Use the account only for lawful purposes</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Orders and Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Orders, Payments & Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Order Process</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Orders are subject to acceptance and availability</li>
                  <li>We reserve the right to refuse or cancel orders</li>
                  <li>Prices are subject to change without notice</li>
                  <li>Order confirmation will be sent via email or SMS</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Payment Methods</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li><strong>Cash on Delivery (COD):</strong> Pay when your order arrives</li>
                  <li><strong>Online Payment:</strong> Secure payment via Stripe</li>
                  <li><strong>Mobile Banking:</strong> bKash, Nagad, Rocket (coming soon)</li>
                  <li>All prices are in Bangladeshi Taka (BDT)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Delivery Terms</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Delivery times are estimates and not guaranteed</li>
                  <li>Free delivery within major cities in Bangladesh</li>
                  <li>Delivery charges may apply for remote areas</li>
                  <li>Someone must be present to receive the delivery</li>
                  <li>Risk of loss transfers upon delivery</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Returns and Refunds */}
          <Card>
            <CardHeader>
              <CardTitle>Returns & Refunds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Return Policy</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>7-day return policy for most items</li>
                  <li>Items must be in original condition and packaging</li>
                  <li>Custom/personalized items are non-returnable</li>
                  <li>Plants and perishable items are non-returnable</li>
                  <li>Return shipping costs may apply</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Refund Process</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Refunds processed within 7-14 business days</li>
                  <li>COD refunds via bank transfer or mobile banking</li>
                  <li>Online payments refunded to original payment method</li>
                  <li>Shipping charges are non-refundable</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* AI Services */}
          <Card>
            <CardHeader>
              <CardTitle>AI Interior Design Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Credit System</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>AI design services operate on a credit-based system</li>
                  <li>Credits are non-refundable and non-transferable</li>
                  <li>Credits expire 12 months from purchase date</li>
                  <li>Unused credits cannot be converted to cash</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Service Limitations</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>AI designs are suggestions, not professional advice</li>
                  <li>Results depend on quality of uploaded images</li>
                  <li>We do not guarantee specific design outcomes</li>
                  <li>Professional consultation may be required for complex projects</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle>Intellectual Property Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Our Content</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>All website content is owned by InterioWale or licensed</li>
                  <li>Unauthorized use of our content is prohibited</li>
                  <li>Product images and descriptions are protected</li>
                  <li>AI-generated designs remain our intellectual property</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">User Content</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>You retain rights to content you upload</li>
                  <li>You grant us license to use uploaded content for service provision</li>
                  <li>You must have rights to any content you upload</li>
                  <li>We may remove inappropriate content at our discretion</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Prohibited Uses */}
          <Card>
            <CardHeader>
              <CardTitle>Prohibited Uses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3">You may not use our Service:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>For any unlawful purpose or to solicit others to unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations or laws</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
                <li>To upload viruses or any other type of malicious code</li>
                <li>To collect or track personal information of others</li>
                <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
                <li>For any obscene or immoral purpose</li>
                <li>To interfere with or circumvent security features of the Service</li>
              </ul>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                Disclaimers & Limitations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Service Availability</h4>
                <p className="text-gray-700">
                  We do not guarantee that the service will be available at all times. 
                  We may experience hardware, software, or other problems or need to perform 
                  maintenance related to the service, resulting in interruptions, delays, or errors.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Limitation of Liability</h4>
                <p className="text-gray-700">
                  In no case shall InterioWale, our directors, officers, employees, affiliates, 
                  agents, contractors, interns, suppliers, service providers, or licensors be 
                  liable for any injury, loss, claim, or any direct, indirect, incidental, 
                  punitive, special, or consequential damages of any kind.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle>Governing Law & Jurisdiction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                These Terms shall be interpreted and governed by the laws of Bangladesh. 
                Any disputes arising from these Terms or your use of the Service will be 
                subject to the jurisdiction of the courts of Dhaka, Bangladesh.
              </p>
              
              <div>
                <h4 className="font-semibold mb-2">Dispute Resolution</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>We encourage resolving disputes through direct communication first</li>
                  <li>Mediation may be pursued before formal legal proceedings</li>
                  <li>Local consumer protection laws apply where applicable</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3">
                We reserve the right, at our sole discretion, to modify or replace these Terms 
                at any time. If a revision is material, we will try to provide at least 30 days 
                notice prior to any new terms taking effect.
              </p>
              <p>
                By continuing to access or use our Service after those revisions become effective, 
                you agree to be bound by the revised terms.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Company:</strong> InterioWale</p>
                <p><strong>Phone:</strong> +88017-23560254</p>
                <p><strong>Email:</strong> legal@interiowale.com</p>
                <p><strong>Address:</strong> Dhaka, Bangladesh</p>
              </div>
              
              <Separator className="my-4" />
              
              <p className="text-sm text-gray-600">
                If you have any questions about these Terms and Conditions, please contact us 
                using the information provided above.
              </p>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default TermsPage;