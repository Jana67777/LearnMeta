import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  shape: 'square' | 'line' | 'circle';
}

export default function ConfettiEffect() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = [
      'hsl(215, 55%, 45%)',   // 深海蓝
      'hsl(18, 80%, 55%)',    // 预警橙
      'hsl(173, 58%, 39%)',   // 青绿
      'hsl(43, 74%, 66%)',    // 金黄
      'hsl(340, 75%, 55%)',   // 玫红
      'hsl(210, 40%, 70%)',   // 浅蓝
    ];

    const shapes: Particle['shape'][] = ['square', 'line', 'circle'];
    const newParticles: Particle[] = [];

    for (let i = 0; i < 60; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        delay: Math.random() * 2,
        duration: Math.random() * 2 + 2,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }

    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.x}%`,
            width: p.shape === 'line' ? '3px' : `${p.size}px`,
            height: p.shape === 'line' ? `${p.size * 2}px` : `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '1px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}