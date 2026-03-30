import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-animated-background',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './animated-background.component.html',
  styleUrl: './animated-background.component.css',
})
export class AnimatedBackgroundComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private animationId = 0;
  private particles: Particle[] = [];
  private lightBeams: LightBeam[] = [];
  private time = 0;

  private readonly boundResize = () => this.resizeCanvas();

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.ctx = ctx;
    this.resizeCanvas();
    window.addEventListener('resize', this.boundResize);
    this.initParticles();
    this.initLightBeams();
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

  private initParticles() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.particles = [];
    const count = Math.min(110, Math.floor((w * h) / 16000));
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2.4 + 0.35,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.55 + 0.22,
        hue: Math.random() > 0.45 ? 38 + Math.random() * 30 : 185 + Math.random() * 45,
      });
    }
  }

  private initLightBeams() {
    this.lightBeams = [
      { originX: 0.08, originY: -0.02, angle: 0.38, spread: 0.52, hue: 350, speed: 0.4 },
      { originX: 0.92, originY: 0, angle: -0.4, spread: 0.48, hue: 195, speed: -0.35 },
      { originX: 0.5, originY: -0.06, angle: 0.06, spread: 0.58, hue: 48, speed: 0.25 },
      { originX: 0.24, originY: 0.04, angle: 0.52, spread: 0.38, hue: 275, speed: 0.5 },
    ];
  }

  private animate = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.time += 0.016;
    this.ctx.clearRect(0, 0, w, h);

    this.drawStudioBackdrop(w, h);
    this.drawSweepingBeams(w, h);
    this.drawAmbientGlows(w, h);
    this.drawParticles(w, h);
    this.drawFloorReflection(w, h);
    this.drawGearSilhouettes(w, h);
    this.drawMascot(w, h);
    this.drawMascotSidekick(w, h);
    this.drawVignette(w, h);

    this.animationId = requestAnimationFrame(this.animate);
  };

  /** Fondo más luminoso - estilo Reino Mágico de Rayman */
  private drawStudioBackdrop(w: number, h: number) {
    // Gradiente más claro y azuloso - como el cielo del Reino Mágico
    const g = this.ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#3d5a80');
    g.addColorStop(0.15, '#293241');
    g.addColorStop(0.35, '#293241');
    g.addColorStop(0.5, '#1d3557');
    g.addColorStop(0.65, '#1d3557');
    g.addColorStop(0.85, '#16243a');
    g.addColorStop(1, '#0f1c2b');
    this.ctx.fillStyle = g;
    this.ctx.fillRect(0, 0, w, h);

    // Luz general más brillante desde arriba
    const wash = this.ctx.createRadialGradient(
      w * 0.5,
      -h * 0.1,
      0,
      w * 0.5,
      h * 0.4,
      Math.max(w, h) * 0.7,
    );
    wash.addColorStop(0, 'hsla(210, 60%, 65%, 0.25)');
    wash.addColorStop(0.4, 'hsla(230, 50%, 50%, 0.12)');
    wash.addColorStop(1, 'transparent');
    this.ctx.fillStyle = wash;
    this.ctx.fillRect(0, 0, w, h);

    // Luz en el suelo
    const floor = this.ctx.createLinearGradient(0, h * 0.52, 0, h);
    floor.addColorStop(0, 'transparent');
    floor.addColorStop(1, 'rgba(80, 120, 200, 0.12)');
    this.ctx.fillStyle = floor;
    this.ctx.fillRect(0, 0, w, h);
  }

  /** Haces de luz más brillantes y dorados */
  private drawSweepingBeams(w: number, h: number) {
    this.lightBeams.forEach((beam, i) => {
      const sway = Math.sin(this.time * beam.speed + i * 1.7) * 0.11;
      const ox = beam.originX * w;
      const oy = beam.originY * h;
      const angle = beam.angle + sway;
      const len = Math.hypot(w, h) * 1.15;

      this.ctx.save();
      this.ctx.translate(ox, oy);
      this.ctx.rotate(angle);

      const flicker = 0.92 + Math.sin(this.time * 2.3 + i) * 0.08;
      const a = (0.4 + Math.sin(this.time * 2 + i) * 0.08) * flicker;
      const grad = this.ctx.createLinearGradient(0, 0, 0, len);
      grad.addColorStop(0, `hsla(${beam.hue}, 90%, 90%, ${a * 0.95})`);
      grad.addColorStop(0.12, `hsla(${beam.hue}, 95%, 75%, ${a * 0.85})`);
      grad.addColorStop(0.38, `hsla(${beam.hue}, 85%, 60%, ${a * 0.45})`);
      grad.addColorStop(0.7, `hsla(${beam.hue}, 75%, 48%, ${a * 0.12})`);
      grad.addColorStop(1, 'transparent');

      const halfW = w * beam.spread * 0.52;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(-halfW, len);
      this.ctx.lineTo(halfW, len);
      this.ctx.closePath();
      this.ctx.fillStyle = grad;
      this.ctx.fill();
      this.ctx.restore();

      const pulse = 0.55 + Math.sin(this.time * 3 + i) * 0.18;
      const spotR = 56 * pulse;
      const spot = this.ctx.createRadialGradient(ox, oy, 0, ox, oy, spotR);
      spot.addColorStop(0, `hsla(${beam.hue}, 100%, 96%, 0.95)`);
      spot.addColorStop(0.2, `hsla(${beam.hue}, 95%, 78%, 0.55)`);
      spot.addColorStop(0.5, `hsla(${beam.hue}, 90%, 55%, 0.18)`);
      spot.addColorStop(1, 'transparent');
      this.ctx.fillStyle = spot;
      this.ctx.beginPath();
      this.ctx.arc(ox, oy, spotR, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  private drawAmbientGlows(w: number, h: number) {
    // Colores más brillantes - dorados y azules
    const orbs = [
      { x: 0.14, y: 0.22, r: 0.28, hue: 45 },
      { x: 0.86, y: 0.18, r: 0.26, hue: 200 },
      { x: 0.52, y: 0.42, r: 0.22, hue: 55 },
      { x: 0.68, y: 0.58, r: 0.18, hue: 280 },
      { x: 0.35, y: 0.55, r: 0.14, hue: 35 },
    ];
    orbs.forEach((o, i) => {
      const cx = o.x * w + Math.sin(this.time * 0.55 + i) * 28;
      const cy = o.y * h + Math.cos(this.time * 0.42 + i * 0.8) * 20;
      const rad = Math.min(w, h) * o.r;
      const g = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      g.addColorStop(0, `hsla(${o.hue}, 95%, 72%, 0.48)`);
      g.addColorStop(0.35, `hsla(${o.hue}, 85%, 56%, 0.24)`);
      g.addColorStop(0.65, `hsla(${o.hue}, 75%, 46%, 0.1)`);
      g.addColorStop(1, 'transparent');
      this.ctx.fillStyle = g;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  private drawParticles(w: number, h: number) {
    this.ctx.globalCompositeOperation = 'screen';
    this.particles.forEach((p) => {
      p.x += p.speedX + Math.sin(this.time + p.y * 0.008) * 0.15;
      p.y += p.speedY;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      const glow = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4.5);
      glow.addColorStop(0, `hsla(${p.hue}, 95%, 88%, ${p.opacity})`);
      glow.addColorStop(0.45, `hsla(${p.hue}, 85%, 68%, ${p.opacity * 0.32})`);
      glow.addColorStop(1, 'transparent');
      this.ctx.fillStyle = glow;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * 4.5, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = `hsla(${p.hue}, 100%, 96%, ${Math.min(1, p.opacity * 1.15)})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalCompositeOperation = 'source-over';
  }

  private drawFloorReflection(w: number, h: number) {
    const y0 = h * 0.76;
    const grad = this.ctx.createLinearGradient(0, y0, 0, h);
    grad.addColorStop(0, 'rgba(100, 150, 220, 0.12)');
    grad.addColorStop(0.25, 'rgba(80, 120, 200, 0.1)');
    grad.addColorStop(0.55, 'rgba(100, 80, 180, 0.08)');
    grad.addColorStop(1, 'transparent');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, y0, w, h - y0);
  }

  private drawGearSilhouettes(w: number, h: number) {
    const base = h * 0.88;
    this.ctx.fillStyle = 'rgba(22, 18, 42, 0.88)';
    this.ctx.strokeStyle = 'rgba(55, 48, 88, 0.95)';
    this.ctx.lineWidth = 3;

    const tx = w * 0.06;
    this.ctx.beginPath();
    this.ctx.moveTo(tx, base);
    this.ctx.lineTo(tx - 28, h + 4);
    this.ctx.moveTo(tx, base);
    this.ctx.lineTo(tx + 32, h + 4);
    this.ctx.moveTo(tx, base);
    this.ctx.lineTo(tx, h + 2);
    this.ctx.stroke();

    const camY = base - 95;
    this.ctx.fillStyle = 'rgba(22, 18, 42, 0.9)';
    this.ctx.fillRect(tx - 38, camY, 76, 52);
    this.ctx.beginPath();
    this.ctx.arc(tx + 42, camY + 26, 22, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = 'rgba(28, 24, 50, 0.92)';
    this.ctx.beginPath();
    this.ctx.arc(tx + 48, camY + 26, 12, 0, Math.PI * 2);
    this.ctx.fill();

    const sx = w * 0.88;
    this.ctx.fillStyle = 'rgba(22, 18, 42, 0.88)';
    this.ctx.fillRect(sx - 40, base - 120, 80, 125);
    this.ctx.strokeStyle = 'rgba(55, 48, 88, 0.9)';
    this.ctx.strokeRect(sx - 40, base - 120, 80, 125);
    for (let i = 0; i < 4; i++) {
      this.ctx.fillStyle = 'rgba(14, 12, 30, 0.88)';
      this.ctx.fillRect(sx - 32, base - 112 + i * 26, 64, 18);
    }

    const px = w * 0.72;
    this.ctx.fillStyle = 'rgba(20, 16, 38, 0.88)';
    this.ctx.fillRect(px - 2, base - 140, 6, 140);
    this.ctx.fillStyle = 'rgba(220, 230, 255, 0.22)';
    this.ctx.fillRect(px - 48, base - 135, 96, 72);
    this.ctx.strokeStyle = 'rgba(90, 82, 130, 0.85)';
    this.ctx.strokeRect(px - 48, base - 135, 96, 72);

    // LED panel: parpadeo suave
    const ledPulse = 0.75 + Math.sin(this.time * 2.5) * 0.25;
    this.ctx.fillStyle = `rgba(180, 210, 255, ${0.12 * ledPulse})`;
    this.ctx.fillRect(px - 46, base - 132, 92, 20);

    this.ctx.strokeStyle = 'rgba(45, 42, 75, 0.75)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(w * 0.15, base + 8);
    this.ctx.bezierCurveTo(w * 0.35, base - 20, w * 0.5, base + 30, w * 0.78, base + 5);
    this.ctx.stroke();
  }

  /** Sonidista / pértiga — personaje 2, desincronizado del rojo. */
  private drawMascotSidekick(w: number, h: number) {
    const cx = w * 0.8;
    const cy = h * 0.71;
    const bounce = Math.sin(this.time * 4.3 + 1.2) * 5;
    const squash = 1 + Math.sin(this.time * 4.3 + 1.7) * 0.05;

    this.ctx.save();
    this.ctx.translate(cx, cy + bounce);
    this.ctx.scale(1, squash);

    const bodyW = 58;
    const bodyH = 50;
    const bx = -bodyW / 2;
    const by = -bodyH / 2;

    this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(2, bodyH * 0.58, 30, 9, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Pértiga (detrás del cuerpo)
    const boomAngle = -0.85 + Math.sin(this.time * 3) * 0.06;
    this.ctx.save();
    this.ctx.rotate(boomAngle);
    this.ctx.fillStyle = 'rgba(45, 42, 58, 0.95)';
    this.ctx.fillRect(-120, -4, 118, 8);
    this.ctx.fillStyle = 'rgba(75, 72, 95, 0.9)';
    this.ctx.fillRect(-125, -6, 14, 12);
    this.ctx.restore();

    this.roundRect(bx, by, bodyW, bodyH, 14, '#0f766e');
    this.roundRect(bx + 3, by + 5, bodyW - 6, bodyH - 16, 11, '#14b8a6');

    this.ctx.fillStyle = 'rgba(255,255,255,0.28)';
    this.ctx.beginPath();
    this.ctx.ellipse(bx + 16, by + 12, 11, 6, -0.35, 0, Math.PI * 2);
    this.ctx.fill();

    // Auriculares
    this.ctx.strokeStyle = 'rgba(15, 23, 42, 0.95)';
    this.ctx.lineWidth = 5;
    this.ctx.beginPath();
    this.ctx.arc(bx + bodyW * 0.5, by + 6, 22, Math.PI * 1.05, Math.PI * 1.95);
    this.ctx.stroke();
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(bx + 4, by - 2, 12, 16);
    this.ctx.fillRect(bx + bodyW - 16, by - 2, 12, 16);

    const eyeY = by + 20;
    this.ctx.fillStyle = '#fff';
    this.ctx.beginPath();
    this.ctx.arc(bx + 18, eyeY, 8, 0, Math.PI * 2);
    this.ctx.arc(bx + 40, eyeY, 8, 0, Math.PI * 2);
    this.ctx.fill();
    const look = Math.sin(this.time * 2.1 + 0.8) * 1.5;
    this.ctx.fillStyle = '#0f172a';
    this.ctx.beginPath();
    this.ctx.arc(bx + 19 + look, eyeY + 1, 3.5, 0, Math.PI * 2);
    this.ctx.arc(bx + 41 + look, eyeY + 1, 3.5, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#0d5c54';
    this.ctx.fillRect(bx + 12, by + bodyH - 5, 13, 18);
    this.ctx.fillRect(bx + 33, by + bodyH - 5, 13, 18);

    this.ctx.restore();
  }

  private drawMascot(w: number, h: number) {
    const cx = w * 0.18;
    const cy = h * 0.72;
    const bounce = Math.sin(this.time * 5) * 6;
    const squash = 1 + Math.sin(this.time * 5 + 0.4) * 0.06;

    this.ctx.save();
    this.ctx.translate(cx, cy + bounce);
    this.ctx.scale(1, squash);

    const bodyW = 72;
    const bodyH = 58;
    const bx = -bodyW / 2;
    const by = -bodyH / 2;

    this.ctx.fillStyle = 'rgba(0,0,0,0.35)';
    this.ctx.beginPath();
    this.ctx.ellipse(4, bodyH * 0.55, 38, 10, 0, 0, Math.PI * 2);
    this.ctx.fill();

    this.roundRect(bx, by, bodyW, bodyH, 16, '#e01f3d');
    this.roundRect(bx + 4, by + 6, bodyW - 8, bodyH - 18, 12, '#ff3b5c');

    this.ctx.fillStyle = 'rgba(255,255,255,0.35)';
    this.ctx.beginPath();
    this.ctx.ellipse(bx + 18, by + 14, 14, 8, -0.4, 0, Math.PI * 2);
    this.ctx.fill();

    const eyeY = by + 16;
    this.ctx.fillStyle = '#fff';
    this.ctx.beginPath();
    this.ctx.arc(bx + 22, eyeY, 11, 0, Math.PI * 2);
    this.ctx.arc(bx + 50, eyeY, 11, 0, Math.PI * 2);
    this.ctx.fill();

    const look = Math.sin(this.time * 2) * 2;
    this.ctx.fillStyle = '#0a0a12';
    this.ctx.beginPath();
    this.ctx.arc(bx + 24 + look, eyeY + 1, 5, 0, Math.PI * 2);
    this.ctx.arc(bx + 52 + look, eyeY + 1, 5, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#b81832';
    this.ctx.fillRect(bx + 14, by + bodyH - 6, 16, 22);
    this.ctx.fillRect(bx + 42, by + bodyH - 6, 16, 22);

    const armSwing = Math.sin(this.time * 4) * 0.12;
    this.ctx.save();
    this.ctx.translate(bx + bodyW - 4, by + 28);
    this.ctx.rotate(armSwing);
    this.ctx.fillStyle = '#ff3b5c';
    this.ctx.fillRect(0, -6, 36, 12);
    this.ctx.fillStyle = '#2a2838';
    this.ctx.fillRect(32, -10, 10, 28);
    this.ctx.fillStyle = '#444';
    this.ctx.beginPath();
    this.ctx.arc(37, 18, 9, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = 'rgba(255,255,255,0.2)';
    this.ctx.beginPath();
    this.ctx.arc(34, 14, 3, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();

    this.ctx.restore();
  }

  private roundRect(
    x: number,
    y: number,
    width: number,
    height: number,
    r: number,
    fill: string,
  ) {
    this.ctx.fillStyle = fill;
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.arcTo(x + width, y, x + width, y + height, r);
    this.ctx.arcTo(x + width, y + height, x, y + height, r);
    this.ctx.arcTo(x, y + height, x, y, r);
    this.ctx.arcTo(x, y, x + width, y, r);
    this.ctx.closePath();
    this.ctx.fill();
  }

  /** Viñeta suave para dar profundidad */
  private drawVignette(w: number, h: number) {
    const g = this.ctx.createRadialGradient(
      w * 0.5,
      h * 0.4,
      Math.min(w, h) * 0.28,
      w * 0.5,
      h * 0.52,
      Math.max(w, h) * 0.72,
    );
    g.addColorStop(0, 'transparent');
    g.addColorStop(0.55, 'rgba(0,0,0,0.06)');
    g.addColorStop(0.82, 'rgba(0,0,0,0.2)');
    g.addColorStop(1, 'rgba(0,0,0,0.35)');
    this.ctx.fillStyle = g;
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

interface LightBeam {
  originX: number;
  originY: number;
  angle: number;
  spread: number;
  hue: number;
  speed: number;
}
