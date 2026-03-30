import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  inject,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '@josanz-erp/shared-data-access';

function parseCssColor(input: string): { r: number; g: number; b: number } | null {
  const v = input.trim();
  if (!v) return null;
  const hex = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  const rgb = v.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
  if (rgb) return { r: +rgb[1], g: +rgb[2], b: +rgb[3] };
  return null;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

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

  private readonly themeService = inject(ThemeService);

  private ctx!: CanvasRenderingContext2D;
  private animationId = 0;
  private time = 0;
  private particles: Particle[] = [];
  private bubbles: Bubble[] = [];

  /** Synced from :root when theme changes */
  private brandRgb = { r: 132, g: 204, b: 22 };
  private bgRgb = { r: 7, g: 8, b: 11 };
  private bg2Rgb = { r: 14, g: 16, b: 22 };
  private brandHue = 84;

  private readonly boundResize = () => this.resizeCanvas();

  constructor() {
    effect(() => {
      this.themeService.currentTheme();
      queueMicrotask(() => this.syncPaletteFromTheme());
    });
  }

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.ctx = ctx;
    this.resizeCanvas();
    window.addEventListener('resize', this.boundResize);
    this.syncPaletteFromTheme();
    this.initElements();
    this.animate();
  }

  private syncPaletteFromTheme() {
    const root = document.documentElement;
    const cs = getComputedStyle(root);
    const brand = parseCssColor(cs.getPropertyValue('--brand').trim());
    const bg = parseCssColor(cs.getPropertyValue('--bg-primary').trim());
    const bg2 = parseCssColor(cs.getPropertyValue('--bg-secondary').trim());
    if (brand) {
      this.brandRgb = brand;
      this.brandHue = rgbToHsl(brand.r, brand.g, brand.b).h;
    }
    if (bg) this.bgRgb = bg;
    if (bg2) this.bg2Rgb = bg2;
    this.applyHueToParticles();
  }

  private applyHueToParticles() {
    if (!this.particles.length) return;
    for (const p of this.particles) {
      p.hue = this.brandHue + (Math.random() - 0.5) * 42;
    }
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
        hue: this.brandHue + (Math.random() - 0.5) * 40,
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
    const { r: br, g: bg, b: bb } = this.brandRgb;
    const { r: r0, g: g0, b: b0 } = this.bgRgb;
    const { r: r1, g: g1, b: b1 } = this.bg2Rgb;
    const g = this.ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, `rgba(${r1}, ${g1}, ${b1}, 0.97)`);
    g.addColorStop(0.55, `rgba(${r0}, ${g0}, ${b0}, 0.98)`);
    g.addColorStop(1, `rgba(${Math.max(0, r0 - 8)}, ${Math.max(0, g0 - 8)}, ${Math.max(0, b0 - 8)}, 0.99)`);
    this.ctx.fillStyle = g;
    this.ctx.fillRect(0, 0, w, h);

    const topLight = this.ctx.createRadialGradient(
      w * 0.5, -h * 0.12, 0,
      w * 0.5, h * 0.32, h * 0.75
    );
    topLight.addColorStop(0, `rgba(${br}, ${bg}, ${bb}, 0.22)`);
    topLight.addColorStop(0.35, `rgba(${br}, ${bg}, ${bb}, 0.08)`);
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
      gradient.addColorStop(0, `hsla(${p.hue}, 72%, 62%, ${p.opacity})`);
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

      const { r: br, g: bg, b: bb } = this.brandRgb;
      const gradient = this.ctx.createRadialGradient(
        b.x - b.radius * 0.3, b.y - b.radius * 0.3, 0,
        b.x, b.y, b.radius
      );
      gradient.addColorStop(0, `rgba(${br}, ${bg}, ${bb}, ${b.opacity})`);
      gradient.addColorStop(0.45, `rgba(${br}, ${bg}, ${bb}, ${b.opacity * 0.45})`);
      gradient.addColorStop(1, 'transparent');
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalCompositeOperation = 'source-over';
  }

  private drawSubtleGlow(w: number, h: number) {
    const { r: br, g: bg, b: bb } = this.brandRgb;
    const cornerGlow = this.ctx.createRadialGradient(
      w * 0.88, h * 0.88, 0,
      w * 0.88, h * 0.88, h * 0.48
    );
    cornerGlow.addColorStop(0, `rgba(${br}, ${bg}, ${bb}, 0.06)`);
    cornerGlow.addColorStop(0.5, `rgba(${br}, ${bg}, ${bb}, 0.02)`);
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