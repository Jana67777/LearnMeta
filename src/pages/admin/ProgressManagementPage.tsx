import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';

interface UserProgress {
  user_id: string;
  username: string;
  hasPre: boolean;
  hasPost: boolean;
  preScore: number | null;
  postScore: number | null;
}

export default function ProgressManagementPage() {
  const [users, setUsers] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState<string | null>(null);

  async function loadUsers() {
    setLoading(true);
    try {
      const { data: profiles } = await supabase.from('profiles').select('id, username');
      const { data: results } = await supabase.from('test_results').select('*');

      if (!profiles) return;

      const rows: UserProgress[] = profiles.map(p => {
        const pre = results?.find(r => r.user_id === p.id && r.test_type === 'pre');
        const post = results?.find(r => r.user_id === p.id && r.test_type === 'post');
        return {
          user_id: p.id,
          username: p.username || '未知用户',
          hasPre: !!pre,
          hasPost: !!post,
          preScore: pre?.score ?? null,
          postScore: post?.score ?? null,
        };
      });

      setUsers(rows);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const handleReset = async (userId: string, username: string) => {
    if (!confirm(`确定要重置用户 "${username}" 的学习进度吗？此操作将删除该用户的测评记录。`)) {
      return;
    }

    setResetting(userId);
    try {
      const { data, error } = await supabase.functions.invoke('admin-reset-progress', {
        body: { targetUserId: userId },
      });

      if (error || !data?.success) {
        toast.error(error?.message || data?.error || '重置失败');
        return;
      }

      toast.success(`用户 "${username}" 的进度已重置`);
      await loadUsers();
    } finally {
      setResetting(null);
    }
  };

  const getStatus = (user: UserProgress) => {
    if (user.hasPost) return { label: '已完成', variant: 'default' as const };
    if (user.hasPre) return { label: '学习中', variant: 'secondary' as const };
    return { label: '未开始', variant: 'outline' as const };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">进度管理</h1>
        <p className="text-sm text-muted-foreground">查看用户学习状态并重置进度</p>
      </div>

      <Card className="border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">用户学习进度</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground py-8 text-center">加载中...</div>
          ) : users.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">暂无用户数据</div>
          ) : (
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">用户名</TableHead>
                    <TableHead className="whitespace-nowrap">学习状态</TableHead>
                    <TableHead className="whitespace-nowrap">前测得分</TableHead>
                    <TableHead className="whitespace-nowrap">后测得分</TableHead>
                    <TableHead className="whitespace-nowrap">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => {
                    const status = getStatus(user);
                    return (
                      <TableRow key={user.user_id}>
                        <TableCell className="font-medium whitespace-nowrap">{user.username}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {user.preScore !== null ? `${user.preScore}分` : '—'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {user.postScore !== null ? `${user.postScore}分` : '—'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={resetting === user.user_id || (!user.hasPre && !user.hasPost)}
                            onClick={() => handleReset(user.user_id, user.username)}
                          >
                            {resetting === user.user_id ? '重置中...' : '重置进度'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}