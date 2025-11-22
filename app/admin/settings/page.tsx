'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Globe,
  Bell,
  Shield,
  Database,
  Mail,
  Palette,
  CreditCard,
  Smartphone,
  RefreshCw,
  Save,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SiteSettings {
  siteName: string;
  siteUrl: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  socialLogin: {
    google: boolean;
    facebook: boolean;
    github: boolean;
  };
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  orderNotifications: boolean;
  commissionNotifications: boolean;
  marketingEmails: boolean;
}

interface PaymentSettings {
  stripeEnabled: boolean;
  stripePublicKey: string;
  paypalEnabled: boolean;
  paypalEmail: string;
  currency: string;
  taxRate: number;
}

interface SystemSettings {
  maxUploadSize: number;
  allowedFileTypes: string[];
  cacheEnabled: boolean;
  backupEnabled: boolean;
  debugMode: boolean;
  apiRateLimit: number;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: 'Interiowale',
    siteUrl: 'https://interiowale.com',
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#10b981',
    secondaryColor: '#6366f1',
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    socialLogin: {
      google: true,
      facebook: false,
      github: false
    }
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    orderNotifications: true,
    commissionNotifications: true,
    marketingEmails: false
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    stripeEnabled: false,
    stripePublicKey: '',
    paypalEnabled: false,
    paypalEmail: '',
    currency: 'USD',
    taxRate: 0
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    maxUploadSize: 10485760, // 10MB
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
    cacheEnabled: true,
    backupEnabled: true,
    debugMode: false,
    apiRateLimit: 100
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // In a real app, these would be API calls
      // For now, we'll use the default values
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (category: string) => {
    try {
      setSaving(true);

      // In a real app, this would be an API call
      // For now, we'll just simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success(`${category} settings saved successfully`);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const testEmailSettings = async () => {
    try {
      // In a real app, this would test email configuration
      toast.success('Test email sent successfully');
    } catch (error) {
      toast.error('Failed to send test email');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded w-full animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-600">Manage your application settings and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadSettings} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Site Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={siteSettings.siteName}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    placeholder="Interiowale"
                  />
                </div>
                <div>
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    value={siteSettings.siteUrl}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, siteUrl: e.target.value }))}
                    placeholder="https://interiowale.com"
                  />
                </div>
                <div>
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    value={siteSettings.logoUrl}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div>
                  <Label htmlFor="faviconUrl">Favicon URL</Label>
                  <Input
                    id="faviconUrl"
                    value={siteSettings.faviconUrl}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, faviconUrl: e.target.value }))}
                    placeholder="https://example.com/favicon.ico"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={siteSettings.primaryColor}
                      onChange={(e) => setSiteSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-20"
                    />
                    <Input
                      value={siteSettings.primaryColor}
                      onChange={(e) => setSiteSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                      placeholder="#10b981"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={siteSettings.secondaryColor}
                      onChange={(e) => setSiteSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="w-20"
                    />
                    <Input
                      value={siteSettings.secondaryColor}
                      onChange={(e) => setSiteSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      placeholder="#6366f1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">User Registration</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowRegistration">Allow User Registration</Label>
                    <p className="text-sm text-gray-600">Enable new user registration on your site</p>
                  </div>
                  <Switch
                    id="allowRegistration"
                    checked={siteSettings.allowRegistration}
                    onCheckedChange={(checked) => setSiteSettings(prev => ({ ...prev, allowRegistration: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                    <p className="text-sm text-gray-600">Users must verify their email address</p>
                  </div>
                  <Switch
                    id="requireEmailVerification"
                    checked={siteSettings.requireEmailVerification}
                    onCheckedChange={(checked) => setSiteSettings(prev => ({ ...prev, requireEmailVerification: checked }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Social Login</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="googleLogin">Google Login</Label>
                    <p className="text-sm text-gray-600">Allow users to sign in with Google</p>
                  </div>
                  <Switch
                    id="googleLogin"
                    checked={siteSettings.socialLogin.google}
                    onCheckedChange={(checked) => setSiteSettings(prev => ({
                      ...prev,
                      socialLogin: { ...prev.socialLogin, google: checked }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="facebookLogin">Facebook Login</Label>
                    <p className="text-sm text-gray-600">Allow users to sign in with Facebook</p>
                  </div>
                  <Switch
                    id="facebookLogin"
                    checked={siteSettings.socialLogin.facebook}
                    onCheckedChange={(checked) => setSiteSettings(prev => ({
                      ...prev,
                      socialLogin: { ...prev.socialLogin, facebook: checked }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="githubLogin">GitHub Login</Label>
                    <p className="text-sm text-gray-600">Allow users to sign in with GitHub</p>
                  </div>
                  <Switch
                    id="githubLogin"
                    checked={siteSettings.socialLogin.github}
                    onCheckedChange={(checked) => setSiteSettings(prev => ({
                      ...prev,
                      socialLogin: { ...prev.socialLogin, github: checked }
                    }))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <p className="text-sm text-gray-600">Put your site in maintenance mode</p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={siteSettings.maintenanceMode}
                  onCheckedChange={(checked) => setSiteSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                />
              </div>

              <Button onClick={() => saveSettings('General')} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-gray-600">Enable email notifications system-wide</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="orderNotifications">Order Notifications</Label>
                  <p className="text-sm text-gray-600">Send emails for new orders and status updates</p>
                </div>
                <Switch
                  id="orderNotifications"
                  checked={notificationSettings.orderNotifications}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, orderNotifications: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="commissionNotifications">Commission Notifications</Label>
                  <p className="text-sm text-gray-600">Notify sellers about commission payouts</p>
                </div>
                <Switch
                  id="commissionNotifications"
                  checked={notificationSettings.commissionNotifications}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, commissionNotifications: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="marketingEmails">Marketing Emails</Label>
                  <p className="text-sm text-gray-600">Send promotional emails to users</p>
                </div>
                <Switch
                  id="marketingEmails"
                  checked={notificationSettings.marketingEmails}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, marketingEmails: checked }))}
                />
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" onClick={testEmailSettings}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Test Email
                </Button>
              </div>

              <Button onClick={() => saveSettings('Notifications')} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Gateway Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Stripe</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="stripeEnabled">Enable Stripe</Label>
                    <p className="text-sm text-gray-600">Accept payments via Stripe</p>
                  </div>
                  <Switch
                    id="stripeEnabled"
                    checked={paymentSettings.stripeEnabled}
                    onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, stripeEnabled: checked }))}
                  />
                </div>
                <div>
                  <Label htmlFor="stripePublicKey">Stripe Public Key</Label>
                  <Input
                    id="stripePublicKey"
                    value={paymentSettings.stripePublicKey}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, stripePublicKey: e.target.value }))}
                    placeholder="pk_test_..."
                    type="password"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">PayPal</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="paypalEnabled">Enable PayPal</Label>
                    <p className="text-sm text-gray-600">Accept payments via PayPal</p>
                  </div>
                  <Switch
                    id="paypalEnabled"
                    checked={paymentSettings.paypalEnabled}
                    onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, paypalEnabled: checked }))}
                  />
                </div>
                <div>
                  <Label htmlFor="paypalEmail">PayPal Email</Label>
                  <Input
                    id="paypalEmail"
                    value={paymentSettings.paypalEmail}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, paypalEmail: e.target.value }))}
                    placeholder="payments@example.com"
                    type="email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="currency">Default Currency</Label>
                  <select
                    id="currency"
                    value={paymentSettings.currency}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="INR">INR - Indian Rupee</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    value={paymentSettings.taxRate}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <Button onClick={() => saveSettings('Payments')} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="maxUploadSize">Max Upload Size (bytes)</Label>
                  <Input
                    id="maxUploadSize"
                    type="number"
                    value={systemSettings.maxUploadSize}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, maxUploadSize: parseInt(e.target.value) }))}
                    placeholder="10485760"
                  />
                </div>
                <div>
                  <Label htmlFor="apiRateLimit">API Rate Limit (requests/minute)</Label>
                  <Input
                    id="apiRateLimit"
                    type="number"
                    value={systemSettings.apiRateLimit}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, apiRateLimit: parseInt(e.target.value) }))}
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">System Features</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="cacheEnabled">Enable Caching</Label>
                    <p className="text-sm text-gray-600">Improve performance with caching</p>
                  </div>
                  <Switch
                    id="cacheEnabled"
                    checked={systemSettings.cacheEnabled}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, cacheEnabled: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="backupEnabled">Enable Backups</Label>
                    <p className="text-sm text-gray-600">Automatically backup your data</p>
                  </div>
                  <Switch
                    id="backupEnabled"
                    checked={systemSettings.backupEnabled}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, backupEnabled: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="debugMode">Debug Mode</Label>
                    <p className="text-sm text-gray-600">Enable detailed error logging</p>
                  </div>
                  <Switch
                    id="debugMode"
                    checked={systemSettings.debugMode}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, debugMode: checked }))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-800">System Status</p>
                    <p className="text-sm text-yellow-600">All systems operational</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Healthy
                </Badge>
              </div>

              <Button onClick={() => saveSettings('System')} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}