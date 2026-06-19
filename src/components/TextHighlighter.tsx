import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { trackAction } from '@/utils/behaviorTracker';
import { Highlighter, Underline, StickyNote, X } from 'lucide-react';

interface HighlightData {
  id: string;
  text: string;
  type: 'highlight' | 'underline' | 'note';
  note?: string;
  sectionIndex: number;
}

interface TextHighlighterProps {
  sectionIndex: number;
  content: string;
  onHighlightsChange?: (highlights: HighlightData[]) => void;
}

export default function TextHighlighter({
  sectionIndex,
  content,
  onHighlightsChange,
}: TextHighlighterProps) {
  const [highlights, setHighlights] = useState<HighlightData[]>(() => {
    const saved = localStorage.getItem(`highlights-${sectionIndex}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // 应用高亮样式
  const applyHighlights = useCallback(() => {
    if (!contentRef.current || highlights.length === 0) return;

    let html = content;
    // 按文本长度降序排序，避免短文本替换影响长文本
    const sorted = [...highlights].sort((a, b) => b.text.length - a.text.length);
    
    sorted.forEach((h) => {
      const escaped = h.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const className = h.type === 'highlight'
        ? 'bg-yellow-200/60 dark:bg-yellow-800/60 px-0.5 rounded-sm'
        : h.type === 'underline'
        ? 'underline underline-offset-2 decoration-2 decoration-primary/60'
        : 'bg-green-100/60 dark:bg-green-900/40 px-0.5 rounded-sm';
      
      const title = h.note ? `title="笔记: ${h.note}"` : '';
      const span = `<mark class="${className} cursor-pointer" data-id="${h.id}" ${title}>${h.text}</mark>`;
      
      html = html.replace(new RegExp(escaped, 'g'), span);
    });

    contentRef.current.innerHTML = html;
  }, [highlights, content]);

  useEffect(() => {
    applyHighlights();
    localStorage.setItem(`highlights-${sectionIndex}`, JSON.stringify(highlights));
    onHighlightsChange?.(highlights);
  }, [highlights, applyHighlights, sectionIndex, onHighlightsChange]);

  // 初始化原始内容
  useEffect(() => {
    if (contentRef.current && highlights.length === 0) {
      contentRef.current.innerText = content;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && text.length > 0 && text.length < 200 && contentRef.current?.contains(selection?.anchorNode as Node)) {
      setSelectedText(text);
      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();
      if (rect) {
        setToolbarPosition({
          x: rect.left + rect.width / 2 - 80,
          y: rect.top - 50,
        });
        setToolbarVisible(true);
        setShowNoteInput(false);
      }
    } else {
      setToolbarVisible(false);
    }
  }, []);

  const addHighlight = useCallback((type: 'highlight' | 'underline' | 'note') => {
    const note = type === 'note' ? noteInput : undefined;
    const newHighlight: HighlightData = {
      id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: selectedText,
      type,
      note,
      sectionIndex,
    };

    setHighlights(prev => [...prev, newHighlight]);
    trackAction(type === 'highlight' ? 'highlight_text' : type === 'underline' ? 'underline_text' : 'add_note', {
      sectionIndex,
      text: selectedText,
      note,
    });

    window.getSelection()?.removeAllRanges();
    setToolbarVisible(false);
    setShowNoteInput(false);
    setNoteInput('');
  }, [selectedText, sectionIndex, noteInput]);

  const removeHighlight = useCallback((id: string) => {
    setHighlights(prev => prev.filter(h => h.id !== id));
    // 重新应用
    if (contentRef.current) {
      contentRef.current.innerText = content;
    }
  }, [content]);

  // 点击已有高亮时删除
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'MARK' && target.dataset.id) {
        e.preventDefault();
        e.stopPropagation();
        if (confirm('删除此标记？')) {
          removeHighlight(target.dataset.id);
        }
      }
    };

    el.addEventListener('click', handleClick);
    return () => el.removeEventListener('click', handleClick);
  }, [removeHighlight]);

  return (
    <div className="relative">
      {/* 浮动工具栏 */}
      {toolbarVisible && (
        <div
          className="fixed z-50 flex items-center gap-1 bg-card border border-border rounded-sm shadow-lg p-1.5"
          style={{
            left: Math.max(8, Math.min(toolbarPosition.x, window.innerWidth - 180)),
            top: Math.max(8, toolbarPosition.y),
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {!showNoteInput ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30"
                onClick={() => addHighlight('highlight')}
                title="高亮"
              >
                <Highlighter className="w-3.5 h-3.5 text-yellow-700" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-muted"
                onClick={() => addHighlight('underline')}
                title="下划线"
              >
                <Underline className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-muted"
                onClick={() => setShowNoteInput(true)}
                title="添加笔记"
              >
                <StickyNote className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-muted"
                onClick={() => {
                  setToolbarVisible(false);
                  window.getSelection()?.removeAllRanges();
                }}
                title="取消"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="输入笔记..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className="w-32 h-7 px-2 text-xs border border-border rounded-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addHighlight('note');
                  if (e.key === 'Escape') setShowNoteInput(false);
                }}
                autoFocus
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => addHighlight('note')}
              >
                添加
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 可高亮的文本内容 */}
      <div
        ref={contentRef}
        className="text-sm text-foreground leading-relaxed select-text cursor-text whitespace-pre-line"
        onMouseUp={handleMouseUp}
      >
        {content}
      </div>
    </div>
  );
}