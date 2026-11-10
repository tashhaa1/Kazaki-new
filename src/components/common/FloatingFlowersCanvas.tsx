import React, { useEffect, useRef } from 'react';

interface FloralParticle {
  type: 'rose' | 'petal' | 'blossom' | 'sparkle';
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  flip: number;
  flipSpeed: number;
  sway: number;
  swaySpeed: number;
  swayAmp: number;
  opacity: number;
  colorVar: number;
  depth: number; // 0 (background) to 1 (foreground)
}

/**
 * High-performance, silky-smooth procedural botanical flowers and rose petals canvas.
 * Renders realistic velvet roses, tumbling petals, and floral blossoms drifting gracefully.
 * Completely free of emojis, utilizing cached offscreen vector sprites and 60/120fps RAF loop.
 */
export const FloatingFlowersCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    // Track mouse for delicate organic breeze interaction
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetBreezeX = 0;
    let currentBreezeX = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      // Gentle horizontal wind based on mouse position relative to center
      targetBreezeX = ((mouseX - width / 2) / width) * 0.8;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.touches[0].clientX - rect.left;
        mouseY = e.touches[0].clientY - rect.top;
        targetBreezeX = ((mouseX - width / 2) / width) * 0.8;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Handle high DPI and window resizing
    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement.clientHeight || window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // ==========================================
    // Pre-render Cached Sprites for Max 120 FPS
    // ==========================================
    interface CachedSprite {
      canvas: HTMLCanvasElement;
      size: number;
    }

    const createRoseSprite = (baseSize: number, colorTier: number): CachedSprite => {
      const c = document.createElement('canvas');
      const s = baseSize * 2.5;
      c.width = s;
      c.height = s;
      const cCtx = c.getContext('2d');
      if (!cCtx) return { canvas: c, size: baseSize };

      cCtx.translate(s / 2, s / 2);
      const r = baseSize;

      // Color palettes for rose tiers
      const palettes = [
        ['#881337', '#be123c', '#e11d48', '#fda4af'], // Royal Crimson
        ['#9f1239', '#e11d48', '#f43f5e', '#fecdd3'], // Vivid Ruby Rose
        ['#4c0519', '#9f1239', '#be123c', '#fb7185'], // Deep Velvet Rose
      ];
      const p = palettes[colorTier % palettes.length];

      // Outer petals layer (5 rounded organic petals)
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5;
        cCtx.save();
        cCtx.rotate(angle);
        cCtx.translate(0, -r * 0.45);

        const g = cCtx.createRadialGradient(0, 0, r * 0.05, 0, 0, r * 0.6);
        g.addColorStop(0, p[2]);
        g.addColorStop(0.65, p[1]);
        g.addColorStop(1, p[0]);

        cCtx.fillStyle = g;
        cCtx.beginPath();
        cCtx.ellipse(0, 0, r * 0.5, r * 0.38, 0, 0, Math.PI * 2);
        cCtx.fill();

        // Delicate petal edge highlight
        cCtx.strokeStyle = 'rgba(255, 228, 230, 0.25)';
        cCtx.lineWidth = 1;
        cCtx.stroke();
        cCtx.restore();
      }

      // Middle petals layer (4 petals slightly rotated)
      for (let i = 0; i < 4; i++) {
        const angle = (i * 2 * Math.PI) / 4 + Math.PI / 5;
        cCtx.save();
        cCtx.rotate(angle);
        cCtx.translate(0, -r * 0.3);

        const g = cCtx.createLinearGradient(0, -r * 0.25, 0, r * 0.35);
        g.addColorStop(0, p[3]);
        g.addColorStop(0.5, p[2]);
        g.addColorStop(1, p[0]);

        cCtx.fillStyle = g;
        cCtx.beginPath();
        cCtx.ellipse(0, 0, r * 0.38, r * 0.28, 0, 0, Math.PI * 2);
        cCtx.fill();
        cCtx.restore();
      }

      // Inner spiral bud core
      cCtx.save();
      const coreG = cCtx.createRadialGradient(0, 0, 0, 0, 0, r * 0.28);
      coreG.addColorStop(0, p[3]);
      coreG.addColorStop(0.5, p[2]);
      coreG.addColorStop(1, p[0]);

      cCtx.fillStyle = coreG;
      cCtx.beginPath();
      cCtx.arc(0, 0, r * 0.24, 0, Math.PI * 2);
      cCtx.fill();

      // Spiral bud line
      cCtx.strokeStyle = 'rgba(255, 241, 242, 0.6)';
      cCtx.lineWidth = Math.max(1, r * 0.06);
      cCtx.beginPath();
      for (let a = 0; a < Math.PI * 3.2; a += 0.2) {
        const dist = (r * 0.17 * a) / (Math.PI * 3.2);
        const px = Math.cos(a) * dist;
        const py = Math.sin(a) * dist;
        if (a === 0) cCtx.moveTo(px, py);
        else cCtx.lineTo(px, py);
      }
      cCtx.stroke();
      cCtx.restore();

      return { canvas: c, size: s };
    };

    const createPetalSprite = (baseW: number, baseH: number, colorTier: number): CachedSprite => {
      const c = document.createElement('canvas');
      const pad = 12;
      const w = baseW + pad;
      const h = baseH + pad;
      c.width = w;
      c.height = h;
      const cCtx = c.getContext('2d');
      if (!cCtx) return { canvas: c, size: baseH };

      cCtx.translate(w / 2, h / 2);

      const palettes = [
        ['#fda4af', '#f43f5e', '#be123c', '#881337'], // Velvet Rose Petal
        ['#fecdd3', '#fb7185', '#e11d48', '#9f1239'], // Fresh Petal
        ['#ffe4e6', '#fda4af', '#e11d48', '#4c0519'], // Light Champagne Petal
      ];
      const p = palettes[colorTier % palettes.length];

      const g = cCtx.createLinearGradient(0, -baseH * 0.5, 0, baseH * 0.5);
      g.addColorStop(0, p[0]);
      g.addColorStop(0.35, p[1]);
      g.addColorStop(0.75, p[2]);
      g.addColorStop(1, p[3]);

      cCtx.fillStyle = g;
      cCtx.beginPath();
      // Curved teardrop petal silhouette
      cCtx.moveTo(0, -baseH * 0.5);
      cCtx.bezierCurveTo(baseW * 0.65, -baseH * 0.45, baseW * 0.75, baseH * 0.2, 0, baseH * 0.5);
      cCtx.bezierCurveTo(-baseW * 0.75, baseH * 0.2, -baseW * 0.65, -baseH * 0.45, 0, -baseH * 0.5);
      cCtx.fill();

      // Subtle translucent inner spine highlight
      cCtx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      cCtx.lineWidth = 1;
      cCtx.beginPath();
      cCtx.moveTo(0, -baseH * 0.38);
      cCtx.quadraticCurveTo(baseW * 0.08, 0, 0, baseH * 0.35);
      cCtx.stroke();

      return { canvas: c, size: Math.max(w, h) };
    };

    const createBlossomSprite = (baseSize: number): CachedSprite => {
      const c = document.createElement('canvas');
      const s = baseSize * 2.4;
      c.width = s;
      c.height = s;
      const cCtx = c.getContext('2d');
      if (!cCtx) return { canvas: c, size: baseSize };

      cCtx.translate(s / 2, s / 2);
      const r = baseSize;

      // 5-Petal botanical blossom
      for (let i = 0; i < 5; i++) {
        const a = (i * 2 * Math.PI) / 5;
        cCtx.save();
        cCtx.rotate(a);
        cCtx.translate(0, -r * 0.45);

        const g = cCtx.createRadialGradient(0, 0, r * 0.05, 0, 0, r * 0.5);
        g.addColorStop(0, '#fff1f2');
        g.addColorStop(0.5, '#fda4af');
        g.addColorStop(1, '#e11d48');

        cCtx.fillStyle = g;
        cCtx.beginPath();
        cCtx.ellipse(0, 0, r * 0.34, r * 0.46, 0, 0, Math.PI * 2);
        cCtx.fill();

        cCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        cCtx.lineWidth = 1;
        cCtx.stroke();
        cCtx.restore();
      }

      // Golden center stamen
      cCtx.fillStyle = '#fbbf24';
      cCtx.beginPath();
      cCtx.arc(0, 0, r * 0.16, 0, Math.PI * 2);
      cCtx.fill();

      // Golden pistil dots
      cCtx.fillStyle = '#fef08a';
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        cCtx.beginPath();
        cCtx.arc(Math.cos(a) * r * 0.11, Math.sin(a) * r * 0.11, r * 0.035, 0, Math.PI * 2);
        cCtx.fill();
      }

      return { canvas: c, size: s };
    };

    // Instantiate sprite dictionaries
    const roseSprites = [
      createRoseSprite(24, 0),
      createRoseSprite(32, 1),
      createRoseSprite(40, 2),
      createRoseSprite(18, 0),
    ];

    const petalSprites = [
      createPetalSprite(18, 28, 0),
      createPetalSprite(22, 36, 1),
      createPetalSprite(26, 42, 2),
      createPetalSprite(14, 22, 0),
    ];

    const blossomSprites = [
      createBlossomSprite(20),
      createBlossomSprite(28),
      createBlossomSprite(36),
    ];

    // ==========================================
    // Initialize Botanical Particles
    // ==========================================
    const particleCount = 48; // Optimal balance of density and silky 120fps performance
    const particles: FloralParticle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const randType = Math.random();
      let type: 'rose' | 'petal' | 'blossom' | 'sparkle';
      if (randType < 0.45) type = 'petal';
      else if (randType < 0.70) type = 'rose';
      else if (randType < 0.88) type = 'blossom';
      else type = 'sparkle';

      const depth = Math.random(); // 0 (background small) to 1 (foreground large)
      const speedMult = 0.4 + depth * 0.8;

      particles.push({
        type,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (0.4 + Math.random() * 0.7) * speedMult,
        size: 0.6 + depth * 0.6,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * (type === 'petal' ? 0.025 : 0.012),
        flip: Math.random() * Math.PI * 2,
        flipSpeed: 0.015 + Math.random() * 0.025,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.015 + Math.random() * 0.02,
        swayAmp: 0.4 + depth * 0.7,
        opacity: 0.35 + depth * 0.55,
        colorVar: Math.floor(Math.random() * 3),
        depth,
      });
    }

    // ==========================================
    // Render Loop (60 / 120 FPS RAF)
    // ==========================================
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth breeze interpolation
      currentBreezeX += (targetBreezeX - currentBreezeX) * 0.04;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Physics update
        p.sway += p.swaySpeed;
        p.rotation += p.rotSpeed;
        p.flip += p.flipSpeed;

        const horizontalDrift = Math.sin(p.sway) * p.swayAmp + currentBreezeX * (0.8 + p.depth * 0.8);
        p.x += p.vx + horizontalDrift;
        p.y += p.vy;

        // Wrap around boundaries seamlessly
        if (p.y > height + 50) {
          p.y = -50;
          p.x = Math.random() * width;
        }
        if (p.x < -60) p.x = width + 50;
        else if (p.x > width + 60) p.x = -50;

        // Drawing by particle type
        ctx.save();
        ctx.globalAlpha = p.opacity;

        if (p.type === 'sparkle') {
          // Floating golden/rose stardust speck
          ctx.translate(p.x, p.y);
          const rad = 1.5 + p.depth * 2;
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rad * 2);
          g.addColorStop(0, '#fef08a');
          g.addColorStop(0.5, '#f43f5e');
          g.addColorStop(1, 'transparent');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(0, 0, rad * 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'petal') {
          // 3D tumbling rose petal
          const sprite = petalSprites[p.colorVar % petalSprites.length];
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);

          // 3D tumble flip along petal axis
          const flipScale = Math.cos(p.flip);
          ctx.scale(p.size * (0.5 + Math.abs(flipScale) * 0.5), p.size * flipScale);

          ctx.drawImage(
            sprite.canvas,
            -sprite.size / 2,
            -sprite.size / 2
          );
        } else if (p.type === 'rose') {
          // Full rotating velvet rose
          const sprite = roseSprites[p.colorVar % roseSprites.length];
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.scale(p.size, p.size);

          ctx.drawImage(
            sprite.canvas,
            -sprite.size / 2,
            -sprite.size / 2
          );
        } else if (p.type === 'blossom') {
          // Botanical 5-petal blossom
          const sprite = blossomSprites[p.colorVar % blossomSprites.length];
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.scale(p.size, p.size);

          ctx.drawImage(
            sprite.canvas,
            -sprite.size / 2,
            -sprite.size / 2
          );
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none z-0 ${className}`}
    />
  );
};
