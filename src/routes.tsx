import LoginPage from './pages/LoginPage';
import LearningPage from './pages/LearningPage';
import NotesReviewPage from './pages/NotesReviewPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import TestStatsPage from './pages/admin/TestStatsPage';
import BehaviorStatsPage from './pages/admin/BehaviorStatsPage';
import ProgressManagementPage from './pages/admin/ProgressManagementPage';
import ContentEditorPage from './pages/admin/ContentEditorPage';
import APIConfigPage from './pages/admin/APIConfigPage';
import type { ReactNode } from 'react';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  {
    name: '登录',
    path: '/',
    element: <LoginPage />,
    public: true,
  },
  {
    name: '学习',
    path: '/learn',
    element: <LearningPage />,
    public: false,
  },
  {
    name: '笔记回顾',
    path: '/notes',
    element: <NotesReviewPage />,
    public: false,
  },
  {
    name: '后台概览',
    path: '/admin',
    element: <AdminDashboard />,
    public: false,
  },
  {
    name: '前后测统计',
    path: '/admin/tests',
    element: <TestStatsPage />,
    public: false,
  },
  {
    name: '行为统计',
    path: '/admin/behavior',
    element: <BehaviorStatsPage />,
    public: false,
  },
  {
    name: '进度管理',
    path: '/admin/progress',
    element: <ProgressManagementPage />,
    public: false,
  },
  {
    name: '内容编辑',
    path: '/admin/content',
    element: <ContentEditorPage />,
    public: false,
  },
  {
    name: 'API配置',
    path: '/admin/config',
    element: <APIConfigPage />,
    public: false,
  },
];
