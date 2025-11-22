'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import {
  User,
  ShoppingBag,
  Building2,
  Settings,
  Save,
  Bell,
  Shield,
  CreditCard,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { useToastActions } from '@/components/ui/toast';

interface UserSettings {
  preferences: {
    enableShopping: boolean;
    enableArchitectureServices: boolean;
    defaultDashboard: 'shopping' | 'architecture';
    emailNotifications: boolean;
    smsNotifications: boolean;
    marketingEmails: boolean;
  };
  profile: {
    firstName: string;
    lastName: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      pincode: string;
      country: string;
    };
  };
  billing: {
    paymentMethods: Array<{
      id: string;
      type: 'card' | 'bank';
      last4: string;
      brand?: string;
      isDefault: boolean;
    }>;
  };
}

export default function UserSettings() {
  const { user } = useUser();
  const { success, error } = useToastActions();
  const [settings, setSettings] = useState<UserSettings>({
    preferences: {
      enableShopping: true,
      enableArchitectureServices: false,
      defaultDashboard: 'shopping',
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: false,
    },
    profile: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'Bangladesh',
      },
    },
    billing: {
      paymentMethods: [],
    },
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserSettings();
    }
  }, [user]);

  const fetchUserSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/settings?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings(prev => ({
            ...prev,
            ...data.settings,
            preferences: {
              ...prev.preferences,
              ...data.settings.preferences
            }
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching user settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/users/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          settings,
        }),
      });

      if (response.ok) {
        success('Settings saved successfully!');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateUserRole = async (newRole: string) => {
    try {
      setSaving(true);
      const response = await fetch('/api/users/role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          role: newRole,
        }),
      });

      if (response.ok) {
        success('Role updated successfully! Please refresh to see changes.');
        // Update preferences based on role
        setSettings(prev => ({
          ...prev,
          preferences: {
            ...prev.preferences,
            enableArchitectureServices: newRole.includes('architect'),
          }
        }));
      } else {
        throw new Error('Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      error('Failed to update role');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dashboard Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Dashboard Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default-dashboard">Default Dashboard</Label>
              <RadioGroup
                value={settings.preferences.defaultDashboard}
                onValueChange={(value: 'shopping' | 'architecture') =>
                  setSettings(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, defaultDashboard: value }
                  }))
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="shopping" id="shopping" />
                  <Label htmlFor="shopping" className="flex items-center">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Shopping
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="architecture" id="architecture" />
                  <Label htmlFor="architecture" className="flex items-center">
                    <Building2 className="w-4 h-4 mr-2" />
                    Architecture
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="enable-shopping">Enable Shopping</Label>
                <Switch
                  id="enable-shopping"
                  checked={settings.preferences.enableShopping}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, enableShopping: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enable-architecture">Enable Architecture Services</Label>
                <Switch
                  id="enable-architecture"
                  checked={settings.preferences.enableArchitectureServices}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, enableArchitectureServices: checked }
                    }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <Switch
                  id="email-notifications"
                  checked={settings.preferences.emailNotifications}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, emailNotifications: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="sms-notifications">SMS Notifications</Label>
                <Switch
                  id="sms-notifications"
                  checked={settings.preferences.smsNotifications}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, smsNotifications: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="marketing-emails">Marketing Emails</Label>
                <Switch
                  id="marketing-emails"
                  checked={settings.preferences.marketingEmails}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, marketingEmails: checked }
                    }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Account Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Role</Label>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Customer</Badge>
                {settings.preferences.enableArchitectureServices && (
                  <Badge variant="secondary">Architecture Client</Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Upgrade Account</Label>
              <p className="text-sm text-gray-600 mb-2">
                Enable additional features for your account
              </p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => updateUserRole('customer_architect_client')}
                  disabled={settings.preferences.enableArchitectureServices}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Enable Architecture Services
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/become-seller'}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Become a Seller
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button variant="destructive" size="sm" className="w-full">
                <Shield className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <input
                  id="firstName"
                  type="text"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={settings.profile.firstName}
                  onChange={(e) =>
                    setSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, firstName: e.target.value }
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <input
                  id="lastName"
                  type="text"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={settings.profile.lastName}
                  onChange={(e) =>
                    setSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, lastName: e.target.value }
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <input
                  id="email"
                  type="email"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  value={user?.emailAddresses?.[0]?.emailAddress || ''}
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email managed by Clerk authentication</p>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <input
                  id="phone"
                  type="tel"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={settings.profile.phone}
                  onChange={(e) =>
                    setSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, phone: e.target.value }
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Address Information</h3>

              <div>
                <Label htmlFor="street">Street Address</Label>
                <input
                  id="street"
                  type="text"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={settings.profile.address.street}
                  onChange={(e) =>
                    setSettings(prev => ({
                      ...prev,
                      profile: {
                        ...prev.profile,
                        address: { ...prev.profile.address, street: e.target.value }
                      }
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <input
                    id="city"
                    type="text"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={settings.profile.address.city}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        profile: {
                          ...prev.profile,
                          address: { ...prev.profile.address, city: e.target.value }
                        }
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <input
                    id="state"
                    type="text"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={settings.profile.address.state}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        profile: {
                          ...prev.profile,
                          address: { ...prev.profile.address, state: e.target.value }
                        }
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pincode">Postal Code</Label>
                  <input
                    id="pincode"
                    type="text"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={settings.profile.address.pincode}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        profile: {
                          ...prev.profile,
                          address: { ...prev.profile.address, pincode: e.target.value }
                        }
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={settings.profile.address.country}
                    onValueChange={(value) =>
                      setSettings(prev => ({
                        ...prev,
                        profile: {
                          ...prev.profile,
                          address: { ...prev.profile.address, country: value }
                        }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bangladesh">Bangladesh</SelectItem>
                      <SelectItem value="India">India</SelectItem>
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}