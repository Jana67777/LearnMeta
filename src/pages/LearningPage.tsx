import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Target, Clock, Lightbulb, BookOpen, MessageSquare, LogOut, CloudLightning, Shield, StickyNote } from 'lucide-react';
import { preTestQuestions, postTestQuestions } from '@/data/quiz';
import type { QuizQuestion } from '@/types/types';
import QuizModal from '@/components/QuizModal';
import ConfettiEffect from '@/components/ConfettiEffect';
import AIChat from '@/components/AIChat';
import TextHighlighter from '@/components/TextHighlighter';
import { trackAction, trackActionDebounced } from '@/utils/behaviorTracker';
import { supabase } from '@/db/supabase';

interface KnowledgeItem {
  id: number;
  title: string;
  content: string;
  order_index: number;
}

type LearningPhase = 'idle' | 'pre-test' | 'learning' | 'post-test' | 'completed';

export default function LearningPage() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<LearningPhase>('idle');
  const [quizType, setQuizType] = useState<'pre' | 'post'>('pre');
  const [quizOpen, setQuizOpen] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
  const [knowledgeContent, setKnowledgeContent] = useState<KnowledgeItem[]>([]);

  // 计算学习进度
  const progressPercent = phase === 'idle' ? 0
    : phase === 'pre-test' ? 10
    : phase === 'learning' ? 10 + readingProgress * 0.6
    : phase === 'post-test' ? 80
    : 100;

  // 加载知识内容
  useEffect(() => {
    async function loadContent() {
      const { data } = await supabase
        .from('knowledge_content')
        .select('*')
        .order('order_index');
      if (data) {
        setKnowledgeContent(data as KnowledgeItem[]);
      }
    }
    loadContent();
  }, []);

  // 检查是否已有测评记录
  useEffect(() => {
    const checkExistingResults = async () => {
      if (!profile) return;
      const { data } = await supabase
        .from('test_results')
        .select('test_type')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data && data.length > 0) {
        const hasPre = data.some(r => r.test_type === 'pre');
        const hasPost = data.some(r => r.test_type === 'post');
        if (hasPre && hasPost) {
          setPhase('completed');
        } else if (hasPre) {
          setPhase('learning');
        }
      }
    };
    checkExistingResults();
  }, [profile]);

  const handleStartLearning = useCallback(() => {
    trackAction('start_learning', { phase: 'pre' });
    setQuizType('pre');
    setCurrentQuestions(preTestQuestions);
    setQuizOpen(true);
  }, []);

  const handleCompleteLearning = useCallback(() => {
    trackAction('complete_learning', { phase: 'post' });
    setQuizType('post');
    setCurrentQuestions(postTestQuestions);
    setQuizOpen(true);
  }, []);

  const handleQuizComplete = useCallback(async (answers: Record<string, string>) => {
    if (!profile) return;

    const questions = quizType === 'pre' ? preTestQuestions : postTestQuestions;
    let correctCount = 0;
    for (const q of questions) {
      if (answers[q.id] === q.correctAnswer) correctCount++;
    }
    const score = Math.round((correctCount / questions.length) * 100);

    trackAction(quizType === 'pre' ? 'submit_pre_test' : 'submit_post_test', {
      score,
      answers,
    });

    const { error } = await supabase
      .from('test_results')
      .insert({
        user_id: profile.id,
        test_type: quizType,
        answers,
        score,
      });

    if (error) {
      toast.error('保存测评结果失败，请重试');
      return;
    }

    setQuizOpen(false);

    if (quizType === 'pre') {
      setPhase('learning');
      toast.success(`前测完成！正确率 ${score}%，开始学习吧！`);
    } else {
      setPhase('completed');
      setShowConfetti(true);
      trackAction('celebration', { score });
      toast.success(`恭喜完成全部学习！后测正确率 ${score}%`);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [profile, quizType]);

  const toggleSection = (index: number) => {
    const sectionTitle = knowledgeContent[index]?.title || '';
    setExpandedSections(prev => {
      const next = new Set(prev);
      const wasExpanded = next.has(index);
      if (wasExpanded) {
        next.delete(index);
        trackActionDebounced('collapse_module', { sectionIndex: index, sectionTitle }, 300);
      } else {
        next.add(index);
        trackActionDebounced('expand_module', { sectionIndex: index, sectionTitle }, 300);
      }
      return next;
    });
    // 更新阅读进度
    const totalSections = knowledgeContent.length;
    const readCount = expandedSections.size + (expandedSections.has(index) ? -1 : 1);
    setReadingProgress(Math.min(readCount / totalSections, 1));
  };

  const handleLogout = async () => {
    await signOut();
    toast.success('已退出登录');
  };

  return (
    <div className="min-h-screen bg-background">
      {showConfetti && <ConfettiEffect />}

      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex items-center justify-between px-4 md:px-6 h-14">
          <div className="flex items-center gap-2">
            <CloudLightning className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg text-foreground hidden sm:inline">LearnMeta</span>
            <span className="font-bold text-lg text-foreground sm:hidden">LearnMeta</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/notes')}>
              <StickyNote className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">笔记</span>
            </Button>
            {profile?.role === 'admin' && (
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
                <Shield className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">后台</span>
              </Button>
            )}
            <Badge variant="secondary" className="text-sm">
              {profile?.username || '用户'}
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">退出</span>
            </Button>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <div className="flex flex-col md:flex-row gap-4 p-4 md:p-6 max-w-[1600px] mx-auto">
        {/* 左侧区域 */}
        <aside className="w-full md:w-72 lg:w-80 shrink-0 space-y-4">
          {/* 目标提示区 */}
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                学习目标
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 ${phase !== 'idle' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {phase !== 'idle' ? '✓' : '1'}
                  </span>
                  <span>完成前测评估</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 ${phase === 'learning' || phase === 'post-test' || phase === 'completed' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {phase === 'learning' || phase === 'post-test' || phase === 'completed' ? '✓' : '2'}
                  </span>
                  <span>学习台风形成知识</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 ${phase === 'completed' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {phase === 'completed' ? '✓' : '3'}
                  </span>
                  <span>完成后测评估</span>
                </div>
              </div>
              {phase === 'completed' && (
                <Badge className="bg-primary text-primary-foreground w-full justify-center py-1">
                  🎉 学习任务已完成
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* 时间进度条与策略建议区 */}
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                学习进度
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">完成度</span>
                  <span className="font-medium text-foreground">{Math.round(progressPercent)}%</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  策略建议
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {phase === 'idle' && (
                    <p>点击中间区域的「开始学习」按钮，先完成前测评估，了解你对台风知识的掌握程度。</p>
                  )}
                  {phase === 'pre-test' && (
                    <p>正在前测中，请认真作答每一道题目。</p>
                  )}
                  {phase === 'learning' && (
                    <div className="space-y-1">
                      <p>• 仔细阅读每个知识模块</p>
                      <p>• 注意台风形成的四个条件</p>
                      <p>• 理解台风的结构特征</p>
                      <p>• 学完后点击「完成学习」进入后测</p>
                    </div>
                  )}
                  {phase === 'post-test' && (
                    <p>正在后测中，请认真作答每一道题目。</p>
                  )}
                  {phase === 'completed' && (
                    <p>恭喜你完成了全部学习任务！你可以继续与AI助手交流，深入了解台风知识。</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* 中间区域 - 知识点讲解区 */}
        <main className="flex-1 min-w-0">
          <Card className="border border-border h-full flex flex-col">
            <CardHeader className="pb-3 shrink-0">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  学习内容
                </CardTitle>
                <div className="flex gap-2">
                  {phase === 'idle' && (
                    <Button onClick={handleStartLearning}>
                      开始学习
                    </Button>
                  )}
                  {phase === 'completed' && (
                    <Badge variant="secondary" className="text-sm py-1 px-3">
                      ✓ 学习已完成
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 flex flex-col p-0">
              {phase === 'idle' ? (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">准备好学习台风知识了吗？</h3>
                    <p className="text-muted-foreground max-w-md">
                      点击「开始学习」按钮，先完成前测评估，然后系统将为你展示台风形成的完整知识体系。
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <ScrollArea className="flex-1 px-6">
                    <div className="space-y-4 py-4">
                      {knowledgeContent.map((section, index) => (
                        <div key={section.id} className="border border-border rounded-sm overflow-hidden">
                          <button
                            type="button"
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                            onClick={() => toggleSection(index)}
                          >
                            <span className="font-semibold text-foreground">{section.title}</span>
                            <span className="text-muted-foreground text-sm">
                              {expandedSections.has(index) ? '收起 ▲' : '展开 ▼'}
                            </span>
                          </button>
                          {expandedSections.has(index) && (
                            <div className="px-4 pb-4">
                              <Separator className="mb-3" />
                              <TextHighlighter
                                sectionIndex={index}
                                content={section.content}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  {phase === 'learning' && (
                    <div className="p-4 border-t border-border shrink-0 bg-card">
                      <Button onClick={handleCompleteLearning} className="w-full">
                        完成学习
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </main>

        {/* 右侧区域 - AI对话代理区 */}
        <aside className="w-full md:w-80 lg:w-96 shrink-0">
          <Card className="border border-border h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                AI 学习助手
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <AIChat />
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* 测评弹窗 */}
      <QuizModal
        open={quizOpen}
        questions={currentQuestions}
        quizType={quizType}
        onComplete={handleQuizComplete}
      />
    </div>
  );
}