import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/db/supabase';
import { ArrowLeft, Highlighter, Underline, StickyNote, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface StoredHighlight {
  id: string;
  text: string;
  type: 'highlight' | 'underline' | 'note';
  note?: string;
  sectionIndex: number;
}

interface KnowledgeItem {
  id: number;
  title: string;
}

export default function NotesReviewPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [allNotes, setAllNotes] = useState<StoredHighlight[]>([]);
  const [sections, setSections] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      // 加载知识模块标题
      const { data: content } = await supabase
        .from('knowledge_content')
        .select('id, title, order_index')
        .order('order_index');

      const sectionMap: Record<number, string> = {};
      if (content) {
        content.forEach((item: Record<string, unknown>) => {
          sectionMap[item.order_index as number] = item.title as string;
        });
      }
      setSections(sectionMap);

      // 从 localStorage 读取所有高亮
      const notes: StoredHighlight[] = [];
      for (let i = 0; i < 20; i++) {
        const saved = localStorage.getItem(`highlights-${i}`);
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as StoredHighlight[];
            parsed.forEach(n => notes.push(n));
          } catch { /* ignore */ }
        }
      }
      setAllNotes(notes);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleDelete = (noteId: string) => {
    // 从所有 localStorage 中删除
    for (let i = 0; i < 20; i++) {
      const saved = localStorage.getItem(`highlights-${i}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as StoredHighlight[];
          const filtered = parsed.filter(n => n.id !== noteId);
          if (filtered.length !== parsed.length) {
            localStorage.setItem(`highlights-${i}`, JSON.stringify(filtered));
          }
        } catch { /* ignore */ }
      }
    }
    setAllNotes(prev => prev.filter(n => n.id !== noteId));
    toast.success('笔记已删除');
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'highlight': return { label: '高亮', icon: Highlighter, color: 'bg-yellow-100 text-yellow-800' };
      case 'underline': return { label: '划线', icon: Underline, color: 'bg-blue-100 text-blue-800' };
      case 'note': return { label: '笔记', icon: StickyNote, color: 'bg-green-100 text-green-800' };
      default: return { label: '标记', icon: Highlighter, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const groupedBySection = allNotes.reduce((acc, note) => {
    const sectionTitle = sections[note.sectionIndex] || `模块 ${note.sectionIndex + 1}`;
    if (!acc[sectionTitle]) acc[sectionTitle] = [];
    acc[sectionTitle].push(note);
    return acc;
  }, {} as Record<string, StoredHighlight[]>);

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex items-center justify-between px-4 md:px-6 h-14">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/learn')}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              返回
            </Button>
            <span className="font-bold text-lg text-foreground">LearnMeta</span>
          </div>
          <Badge variant="secondary">{profile?.username || '用户'}</Badge>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">笔记回顾</h1>
          <p className="text-sm text-muted-foreground">查看你在学习过程中做的所有标记和笔记</p>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground py-8 text-center">加载中...</div>
        ) : allNotes.length === 0 ? (
          <Card className="border border-border">
            <CardContent className="py-12 text-center">
              <StickyNote className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">还没有任何笔记</p>
              <p className="text-sm text-muted-foreground mt-1">在学习内容中选中文字即可添加高亮、划线或笔记</p>
              <Button className="mt-4" onClick={() => navigate('/learn')}>去学习</Button>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="space-y-6 pr-4">
              {Object.entries(groupedBySection).map(([sectionTitle, notes]) => (
                <Card key={sectionTitle} className="border border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{sectionTitle}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {notes.map(note => {
                      const typeInfo = getTypeLabel(note.type);
                      const Icon = typeInfo.icon;
                      return (
                        <div
                          key={note.id}
                          className={`p-3 rounded-sm border border-border ${
                            note.type === 'highlight' ? 'bg-yellow-50 dark:bg-yellow-950/30' :
                            note.type === 'underline' ? 'bg-blue-50 dark:bg-blue-950/30' :
                            'bg-green-50 dark:bg-green-950/30'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="secondary" className={`${typeInfo.color} border-0`}>
                              <Icon className="w-3 h-3 mr-1" />
                              {typeInfo.label}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDelete(note.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                          <p className="text-sm text-foreground font-medium">{note.text}</p>
                          {note.note && (
                            <p className="text-sm text-muted-foreground mt-1 pt-2 border-t border-border/50">
                              笔记：{note.note}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}