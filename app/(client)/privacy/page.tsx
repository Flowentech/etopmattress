import React from "react";
import Container from "@/components/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Eye, Lock, Database, Globe, AlertTriangle } from "lucide-react";

const PrivacyPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <Container className="max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
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
                <Eye className="w-5 h-5 text-blue-600" />
                Our Commitment to Your Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                At InterioWale (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), we respect your privacy and are committed 
                to protecting your personal data. This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you visit our website 
                interiowale.com and use our services.
              </p>
              <p>
                By using our Service, you consent to the collection and use of information 
                in accordance with this Privacy Policy.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-600" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Personal Information</h4>
                <p className="text-gray-700 mb-2">
                  We collect personal information that you voluntarily provide to us when you:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Create an account or register for our services</li>
                  <li>Place an order or make a purchase</li>
                  <li>Subscribe to our newsletter or marketing communications</li>
                  <li>Contact us for customer support</li>
                  <li>Use our AI interior design services</li>
                  <li>Leave reviews or feedback</li>
                  <li>Participate in surveys or promotions</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Types of Personal Data</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li><strong>Contact Information:</strong> Name, email address, phone number</li>
                  <li><strong>Address Information:</strong> Billing and delivery addresses</li>
                  <li><strong>Payment Information:</strong> Payment method details (securely processed)</li>
                  <li><strong>Account Information:</strong> Username, password, preferences</li>
                  <li><strong>Order Information:</strong> Purchase history, order details</li>
                  <li><strong>Images:</strong> Photos uploaded for AI design services</li>
                  <li><strong>Communication:</strong> Messages, reviews, support requests</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Automatically Collected Information</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                  <li><strong>Usage Data:</strong> Pages visited, time spent, click patterns</li>
                  <li><strong>Cookies:</strong> Website preferences, shopping cart contents</li>
                  <li><strong>Location Data:</strong> Approximate location for delivery services</li>
                  <li><strong>Analytics:</strong> Website performance and user behavior patterns</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Third-Party Information</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li><strong>Social Media:</strong> Public profile information when you connect social accounts</li>
                  <li><strong>Payment Processors:</strong> Transaction verification data from Stripe</li>
                  <li><strong>Authentication:</strong> Basic profile data from Clerk authentication service</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card>
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Service Provision</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Process and fulfill your orders</li>
                  <li>Provide customer support and respond to inquiries</li>
                  <li>Deliver products to your specified address</li>
                  <li>Generate AI interior design recommendations</li>
                  <li>Manage your account and preferences</li>
                  <li>Process payments and prevent fraud</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Communication</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Send order confirmations and delivery updates</li>
                  <li>Provide customer support via email, phone, or chat</li>
                  <li>Send newsletter and promotional emails (with consent)</li>
                  <li>Notify you about service updates or policy changes</li>
                  <li>Respond to your questions and feedback</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Business Operations</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Improve our website and services</li>
                  <li>Analyze usage patterns and customer preferences</li>
                  <li>Develop new products and features</li>
                  <li>Conduct market research and analytics</li>
                  <li>Ensure security and prevent fraud</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Marketing and Personalization</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Personalize your shopping experience</li>
                  <li>Recommend products based on your interests</li>
                  <li>Send targeted marketing communications</li>
                  <li>Create customer segments for better service</li>
                  <li>Track campaign effectiveness</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* AI Services Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>AI Interior Design Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Image Processing</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Images uploaded for AI design are processed using third-party AI services</li>
                  <li>Images are temporarily stored for processing and deleted after completion</li>
                  <li>We do not use your images for training AI models without consent</li>
                  <li>Generated designs may be used to improve our services</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Data Retention</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Uploaded images are deleted within 30 days</li>
                  <li>Design results are stored in your account for future reference</li>
                  <li>Usage statistics are retained for service improvement</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Information Sharing */}
          <Card>
            <CardHeader>
              <CardTitle>How We Share Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Service Providers</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li><strong>Payment Processing:</strong> Stripe for secure payment processing</li>
                  <li><strong>Authentication:</strong> Clerk for user authentication and management</li>
                  <li><strong>Email Services:</strong> Email service providers for transactional emails</li>
                  <li><strong>Delivery Partners:</strong> Courier services for product delivery</li>
                  <li><strong>AI Services:</strong> Third-party AI providers for interior design generation</li>
                  <li><strong>Analytics:</strong> Google Analytics for website performance tracking</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Business Transfers</h4>
                <p className="text-gray-700">
                  In the event of a merger, acquisition, or sale of assets, your personal 
                  information may be transferred as part of the business assets.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Legal Requirements</h4>
                <p className="text-gray-700">
                  We may disclose your information if required by law, court order, or to 
                  protect our rights, property, or safety, or that of our users.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">We Do NOT Sell Your Data</h4>
                <p className="text-gray-700 font-medium">
                  We do not sell, trade, or rent your personal information to third parties 
                  for their marketing purposes.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-green-600" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Security Measures</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>SSL/TLS encryption for data transmission</li>
                  <li>Secure payment processing through Stripe</li>
                  <li>Regular security audits and monitoring</li>
                  <li>Access controls and authentication systems</li>
                  <li>Data encryption at rest</li>
                  <li>Regular security updates and patches</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Data Storage</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Data stored on secure cloud infrastructure</li>
                  <li>Regular backups and disaster recovery procedures</li>
                  <li>Compliance with industry security standards</li>
                  <li>Limited access to personal data on need-to-know basis</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-1">Security Limitation</h4>
                    <p className="text-yellow-700 text-sm">
                      While we implement robust security measures, no method of transmission 
                      over the internet is 100% secure. We cannot guarantee absolute security.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle>Your Privacy Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Access and Control</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li><strong>Access:</strong> Request copies of your personal data</li>
                  <li><strong>Correction:</strong> Update or correct your personal information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                  <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
                  <li><strong>Restriction:</strong> Limit how we process your data</li>
                  <li><strong>Objection:</strong> Object to certain types of processing</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Communication Preferences</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Unsubscribe from marketing emails at any time</li>
                  <li>Manage notification preferences in your account</li>
                  <li>Opt-out of non-essential communications</li>
                  <li>Control cookie preferences through browser settings</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Account Management</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Update your account information anytime</li>
                  <li>Change privacy settings in your profile</li>
                  <li>Delete your account and associated data</li>
                  <li>Download your data before account deletion</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Cookies and Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Cookies and Tracking Technologies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Types of Cookies We Use</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li><strong>Essential Cookies:</strong> Required for website functionality</li>
                  <li><strong>Performance Cookies:</strong> Help us improve website performance</li>
                  <li><strong>Functionality Cookies:</strong> Remember your preferences</li>
                  <li><strong>Marketing Cookies:</strong> Deliver relevant advertisements</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Third-Party Tracking</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Google Analytics for website analytics</li>
                  <li>Social media plugins (with your consent)</li>
                  <li>Payment processor tracking for fraud prevention</li>
                  <li>Marketing platform pixels for ad optimization</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Managing Cookies</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Control cookies through your browser settings</li>
                  <li>Opt-out of non-essential cookies</li>
                  <li>Clear cookies and browsing data anytime</li>
                  <li>Use private/incognito browsing mode</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* International Transfers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                International Data Transfers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Your information may be transferred to and maintained on computers located 
                outside of Bangladesh, where data protection laws may differ from those in 
                your jurisdiction.
              </p>
              
              <div>
                <h4 className="font-semibold mb-2">Third-Party Services</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Stripe (payment processing) - operates globally with strong data protection</li>
                  <li>Clerk (authentication) - complies with international privacy standards</li>
                  <li>AI service providers - may process data in various jurisdictions</li>
                  <li>Cloud storage providers - data stored in secure international data centers</li>
                </ul>
              </div>

              <p>
                We ensure that any international transfers are conducted with appropriate 
                safeguards to protect your personal information.
              </p>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle>Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Retention Periods</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li><strong>Account Data:</strong> Until account deletion or 3 years of inactivity</li>
                  <li><strong>Order History:</strong> 7 years for tax and legal compliance</li>
                  <li><strong>Marketing Data:</strong> Until unsubscription or 2 years of inactivity</li>
                  <li><strong>Support Communications:</strong> 2 years after resolution</li>
                  <li><strong>AI Images:</strong> 30 days maximum, then permanently deleted</li>
                  <li><strong>Analytics Data:</strong> Aggregated data retained indefinitely</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Deletion Criteria</h4>
                <p className="text-gray-700">
                  We delete personal data when it&apos;s no longer necessary for the purposes 
                  for which it was collected, unless required by law to retain it longer.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>Children&apos;s Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3">
                Our Service is not intended for children under 18 years of age. We do not 
                knowingly collect personally identifiable information from children under 18.
              </p>
              <p>
                If you are a parent or guardian and you are aware that your child has provided 
                us with personal data, please contact us. If we become aware that we have 
                collected personal data from children without verification of parental consent, 
                we take steps to remove that information from our servers.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Privacy Policy */}
          <Card>
            <CardHeader>
              <CardTitle>Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3">
                We may update our Privacy Policy from time to time. We will notify you of 
                any changes by posting the new Privacy Policy on this page and updating 
                the &quot;Last updated&quot; date.
              </p>
              <p className="mb-3">
                For significant changes, we may also notify you via email or through a 
                prominent notice on our website.
              </p>
              <p>
                You are advised to review this Privacy Policy periodically for any changes. 
                Changes to this Privacy Policy are effective when they are posted on this page.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Us About Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Privacy Officer:</strong> InterioWale Privacy Team</p>
                <p><strong>Email:</strong> privacy@interiowale.com</p>
                <p><strong>Phone:</strong> +88017-23560254</p>
                <p><strong>Address:</strong> Dhaka, Bangladesh</p>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <p className="font-semibold">For Privacy-Related Requests:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                  <li>Include &quot;Privacy Request&quot; in your email subject</li>
                  <li>Provide your full name and email address</li>
                  <li>Clearly describe your request</li>
                  <li>We will respond within 30 days</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default PrivacyPage;