import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { routes } from '@/routes';
import { supabase } from '@/db/supabase';

interface RouteGuardProps {
  children: React.ReactNode;
}

const SYSTEM_PUBLIC_ROUTES = ['/login', '/403', '/404'];
const routePublicPaths = routes.filter(r => r.public).map(r => r.path);
const PUBLIC_ROUTES = [...SYSTEM_PUBLIC_ROUTES, ...routePublicPaths];

// 仅管理员可访问的路由
const ADMIN_ROUTES = ['/admin', '/admin/tests', '/admin/behavior', '/admin/progress', '/admin/content', '/admin/config'];

function matchPublicRoute(path: string, patterns: string[]) {
  return patterns.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
      return regex.test(path);
    }
    return path === pattern;
  });
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    async function checkRole() {
      if (!user) {
        setCheckingRole(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (error) throw error;
        setUserRole(data?.role || 'user');
      } catch {
        setUserRole('user');
      } finally {
        setCheckingRole(false);
      }
    }
    checkRole();
  }, [user]);

  useEffect(() => {
    if (loading || checkingRole) return;

    const isPublic = matchPublicRoute(location.pathname, PUBLIC_ROUTES);

    // 未登录且访问非公开页面
    if (!user && !isPublic) {
      navigate('/', { state: { from: location.pathname }, replace: true });
      return;
    }

    // 非管理员访问管理员页面
    const isAdminRoute = ADMIN_ROUTES.some(route => location.pathname === route);
    if (isAdminRoute && userRole !== 'admin') {
      navigate('/learn', { replace: true });
      return;
    }
  }, [user, loading, checkingRole, location.pathname, navigate, userRole]);

  if (loading || checkingRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}