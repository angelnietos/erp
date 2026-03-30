import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'josanz-crm-background',
  standalone: true,
  imports: [CommonModule],
  template: `<canvas #canvas></canvas>`,
  styles: `
    :host {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      pointer-events: none;
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
})
export class CrmBackgroundComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private animationId = 0;
  private time = 0;
  private particles: Particle[] = [];
  private bubbles: Bubble[] = [];

  private readonly boundResize = () => this.resizeCanvas();

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.ctx = ctx;
    this.resizeCanvas();
    window.addEventListener('resize', this.boundResize);
    this.initElements();
    this.animate();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.boundResize);
  }

  private resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private initElements() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    // More visible floating particles
    const count = Math.min(60, Math.floor((w * h) / 20000));
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: -Math.random() * 0.15 - 0.05,
        opacity: Math.random() * 0.6 + 0.2,
        hue: Math.random() > 0.5 ? 220 + Math.random() * 30 : 180 + Math.random() * 20,
      });
    }
    
    // More visible rising bubbles
    const bubbleCount = 25;
    for (let i = 0; i < bubbleCount; i++) {
      this.bubbles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: Math.random() * 25 + 10,
        speed: Math.random() * 0.4 + 0.1,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.02 + 0.01,
        opacity: Math.random() * 0.4 + 0.15,
      });
    }
  }

  private animate = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.time += 0.016;
    this.ctx.clearRect(0, 0, w, h);

    this.drawGradientBackground(w, h);
    this.drawParticles(w, h);
    this.drawBubbles(w, h);
    this.drawSubtleGlow(w, h);

    this.animationId = requestAnimationFrame(this.animate);
  };

  private drawGradientBackground(w: number, h: number) {
    // More visible gradient for testing
    const g = this.ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(25, 30, 50, 0.95)');
    g.addColorStop(0.5, 'rgba(20, 25, 40, 0.96)');
    g.addColorStop(1, 'rgba(15, 20, 35, 0.97)');
    this.ctx.fillStyle = g;
    this.ctx.fillRect(0, 0, w, h);

    // More visible top light
    const topLight = this.ctx.createRadialGradient(
      w * 0.5, -h * 0.1, 0,
      w * 0.5, h * 0.3, h * 0.8
    );
    topLight.addColorStop(0, 'rgba(100, 150, 255, 0.3)');
    topLight.addColorStop(0.4, 'rgba(80, 120, 200, 0.15)');
    topLight.addColorStop(1, 'transparent');
    this.ctx.fillStyle = topLight;
    this.ctx.fillRect(0, 0, w, h);
  }

  private drawParticles(w: number, h: number) {
    this.ctx.globalCompositeOperation = 'screen';
    this.particles.forEach((p) => {
      p.x += p.speedX + Math.sin(this.time + p.y * 0.002) * 0.05;
      p.y += p.speedY;

      if (p.y < -5) {
        p.y = h + 5;
        p.x = Math.random() * w;
      }
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;

      const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
      gradient.addColorStop(0, `hsla(${p.hue}, 60%, 70%, ${p.opacity})`);
      gradient.addColorStop(1, 'transparent');
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalCompositeOperation = 'source-over';
  }

  private drawBubbles(w: number, h: number) {
    this.ctx.globalCompositeOperation = 'screen';
    this.bubbles.forEach((b) => {
      b.y -= b.speed;
      b.wobble += b.wobbleSpeed;
      b.x += Math.sin(b.wobble) * 0.2;

      if (b.y < -b.radius * 2) {
        b.y = h + b.radius * 2;
        b.x = Math.random() * w;
      }

      const gradient = this.ctx.createRadialGradient(
        b.x - b.radius * 0.3, b.y - b.radius * 0.3, 0,
        b.x, b.y, b.radius
      );
      gradient.addColorStop(0, `rgba(139, 92, 246, ${b.opacity})`);
      gradient.addColorStop(0.5, `rgba(99, 102, 241, ${b.opacity * 0.5})`);
      gradient.addColorStop(1, 'transparent');
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalCompositeOperation = 'source-over';
  }

  private drawSubtleGlow(w: number, h: number) {
    // Very subtle corner glows
    const cornerGlow = this.ctx.createRadialGradient(
      w * 0.85, h * 0.85, 0,
      w * 0.85, h * 0.85, h * 0.5
    );
    cornerGlow.addColorStop(0, 'rgba(139, 92, 246, 0.04)');
    cornerGlow.addColorStop(0.5, 'rgba(99, 102, 241, 0.02)');
    cornerGlow.addColorStop(1, 'transparent');
    this.ctx.fillStyle = cornerGlow;
    this.ctx.fillRect(0, 0, w, h);
  }
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  hue: number;
}

interface Bubble {
  x: number;
  y: number;
  radius: number;
  speed: number;
  wobble: number;
  wobbleSpeed: number;
  opacity: number;
}