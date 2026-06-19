import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import type { QuizQuestion } from '@/types/types';

interface QuizModalProps {
  open: boolean;
  questions: QuizQuestion[];
  quizType: 'pre' | 'post';
  onComplete: (answers: Record<string, string>) => void;
}

export default function QuizModal({ open, questions, quizType, onComplete }: QuizModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState('');

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleNext = () => {
    if (!selected) return;
    const newAnswers = { ...answers, [currentQuestion.id]: selected };
    setAnswers(newAnswers);

    if (isLast) {
      onComplete(newAnswers);
      // 重置状态
      setCurrentIndex(0);
      setAnswers({});
      setSelected('');
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelected(newAnswers[questions[currentIndex + 1].id] || '');
    }
  };

  const handlePrev = () => {
    if (currentIndex === 0) return;
    setCurrentIndex(prev => prev - 1);
    setSelected(answers[questions[currentIndex - 1].id] || '');
  };

  const handleOpenChange = () => {
    // 测评期间禁止关闭
  };

  if (!currentQuestion) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-[calc(100%-2rem)] md:max-w-lg border border-border"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-lg">
            {quizType === 'pre' ? '前测评估' : '后测评估'}
          </DialogTitle>
          <div className="flex items-center gap-3 mt-2">
            <Progress value={progress} className="h-2 flex-1" />
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <h3 className="text-base font-medium text-foreground leading-relaxed">
              {currentQuestion.question}
            </h3>
          </div>

          <RadioGroup
            value={selected}
            onValueChange={setSelected}
            className="space-y-3"
          >
            {currentQuestion.options.map((option) => (
              <div
                key={option.label}
                className={`flex items-center space-x-3 p-3 rounded-sm border transition-colors cursor-pointer ${
                  selected === option.label
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/50'
                }`}
                onClick={() => setSelected(option.label)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setSelected(option.label);
                }}
              >
                <RadioGroupItem value={option.label} id={`option-${option.label}`} />
                <Label
                  htmlFor={`option-${option.label}`}
                  className="flex-1 cursor-pointer text-sm"
                >
                  <span className="font-medium mr-2">{option.label}.</span>
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-between pt-2">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            上一题
          </Button>
          <Button
            onClick={handleNext}
            disabled={!selected}
          >
            {isLast ? '提交答卷' : '下一题'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}