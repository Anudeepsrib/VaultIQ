'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/lib/stores/authStore';
import { useCurrentUser } from '@/lib/hooks/useAuth';
import { Loader2, User, Mail, Shield } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useCurrentUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Settings"
        description="Manage your account settings and preferences"
      />

      <div className="space-y-6">
        <Card className="p-6 bg-surface border-border">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center">
              <User className="h-8 w-8 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-text-primary">{user.name}</h3>
              <p className="text-sm text-text-secondary capitalize">{user.role}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-text-secondary flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <Input value={user.email} disabled className="mt-1 bg-surface-raised" />
            </div>

            <div>
              <label className="text-sm text-text-secondary flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Role
              </label>
              <Input value={user.role} disabled className="mt-1 bg-surface-raised capitalize" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-surface border-border">
          <h3 className="text-lg font-medium text-text-primary mb-4">Preferences</h3>
          <p className="text-sm text-text-tertiary">
            Additional preferences will be available in a future update.
          </p>
        </Card>
      </div>
    </div>
  );
}
