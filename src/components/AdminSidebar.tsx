import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  BarChart3,
  Activity,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  Home,
} from 'lucide-react';

const navItems = [
  { path: '/admin', label: '数据概览', icon: BarChart3 },
  { path: '/admin/tests', label: '前后测统计', icon: Activity },
  { path: '/admin/behavior', label: '行为统计', icon: Users },
  { path: '/admin/progress', label: '进度管理', icon: FileText },
  { path: '/admin/content', label: '内容编辑', icon: FileText },
  { path: '/admin/config', label: 'API配置', icon: Settings },
];

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-sidebar-primary-foreground" />
          <span className="font-bold text-sidebar-primary-foreground">LearnMeta 后台</span>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors text-left ${
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="p-3 space-y-2 border-t border-sidebar-border">
        <button
          type="button"
          onClick={() => navigate('/learn')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-left"
        >
          <Home className="w-4 h-4 shrink-0" />
          返回学习端
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-left"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          退出登录
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 桌面端侧边栏 */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-sidebar border-r border-sidebar-border">
        <NavContent />
      </aside>

      {/* 移动端侧边栏 */}
      <div className="md:hidden fixed top-0 left-0 z-40 p-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-sidebar">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}