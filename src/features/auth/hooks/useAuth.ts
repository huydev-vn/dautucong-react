import { useAuthStore } from '../stores/auth.store';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);

  const hasRole = (...roles: string[]) =>
    !!user && roles.includes(user.role);

  const canAccess = (resource: string, action: 'create' | 'read' | 'update' | 'delete') => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions.some(
      (p) => p.resource === resource && p.actions.includes(action),
    );
  };

  return { user, isAuthenticated, login, logout, hasRole, canAccess };
}
