'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Mail, UserPlus, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface EmployeeInviteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function EmployeeInviteForm({ open, onOpenChange, onSuccess }: EmployeeInviteFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [createdEmployee, setCreatedEmployee] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'customer_support',
    department: '',
  });

  const roles = [
    { value: 'platform_admin', label: 'Platform Admin', description: 'Full platform management access' },
    { value: 'store_moderator', label: 'Store Moderator', description: 'Moderate stores and content' },
    { value: 'delivery_manager', label: 'Delivery Manager', description: 'Manage shipments and delivery operations' },
    { value: 'customer_support', label: 'Customer Support', description: 'Handle customer issues and tickets' },
    { value: 'content_moderator', label: 'Content Moderator', description: 'Moderate products and reviews' },
  ];

  const departments = [
    'Management',
    'Operations',
    'Customer Support',
    'Content Moderation',
    'Delivery & Logistics',
    'Technical',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.firstName || !formData.lastName || !formData.role) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/employees/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setCreatedEmployee(result.data);
        setStep('success');
        toast.success('Employee invited successfully!');
        onSuccess?.();
      } else {
        toast.error(result.error || 'Failed to invite employee');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to invite employee');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      role: 'customer_support',
      department: '',
    });
    setStep('form');
    setCreatedEmployee(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Team Member
          </DialogTitle>
          <DialogDescription>
            Send an invitation to join your admin team
          </DialogDescription>
        </DialogHeader>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="First name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Last name"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="employee@company.com"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-sm text-gray-500">{role.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">What happens next:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>We'll create a user account in Clerk for this email</li>
                    <li>An employee record will be created with assigned permissions</li>
                    <li>The employee can login using their email and a temporary password</li>
                    <li>They'll get admin access based on their assigned role</li>
                  </ul>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Inviting...' : 'Send Invitation'}
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
                Invitation Sent Successfully!
              </h3>
              <p className="text-gray-600">
                Team member account has been created
              </p>
            </div>

            {createdEmployee && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Employee Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600">Name</Label>
                      <p className="font-medium">
                        {createdEmployee.employee?.firstName} {createdEmployee.employee?.lastName}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Email</Label>
                      <p className="font-medium">{createdEmployee.employee?.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Role</Label>
                      <Badge variant="outline">
                        {roles.find(r => r.value === createdEmployee.employee?.role)?.label}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Employee ID</Label>
                      <p className="font-medium font-mono text-sm">
                        {createdEmployee.employee?.employmentDetails?.employeeId}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm text-gray-600">Login Instructions</Label>
                        <p className="text-sm mt-1">
                          Employee can login at{' '}
                          <span className="font-medium">your-domain.com/login</span>
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard('your-domain.com/login')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-1">Next Steps:</p>
                  <ol className="list-decimal list-inside space-y-1 text-green-700">
                    <li>Share the login URL with the new employee</li>
                    <li>They'll use their email and temporary password to login</li>
                    <li>They should reset their password after first login</li>
                    <li>They'll have access to admin panel based on their role</li>
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