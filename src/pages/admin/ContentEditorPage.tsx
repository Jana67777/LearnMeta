import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';
import { Plus, Trash2, Save } from 'lucide-react';

interface ContentItem {
  id?: number;
  title: string;
  content: string;
  order_index: number;
}

export default function ContentEditorPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadContent() {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('knowledge_content')
          .select('*')
          .order('order_index');

        if (data) {
          setItems(data.map((d: Record<string, unknown>) => ({
            id: d.id as number,
            title: d.title as string,
            content: d.content as string,
            order_index: d.order_index as number,
          })));
        }
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, []);

  const handleSave = async () => {
    // 验证
    for (const item of items) {
      if (!item.title.trim() || !item.content.trim()) {
        toast.error('标题和内容不能为空');
        return;
      }
    }

    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-save-content', {
        body: {
          items: items.map((item, index) => ({
            title: item.title,
            content: item.content,
            order_index: index,
          })),
        },
      });

      if (error || !data?.success) {
        toast.error(error?.message || data?.error || '保存失败');
        return;
      }

      toast.success('内容已保存');
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = () => {
    setItems(prev => [...prev, {
      title: '新知识模块',
      content: '在此输入知识点内容...',
      order_index: prev.length,
    }]);
  };

  const handleRemove = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ContentItem, value: string) => {
    setItems(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">内容编辑</h1>
          <p className="text-sm text-muted-foreground">编辑学习内容模块</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-1" />
            添加模块
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-1" />
            {saving ? '保存中...' : '保存全部'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground py-8 text-center">加载中...</div>
      ) : (
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-4 pr-4">
            {items.map((item, index) => (
              <Card key={index} className="border border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Input
                        value={item.title}
                        onChange={(e) => updateItem(index, 'title', e.target.value)}
                        className="font-semibold text-base border-0 px-0 focus-visible:ring-0"
                        placeholder="模块标题"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleRemove(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={item.content}
                    onChange={(e) => updateItem(index, 'content', e.target.value)}
                    className="w-full min-h-[200px] p-3 text-sm border border-border rounded-sm bg-background resize-y focus:outline-none focus:ring-1 focus:ring-ring whitespace-pre-line"
                    placeholder="在此输入知识点内容..."
                  />
                </CardContent>
              </Card>
            ))}
            {items.length === 0 && (
              <div className="text-sm text-muted-foreground py-8 text-center">
                暂无内容模块，点击「添加模块」开始编辑
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}