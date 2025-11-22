'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AccessControlProps {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface PermissionCheckResult {
  hasAccess: boolean;
  reason?: string;
  isLoading: boolean;
}

export function AccessControl({ resource, action, children, fallback }: AccessControlProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [permission, setPermission] = useState<PermissionCheckResult>({
    hasAccess: false,
    isLoading: true,
  });

  useEffect(() => {
    if (!isLoaded) return;

    const checkPermission = async () => {
      try {
        setPermission({ hasAccess: false, isLoading: true });

        const response = await fetch('/api/admin/access/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resource, action }),
        });

        const result = await response.json();

        if (result.success) {
          setPermission(result.data);
        } else {
          setPermission({ hasAccess: false, reason: result.error, isLoading: false });
        }
      } catch (error) {
        console.error('Permission check error:', error);
        setPermission({ hasAccess: false, reason: 'Error checking permissions', isLoading: false });
      }
    };

    checkPermission();
  }, [user, isLoaded, resource, action]);

  if (!isLoaded || permission.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  if (!permission.hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Lock className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {permission.reason || 'You do not have permission to perform this action.'}
              </AlertDescription>
            </Alert>
            <p className="text-sm text-gray-600">
              <strong>Required:</strong> {action} access to {resource}
            </p>
            <div className="space-y-2">
              <Button onClick={() => router.back()} variant="outline" className="w-full">
                Go Back
              </Button>
              <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

// Higher-order component for page-level access control
export function withAccessControl(resource: string, action: 'create' | 'read' | 'update' | 'delete' | 'manage') {
  return function WrappedComponent(props: any) {
    return (
      <AccessControl resource={resource} action={action}>
        <WrappedComponent {...props} />
      </AccessControl>
    );
  };
}

// Hook for checking permissions in components
export function usePermission(resource: string, action: string) {
  const { user, isLoaded } = useUser();
  const [permission, setPermission] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const checkPermission = async () => {
      try {
        const response = await fetch('/api/admin/access/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resource, action }),
        });

        const result = await response.json();
        setPermission(result.success ? result.data.hasAccess : false);
      } catch (error) {
        console.error('Permission check error:', error);
        setPermission(false);
      }
    };

    checkPermission();
  }, [user, isLoaded, resource, action]);

  return permission;
}

// Component for conditional rendering based on permissions
export function PermissionGate({
  resource,
  action,
  children,
  fallback = null,
}: {
  resource: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const hasPermission = usePermission(resource, action);

  if (hasPermission === null) {
    return (
      <div className="flex items-center justify-center p-4">
        <RefreshCw className="h-4 w-4 animate-spin text-gray-400 mr-2" />
        <span className="text-sm text-gray-500">Checking permissions...</span>
      </div>
    );
  }

  return hasPermission ? <>{children}</> : <>{fallback}</>;
}