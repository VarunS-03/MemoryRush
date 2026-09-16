import React, { useEffect, useRef } from 'react';

interface BackgroundParticlesProps {
  reducedMotion?: boolean;
}

export const BackgroundParticles: React.FC<BackgroundParticlesProps> = ({ reducedMotion }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle pool
    const particleCount = Math.min(35, Math.floor(width / 35));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.5 + 1,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -Math.random() * 0.5 - 0.15,
      alpha: Math.random() * 0.4 + 0.1,
      color: Math.random() > 0.5 ? '129, 140, 248' : '192, 132, 252', // Indigo & Purple glow
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [reducedMotion]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Soft ambient gradient orbs in background */}
      <div 
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-violet-600/15 blur-[120px]" 
        aria-hidden="true" 
      />
      <div 
        className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-cyan-600/10 blur-[140px]" 
        aria-hidden="true" 
      />
      <div 
        className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-pink-600/10 blur-[130px]" 
        aria-hidden="true" 
      />
      
      {!reducedMotion && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      )}
    </div>
  );
};
