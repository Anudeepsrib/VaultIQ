'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { permissions } from '@/lib/utils/permissions';
import { cn } from '@/lib/utils/cn';
import {
  FileText,
  Search,
  BarChart3,
  ClipboardList,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredRole?: (role: string) => boolean;
}

const navItems: NavItem[] = [
  { label: 'Documents', href: '/documents', icon: FileText },
  { label: 'Query', href: '/query', icon: Search },
  {
    label: 'Benchmarks',
    href: '/benchmarks',
    icon: BarChart3,
    requiredRole: permissions.canViewBenchmarks,
  },
  {
    label: 'Audit Log',
    href: '/audit',
    icon: ClipboardList,
    requiredRole: permissions.canViewAuditLog,
  },
  {
    label: 'Users',
    href: '/settings/users',
    icon: Users,
    requiredRole: permissions.canManageUsers,
  },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role, user } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
  };

  const visibleNavItems = navItems.filter((item) => {
    if (!item.requiredRole) return true;
    return role ? item.requiredRole(role) : false;
  });

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-surface border-r border-border flex flex-col transition-all duration-300 z-50',
        isCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-border">
        <Link href="/documents" className="flex items-center gap-1">
          <img
            src="/logo.png"
            alt="VaultIQ"
            className={cn('h-8 w-auto', isCollapsed ? 'hidden' : 'block')}
          />
          <span
            className={cn(
              'font-mono text-text-primary text-xl',
              isCollapsed && 'text-accent'
            )}
          >
            {isCollapsed && 'IQ'}
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'text-accent border-l-2 border-accent bg-accent-muted'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised',
                isCollapsed && 'justify-center px-2'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-accent')} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border p-4">
        {/* Collapse button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="w-full mb-4 text-text-secondary hover:text-text-primary"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <div className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              <span className="text-xs">Collapse</span>
            </div>
          )}
        </Button>

        {/* Role badge */}
        {role && (
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-md bg-surface-raised',
              isCollapsed && 'justify-center px-1'
            )}
          >
            <div className="h-2 w-2 rounded-full bg-accent" />
            {!isCollapsed && (
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                {role}
              </span>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
