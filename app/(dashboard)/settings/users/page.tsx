'use client';

import { useState } from 'react';
import { useUsers, useCreateUser, useUpdateUser } from '@/lib/hooks/useUsers';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Loader2, Plus, Users } from 'lucide-react';
import { formatDate } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';
import { User } from '@/lib/types/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'analyst', 'auditor', 'viewer']),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

export default function UsersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data, isLoading } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: CreateUserFormData) => {
    await createUser.mutateAsync(data);
    setIsDialogOpen(false);
    reset();
  };

  const users = data?.users || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage users and their roles"
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent-hover text-background">
              <Plus className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-surface border-border">
            <DialogHeader>
              <DialogTitle className="text-text-primary">Invite New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-text-secondary">Name</label>
                <Input {...register('name')} className="mt-1" />
                {errors.name && (
                  <p className="text-xs text-error mt-1">{errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-text-secondary">Email</label>
                <Input {...register('email')} type="email" className="mt-1" />
                {errors.email && (
                  <p className="text-xs text-error mt-1">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-text-secondary">Role</label>
                <Select onValueChange={(value) => setValue('role', value as CreateUserFormData['role'])}>
                  <SelectTrigger className="mt-1 bg-surface border-border">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-border">
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="analyst">Analyst</SelectItem>
                    <SelectItem value="auditor">Auditor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-xs text-error mt-1">{errors.role.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-text-secondary">Password</label>
                <Input {...register('password')} type="password" className="mt-1" />
                {errors.password && (
                  <p className="text-xs text-error mt-1">{errors.password.message}</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={!isValid || createUser.isPending}
                className="w-full bg-accent hover:bg-accent-hover text-background"
              >
                {createUser.isPending ? 'Creating...' : 'Create User'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-raised/50">
              <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Name</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Email</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Role</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Created</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Last Login</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <Users className="h-12 w-12 text-text-tertiary mx-auto mb-4" />
                  <p className="text-text-secondary">No users found</p>
                </td>
              </tr>
            ) : (
              users.map((user: User, index: number) => (
                <tr
                  key={user.id}
                  className={cn(
                    'border-b border-border last:border-0 hover:bg-surface-raised/50',
                    index % 2 === 1 && 'bg-surface-raised/20'
                  )}
                >
                  <td className="py-3 px-4 text-text-primary">{user.name}</td>
                  <td className="py-3 px-4 text-text-secondary">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={cn(
                      'px-2 py-1 rounded text-xs font-medium uppercase',
                      user.role === 'admin' && 'bg-accent/20 text-accent',
                      user.role === 'analyst' && 'bg-info/20 text-info',
                      user.role === 'auditor' && 'bg-purple-500/20 text-purple-400',
                      user.role === 'viewer' && 'bg-text-tertiary/20 text-text-tertiary'
                    )}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-text-secondary">{formatDate(user.createdAt)}</td>
                  <td className="py-3 px-4 text-text-secondary">
                    {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
