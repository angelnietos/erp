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

interface MatrixCode {
  x: number;
  y: number;
  speed: number;
  chars: string[];
  opacity: number;
  size: number;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  hue: number;
  phase: number;
}

interface SpiritOrCloud {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  hue: number;
  phase: number;
  pulseSpeed: number;
}

interface BokehCircle {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  opacity: number;
  hue: number;
}

interface Spotlight {
  x: number;
  angle: number;
  targetAngle: number;
  speed: number;
  hue: number;
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
  
  // Elements Pools
  private particles: Particle[] = [];
  private matrixCodes: MatrixCode[] = [];
  private spirits: SpiritOrCloud[] = [];
  private bokehCircles: BokehCircle[] = [];
  private spotlights: Spotlight[] = [];

  private readonly boundResize = () => this.resizeCanvas();

  constructor() {
    effect(() => {
      // Re-init elements when theme changes significantly (e.g. style change)
      this.themeService.currentTheme();
      queueMicrotask(() => this.initElements());
    });
  }

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
    this.initElements();
  }

  private initElements() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const themeKey = this.themeService.currentTheme();
    const cfg = this.themeService.themes[themeKey];
    
    this.particles = [];
    this.matrixCodes = [];
    this.spirits = [];
    this.bokehCircles = [];
    this.spotlights = [];

    // Subtle particles for all themes
    const pCount = Math.floor((w * h) / 40000);
    for (let i = 0; i < pCount; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 1.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.4 + 0.1,
        hue: Math.random() * 360, // Will sync with theme in draw
        phase: Math.random() * Math.PI * 2
      });
    }

    if (cfg.bgStyle === 'matrix') {
      const columns = Math.floor(w / 45); // Lower density for CRM
      const matrixChars = '0123456789ABCDEFアイウエオカキクケコサシスセソ';
      for (let i = 0; i < columns; i++) {
        this.matrixCodes.push({
          x: i * 45,
          y: Math.random() * h,
          speed: 1 + Math.random() * 3,
          chars: Array.from({ length: 8 + Math.floor(Math.random() * 12) }, () => 
            matrixChars[Math.floor(Math.random() * matrixChars.length)]
          ),
          opacity: 0.1 + Math.random() * 0.25,
          size: 14 + Math.random() * 4,
        });
      }
    }

    if (cfg.bgStyle === 'nebula' || cfg.bgStyle === 'aurora') {
      for (let i = 0; i < 6; i++) {
        this.spirits.push({
          x: Math.random() * w,
          y: Math.random() * h,
          radius: 150 + Math.random() * 200,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          hue: 0, 
          phase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.005 + Math.random() * 0.01,
        });
      }
    }

    if (cfg.bgStyle === 'bokeh') {
      for (let i = 0; i < 20; i++) {
        this.bokehCircles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 40 + Math.random() * 100,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          opacity: 0.03 + Math.random() * 0.08,
          hue: 0
        });
      }
    }

    if (cfg.bgStyle === 'spot') {
      for (let i = 0; i < 3; i++) {
        this.spotlights.push({
          x: (w / 4) * (i + 1),
          angle: Math.random() * Math.PI,
          targetAngle: Math.random() * Math.PI,
          speed: 0.003 + Math.random() * 0.005,
          hue: 0
        });
      }
    }
  }

  private animate = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const themeKey = this.themeService.currentTheme();
    const cfg = this.themeService.themes[themeKey];
    
    this.time += 0.016;
    this.ctx.clearRect(0, 0, w, h);

    // Draw base background
    this.ctx.fillStyle = cfg.background;
    this.ctx.fillRect(0, 0, w, h);

    // Subtle atmospheric glow
    const g = this.ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, cfg.bgTertiary);
    g.addColorStop(1, cfg.background);
    this.ctx.fillStyle = g;
    this.ctx.fillRect(0, 0, w, h);

    // Draw active style
    switch (cfg.bgStyle) {
      case 'matrix': this.drawMatrixStyle(w, h, cfg); break;
      case 'nebula': this.drawNebulaStyle(w, h, cfg); break;
      case 'aurora': this.drawAuroraStyle(w, h, cfg); break;
      case 'bokeh': this.drawBokehStyle(w, h, cfg); break;
      case 'spot': this.drawSpotStyle(w, h, cfg); break;
      case 'grid': this.drawGridStyle(w, h, cfg); break;
    }

    this.drawParticles(w, h, cfg);

    this.animationId = requestAnimationFrame(this.animate);
  };

  private drawParticles(w: number, h: number, cfg: any) {
    this.ctx.globalCompositeOperation = 'screen';
    const brandHue = this.getHue(cfg.brand);
    
    this.particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;

      const alpha = p.opacity * (0.6 + Math.sin(this.time * 2 + p.phase) * 0.4);
      this.ctx.fillStyle = `hsla(${brandHue}, 80%, 70%, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalCompositeOperation = 'source-over';
  }

  private drawMatrixStyle(w: number, h: number, cfg: any) {
    const brandHue = this.getHue(cfg.brand);
    this.ctx.textAlign = 'center';
    this.ctx.font = '14px monospace';
    
    this.matrixCodes.forEach(code => {
      code.y += code.speed;
      if (code.y - (code.chars.length * code.size) > h) {
        code.y = -code.size;
      }
      
      code.chars.forEach((char, i) => {
        const charY = code.y - (i * code.size);
        if (charY < -20 || charY > h + 20) return;
        
        const alpha = code.opacity * (1 - i / code.chars.length);
        this.ctx.fillStyle = i === 0 
          ? `rgba(255, 255, 255, ${alpha * 1.5})` 
          : `hsla(${brandHue}, 100%, 60%, ${alpha})`;
        
        this.ctx.fillText(char, code.x, charY);
      });
    });
  }

  private drawNebulaStyle(w: number, h: number, cfg: any) {
    this.ctx.globalCompositeOperation = 'screen';
    const brandHue = this.getHue(cfg.brand);
    
    this.spirits.forEach((s, i) => {
      s.x += s.vx;
      s.y += s.vy;
      if (s.x < -s.radius) s.x = w + s.radius;
      if (s.x > w + s.radius) s.x = -s.radius;
      if (s.y < -s.radius) s.y = h + s.radius;
      if (s.y > h + s.radius) s.y = -s.radius;

      const pulse = 1 + Math.sin(this.time * s.pulseSpeed + s.phase) * 0.2;
      const r = s.radius * pulse;
      
      const g = this.ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r);
      g.addColorStop(0, `hsla(${brandHue}, 80%, 40%, 0.12)`);
      g.addColorStop(0.5, `hsla(${(brandHue + 30) % 360}, 80%, 30%, 0.04)`);
      g.addColorStop(1, 'transparent');
      
      this.ctx.fillStyle = g;
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalCompositeOperation = 'source-over';
  }

  private drawAuroraStyle(w: number, h: number, cfg: any) {
    this.ctx.globalCompositeOperation = 'screen';
    const brandHue = this.getHue(cfg.brand);
    
    for (let i = 0; i < 3; i++) {
      const shift = i * 100;
      const g = this.ctx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, 'transparent');
      g.addColorStop(0.5, `hsla(${(brandHue + i * 20) % 360}, 80%, 50%, 0.05)`);
      g.addColorStop(1, 'transparent');
      
      this.ctx.fillStyle = g;
      this.ctx.beginPath();
      this.ctx.moveTo(0, h * 0.2 + shift);
      for (let x = 0; x <= w; x += 50) {
        const y = h * 0.4 + Math.sin(x * 0.002 + this.time * 0.5 + i) * 150 + shift;
        this.ctx.lineTo(x, y);
      }
      this.ctx.lineTo(w, h);
      this.ctx.lineTo(0, h);
      this.ctx.fill();
    }
    this.ctx.globalCompositeOperation = 'source-over';
  }

  private drawBokehStyle(w: number, h: number, cfg: any) {
    const brandHue = this.getHue(cfg.brand);
    this.ctx.globalCompositeOperation = 'screen';
    this.bokehCircles.forEach(c => {
      c.x += c.vx; c.y += c.vy;
      if (c.x < -c.r) c.x = w + c.r; if (c.x > w + c.r) c.x = -c.r;
      if (c.y < -c.r) c.y = h + c.r; if (c.y > h + c.r) c.y = -c.r;

      const g = this.ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
      g.addColorStop(0, `hsla(${brandHue}, 70%, 70%, ${c.opacity})`);
      g.addColorStop(1, 'transparent');
      this.ctx.fillStyle = g;
      this.ctx.beginPath();
      this.ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalCompositeOperation = 'source-over';
  }

  private drawSpotStyle(w: number, h: number, cfg: any) {
    this.ctx.globalCompositeOperation = 'screen';
    const brandHue = this.getHue(cfg.brand);
    
    this.spotlights.forEach(s => {
      s.angle += (s.targetAngle - s.angle) * s.speed;
      if (Math.abs(s.targetAngle - s.angle) < 0.05) s.targetAngle = Math.random() * Math.PI;

      const lx = s.x;
      const length = h * 1.2;
      const x2 = lx + Math.cos(s.angle) * length;
      const y2 = Math.sin(s.angle) * length;

      const g = this.ctx.createRadialGradient(lx, 0, 0, lx, 0, length);
      g.addColorStop(0, `hsla(${brandHue}, 90%, 80%, 0.12)`);
      g.addColorStop(1, 'transparent');

      this.ctx.fillStyle = g;
      this.ctx.beginPath();
      this.ctx.moveTo(lx, 0);
      this.ctx.lineTo(x2 - 150, y2);
      this.ctx.lineTo(x2 + 150, y2);
      this.ctx.closePath();
      this.ctx.fill();
    });
    this.ctx.globalCompositeOperation = 'source-over';
  }

  private drawGridStyle(w: number, h: number, cfg: any) {
    const brandHue = this.getHue(cfg.brand);
    this.ctx.strokeStyle = `hsla(${brandHue}, 60%, 50%, 0.08)`;
    this.ctx.lineWidth = 1;
    
    const size = 60;
    const offset = (this.time * 20) % size;
    
    this.ctx.beginPath();
    for (let x = offset; x < w; x += size) {
      this.ctx.moveTo(x, 0); this.ctx.lineTo(x, h);
    }
    for (let y = offset; y < h; y += size) {
      this.ctx.moveTo(0, y); this.ctx.lineTo(w, y);
    }
    this.ctx.stroke();
  }

  private getHue(hex: string): number {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0;
    if (max !== min) {
      const d = max - min;
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return Math.floor(h * 360);
  }
}
