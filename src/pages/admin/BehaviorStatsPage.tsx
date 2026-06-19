import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/db/supabase';

interface ActionRow {
  id: string;
  username: string;
  action_type: string;
  action_data: Record<string, unknown>;
  created_at: string;
}

const actionLabels: Record<string, string> = {
  login: '登录',
  logout: '退出登录',
  expand_module: '展开知识模块',
  collapse_module: '收起知识模块',
  highlight_text: '文本高亮',
  underline_text: '文本划线',
  add_note: '添加笔记',
  start_pre_test: '开始前测',
  submit_pre_test: '提交前测',
  start_post_test: '开始后测',
  submit_post_test: '提交后测',
  view_knowledge: '查看知识点',
  chat_message: 'AI对话',
  start_learning: '开始学习',
  complete_learning: '完成学习',
  celebration: '完成庆祝',
};

export default function BehaviorStatsPage() {
  const [data, setData] = useState<ActionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const { data: actions } = await supabase
          .from('user_actions')
          .select('*, profiles(username)')
          .order('created_at', { ascending: false })
          .limit(200);

        if (!actions) return;

        const rows: ActionRow[] = actions.map((a: Record<string, unknown>) => ({
          id: a.id as string,
          username: (a.profiles as Record<string, string>)?.username || '未知用户',
          action_type: a.action_type as string,
          action_data: a.action_data as Record<string, unknown>,
          created_at: a.created_at as string,
        }));

        setData(rows);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getActionBadge = (type: string) => {
    const colorMap: Record<string, string> = {
      login: 'bg-green-100 text-green-800',
      logout: 'bg-gray-100 text-gray-800',
      expand_module: 'bg-blue-100 text-blue-800',
      collapse_module: 'bg-blue-100 text-blue-800',
      highlight_text: 'bg-yellow-100 text-yellow-800',
      underline_text: 'bg-orange-100 text-orange-800',
      add_note: 'bg-purple-100 text-purple-800',
      start_pre_test: 'bg-red-100 text-red-800',
      submit_pre_test: 'bg-red-100 text-red-800',
      start_post_test: 'bg-red-100 text-red-800',
      submit_post_test: 'bg-red-100 text-red-800',
      chat_message: 'bg-indigo-100 text-indigo-800',
      start_learning: 'bg-teal-100 text-teal-800',
      complete_learning: 'bg-teal-100 text-teal-800',
      celebration: 'bg-pink-100 text-pink-800',
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">用户行为统计</h1>
        <p className="text-sm text-muted-foreground">查看所有用户的操作行为记录</p>
      </div>

      <Card className="border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">行为记录列表（最近200条）</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground py-8 text-center">加载中...</div>
          ) : data.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">暂无行为记录</div>
          ) : (
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">时间</TableHead>
                    <TableHead className="whitespace-nowrap">用户</TableHead>
                    <TableHead className="whitespace-nowrap">行为类型</TableHead>
                    <TableHead className="whitespace-nowrap">详情</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map(row => (
                    <TableRow key={row.id}>
                      <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
                        {new Date(row.created_at).toLocaleString('zh-CN')}
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{row.username}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="secondary" className={`${getActionBadge(row.action_type)} border-0`}>
                          {actionLabels[row.action_type] || row.action_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap max-w-xs truncate">
                        {JSON.stringify(row.action_data).slice(0, 60)}...
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}