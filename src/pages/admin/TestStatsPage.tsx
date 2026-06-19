import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/db/supabase';

interface TestRow {
  user_id: string;
  username: string;
  pre_score: number | null;
  post_score: number | null;
  pre_time: string | null;
  post_time: string | null;
}

export default function TestStatsPage() {
  const [data, setData] = useState<TestRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // 获取所有用户和对应的测评数据
        const { data: profiles } = await supabase.from('profiles').select('id, username');
        const { data: results } = await supabase.from('test_results').select('*');

        if (!profiles) return;

        const rows: TestRow[] = profiles.map(p => {
          const pre = results?.find(r => r.user_id === p.id && r.test_type === 'pre');
          const post = results?.find(r => r.user_id === p.id && r.test_type === 'post');
          return {
            user_id: p.id,
            username: p.username || '未知用户',
            pre_score: pre?.score ?? null,
            post_score: post?.score ?? null,
            pre_time: pre?.created_at ?? null,
            post_time: post?.created_at ?? null,
          };
        });

        setData(rows);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">前后测统计</h1>
        <p className="text-sm text-muted-foreground">查看所有用户的前测和后测得分数据</p>
      </div>

      <Card className="border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">测评数据列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground py-8 text-center">加载中...</div>
          ) : data.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">暂无测评数据</div>
          ) : (
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">用户名</TableHead>
                    <TableHead className="whitespace-nowrap">前测得分</TableHead>
                    <TableHead className="whitespace-nowrap">后测得分</TableHead>
                    <TableHead className="whitespace-nowrap">变化</TableHead>
                    <TableHead className="whitespace-nowrap">前测时间</TableHead>
                    <TableHead className="whitespace-nowrap">后测时间</TableHead>
                    <TableHead className="whitespace-nowrap">状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map(row => {
                    const change = row.post_score !== null && row.pre_score !== null
                      ? row.post_score - row.pre_score
                      : null;
                    const hasCompleted = row.post_score !== null;
                    const hasStarted = row.pre_score !== null;

                    return (
                      <TableRow key={row.user_id}>
                        <TableCell className="font-medium whitespace-nowrap">{row.username}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {row.pre_score !== null ? `${row.pre_score}分` : '—'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {row.post_score !== null ? `${row.post_score}分` : '—'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {change !== null ? (
                            <span className={`font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {change >= 0 ? '+' : ''}{change}
                            </span>
                          ) : '—'}
                        </TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {row.pre_time ? new Date(row.pre_time).toLocaleString('zh-CN') : '—'}
                        </TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {row.post_time ? new Date(row.post_time).toLocaleString('zh-CN') : '—'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {hasCompleted ? (
                            <Badge variant="default" className="bg-primary">已完成</Badge>
                          ) : hasStarted ? (
                            <Badge variant="secondary">学习中</Badge>
                          ) : (
                            <Badge variant="outline">未开始</Badge>
                          )}
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