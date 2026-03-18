import { Role } from '@/lib/types/auth';

export const permissions = {
  canUpload: (role: Role) => ['admin', 'analyst'].includes(role),
  canExportJSON: (role: Role) => ['admin', 'analyst'].includes(role),
  canDelete: (role: Role) => role === 'admin',
  canViewBenchmarks: (role: Role) => ['admin', 'analyst'].includes(role),
  canViewAuditLog: (role: Role) => ['admin', 'auditor'].includes(role),
  canManageUsers: (role: Role) => role === 'admin',
  canQuery: (role: Role) => ['admin', 'analyst', 'auditor', 'viewer'].includes(role),
  canRunBenchmark: (role: Role) => ['admin', 'analyst'].includes(role),
  canExportAuditCSV: (role: Role) => role === 'admin',
  canReExtract: (role: Role) => ['admin', 'analyst'].includes(role),
  canViewUsers: (role: Role) => role === 'admin',
};

export const roleHierarchy: Record<Role, number> = {
  admin: 4,
  analyst: 3,
  auditor: 2,
  viewer: 1,
};

export function hasMinimumRole(userRole: Role, requiredRole: Role): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
