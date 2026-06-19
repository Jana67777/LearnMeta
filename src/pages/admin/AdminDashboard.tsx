import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/db/supabase';
import {
  Users,
  ClipboardCheck,
  Activity,
  BookOpen,
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTests: 0,
    totalActions: 0,
    avgPreScore: 0,
    avgPostScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        const { count: testCount } = await supabase
          .from('test_results')
          .select('*', { count: 'exact', head: true });

        const { count: actionCount } = await supabase
          .from('user_actions')
          .select('*', { count: 'exact', head: true });

        const { data: preScores } = await supabase
          .from('test_results')
          .select('score')
          .eq('test_type', 'pre');

        const { data: postScores } = await supabase
          .from('test_results')
          .select('score')
          .eq('test_type', 'post');

        const avgPre = preScores && preScores.length > 0
          ? Math.round(preScores.reduce((a, b) => a + (b.score || 0), 0) / preScores.length)
          : 0;

        const avgPost = postScores && postScores.length > 0
          ? Math.round(postScores.reduce((a, b) => a + (b.score || 0), 0) / postScores.length)
          : 0;

        setStats({
          totalUsers: userCount || 0,
          totalTests: testCount || 0,
          totalActions: actionCount || 0,
          avgPreScore: avgPre,
          avgPostScore: avgPost,
        });
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const statCards = [
    {
      title: '注册用户',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-primary',
    },
    {
      title: '测评次数',
      value: stats.totalTests,
      icon: ClipboardCheck,
      color: 'text-primary',
    },
    {
      title: '行为记录',
      value: stats.totalActions,
      icon: Activity,
      color: 'text-primary',
    },
    {
      title: '前测均分',
      value: stats.avgPreScore,
      suffix: '分',
      icon: BookOpen,
      color: 'text-primary',
    },
    {
      title: '后测均分',
      value: stats.avgPostScore,
      suffix: '分',
      icon: BookOpen,
      color: 'text-primary',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">数据概览</h1>
        <p className="text-sm text-muted-foreground">LearnMeta 系统的整体数据总览</p>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">加载中...</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {statCards.map(card => {
            const Icon = card.icon;
            return (
              <Card key={card.title} className="border border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">{card.title}</p>
                      <p className="text-2xl font-bold text-foreground">
                        {card.value}{card.suffix || ''}
                      </p>
                    </div>
                    <Icon className={`w-8 h-8 ${card.color} opacity-50`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">学习效果对比</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">前测平均分</span>
                <span className="font-medium">{stats.avgPreScore}分</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-muted-foreground rounded-full transition-all"
                  style={{ width: `${Math.min(stats.avgPreScore, 100)}%` }}
                />
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">
              {stats.avgPostScore > stats.avgPreScore ? '↑' : stats.avgPostScore < stats.avgPreScore ? '↓' : '—'}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">后测平均分</span>
                <span className="font-medium">{stats.avgPostScore}分</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.min(stats.avgPostScore, 100)}%` }}
                />
              </div>
            </div>
          </div>
          {stats.avgPostScore > 0 && stats.avgPreScore > 0 && (
            <div className="mt-4 text-sm text-muted-foreground text-center">
              后测较前测{' '}
              <span className={`font-medium ${stats.avgPostScore >= stats.avgPreScore ? 'text-green-600' : 'text-red-600'}`}>
                {stats.avgPostScore >= stats.avgPreScore ? '提升' : '下降'}
              </span>
              {' '}了 {Math.abs(stats.avgPostScore - stats.avgPreScore)} 分
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}