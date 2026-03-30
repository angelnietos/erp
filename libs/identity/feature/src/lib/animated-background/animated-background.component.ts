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
  private time = 0;
  private particles: Particle[] = [];
  private fireflies: Firefly[] = [];
  private spirits: Spirit[] = [];
  private lightBeams: LightBeam[] = [];
  private clouds: Cloud[] = [];

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

    // Initialize floating particles
    const particleCount = Math.min(120, Math.floor((w * h) / 14000));
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.25,
        opacity: Math.random() * 0.5 + 0.25,
        hue: Math.random() > 0.5 ? 45 + Math.random() * 25 : 180 + Math.random() * 40,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Initialize fireflies
    const fireflyCount = 25;
    for (let i = 0; i < fireflyCount; i++) {
      this.fireflies.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.8,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 4 + 2,
        brightness: Math.random(),
        blinkSpeed: Math.random() * 0.05 + 0.02,
        hue: 50 + Math.random() * 20,
      });
    }

    // Initialize spirits (larger glowing orbs)
    const spiritCount = 8;
    for (let i = 0; i < spiritCount; i++) {
      this.spirits.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: Math.random() * 40 + 30,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.2,
        hue: i % 2 === 0 ? 45 + Math.random() * 15 : 200 + Math.random() * 30,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
      });
    }

    // Initialize light beams
    this.lightBeams = [
      { originX: 0.1, originY: -0.05, angle: 0.4, spread: 0.55, hue: 45, speed: 0.35 },
      { originX: 0.85, originY: 0, angle: -0.35, spread: 0.5, hue: 200, speed: -0.3 },
      { originX: 0.5, originY: -0.08, angle: 0.08, spread: 0.6, hue: 55, speed: 0.2 },
      { originX: 0.3, originY: 0.02, angle: 0.5, spread: 0.4, hue: 280, speed: 0.45 },
      { originX: 0.7, originY: -0.03, angle: -0.2, spread: 0.45, hue: 170, speed: 0.25 },
    ];

    // Initialize clouds
    const cloudCount = 6;
    for (let i = 0; i < cloudCount; i++) {
      this.clouds.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.4,
        width: Math.random() * 200 + 150,
        speed: Math.random() * 0.15 + 0.05,
        opacity: Math.random() * 0.15 + 0.05,
      });
    }
  }

  private animate = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.time += 0.016;
    this.ctx.clearRect(0, 0, w, h);

    this.drawDynamicSky(w, h);
    this.drawClouds(w, h);
    this.drawLightBeams(w, h);
    this.drawSpirits(w, h);
    this.drawParticles(w, h);
    this.drawFireflies(w, h);
    this.drawGearSilhouettes(w, h);
    this.drawMascot(w, h);
    this.drawMascotSidekick(w, h);
    this.drawForegroundGlow(w, h);

    this.animationId = requestAnimationFrame(this.animate);
  };

  /** Dynamic gradient sky - more vibrant */
  private drawDynamicSky(w: number, h: number) {
    const t = this.time * 0.1;
    const g = this.ctx.createLinearGradient(0, 0, 0, h);
    
    const topColor = `hsl(${210 + Math.sin(t * 0.5) * 10}, 50%, ${35 + Math.sin(t * 0.3) * 5}%)`;
    const midColor = `hsl(${230 + Math.sin(t * 0.4) * 8}, 45%, ${25 + Math.sin(t * 0.25) * 4}%)`;
    const bottomColor = `hsl(${250 + Math.sin(t * 0.35) * 6}, 40%, ${18 + Math.sin(t * 0.2) * 3}%)`;
    
    g.addColorStop(0, topColor);
    g.addColorStop(0.3, midColor);
    g.addColorStop(0.6, bottomColor);
    g.addColorStop(1, '#0a1525');
    
    this.ctx.fillStyle = g;
    this.ctx.fillRect(0, 0, w, h);

    const aurora = this.ctx.createLinearGradient(0, 0, w, 0);
    aurora.addColorStop(0, 'hsla(160, 70%, 40%, 0.08)');
    aurora.addColorStop(0.3, 'hsla(200, 60%, 45%, 0.1)');
    aurora.addColorStop(0.5, 'hsla(240, 50%, 40%, 0.12)');
    aurora.addColorStop(0.7, 'hsla(280, 45%, 35%, 0.08)');
    aurora.addColorStop(1, 'hsla(320, 50%, 30%, 0.06)');
    this.ctx.fillStyle = aurora;
    this.ctx.fillRect(0, 0, w, h * 0.5);
  }

  private drawClouds(w: number, h: number) {
    this.clouds.forEach((cloud) => {
      cloud.x += cloud.speed;
      if (cloud.x > w + cloud.width) cloud.x = -cloud.width;

      const gradient = this.ctx.createRadialGradient(
        cloud.x, cloud.y, 0,
        cloud.x, cloud.y, cloud.width
      );
      gradient.addColorStop(0, `rgba(100, 140, 200, ${cloud.opacity})`);
      gradient.addColorStop(0.5, `rgba(80, 120, 180, ${cloud.opacity * 0.5})`);
      gradient.addColorStop(1, 'transparent');
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.ellipse(cloud.x, cloud.y, cloud.width, cloud.width * 0.3, 0, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  private drawLightBeams(w: number, h: number) {
    this.lightBeams.forEach((beam, i) => {
      const sway = Math.sin(this.time * beam.speed + i * 1.5) * 0.15;
      const ox = beam.originX * w;
      const oy = beam.originY * h;
      const angle = beam.angle + sway;
      const len = Math.hypot(w, h) * 1.2;

      this.ctx.save();
      this.ctx.translate(ox, oy);
      this.ctx.rotate(angle);

      const flicker = 0.9 + Math.sin(this.time * 2.5 + i) * 0.1;
      const a = (0.35 + Math.sin(this.time * 2.2 + i) * 0.1) * flicker;
      
      const grad = this.ctx.createLinearGradient(0, 0, 0, len);
      grad.addColorStop(0, `hsla(${beam.hue}, 95%, 92%, ${a})`);
      grad.addColorStop(0.1, `hsla(${beam.hue}, 90%, 78%, ${a * 0.9})`);
      grad.addColorStop(0.35, `hsla(${beam.hue}, 80%, 62%, ${a * 0.5})`);
      grad.addColorStop(0.7, `hsla(${beam.hue}, 70%, 48%, ${a * 0.15})`);
      grad.addColorStop(1, 'transparent');

      const halfW = w * beam.spread * 0.55;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(-halfW, len);
      this.ctx.lineTo(halfW, len);
      this.ctx.closePath();
      this.ctx.fillStyle = grad;
      this.ctx.fill();
      this.ctx.restore();

      const pulse = 0.5 + Math.sin(this.time * 3.5 + i) * 0.2;
      const spotR = 50 * pulse;
      const spot = this.ctx.createRadialGradient(ox, oy, 0, ox, oy, spotR);
      spot.addColorStop(0, `hsla(${beam.hue}, 100%, 98%, 0.9)`);
      spot.addColorStop(0.15, `hsla(${beam.hue}, 95%, 80%, 0.6)`);
      spot.addColorStop(0.4, `hsla(${beam.hue}, 85%, 58%, 0.25)`);
      spot.addColorStop(1, 'transparent');
      this.ctx.fillStyle = spot;
      this.ctx.beginPath();
      this.ctx.arc(ox, oy, spotR, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  private drawSpirits(w: number, h: number) {
    this.spirits.forEach((spirit, i) => {
      spirit.x += spirit.vx + Math.sin(this.time * 0.5 + spirit.phase) * 0.2;
      spirit.y += spirit.vy + Math.cos(this.time * 0.3 + spirit.phase) * 0.15;
      
      if (spirit.x < -spirit.radius) spirit.x = w + spirit.radius;
      if (spirit.x > w + spirit.radius) spirit.x = -spirit.radius;
      if (spirit.y < -spirit.radius) spirit.y = h + spirit.radius;
      if (spirit.y > h + spirit.radius) spirit.y = -spirit.radius;

      const pulse = 0.8 + Math.sin(this.time * 2 + spirit.phase) * 0.2;
      const radius = spirit.radius * pulse;
      
      const outerGlow = this.ctx.createRadialGradient(
        spirit.x, spirit.y, 0,
        spirit.x, spirit.y, radius * 2.5
      );
      outerGlow.addColorStop(0, `hsla(${spirit.hue}, 85%, 65%, 0.25)`);
      outerGlow.addColorStop(0.4, `hsla(${spirit.hue}, 75%, 55%, 0.12)`);
      outerGlow.addColorStop(1, 'transparent');
      this.ctx.fillStyle = outerGlow;
      this.ctx.beginPath();
      this.ctx.arc(spirit.x, spirit.y, radius * 2.5, 0, Math.PI * 2);
      this.ctx.fill();

      const innerGlow = this.ctx.createRadialGradient(
        spirit.x, spirit.y, 0,
        spirit.x, spirit.y, radius
      );
      innerGlow.addColorStop(0, `hsla(${spirit.hue}, 90%, 80%, 0.6)`);
      innerGlow.addColorStop(0.5, `hsla(${spirit.hue}, 80%, 60%, 0.3)`);
      innerGlow.addColorStop(1, 'transparent');
      this.ctx.fillStyle = innerGlow;
      this.ctx.beginPath();
      this.ctx.arc(spirit.x, spirit.y, radius, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = `hsla(${spirit.hue}, 95%, 92%, 0.8)`;
      this.ctx.beginPath();
      this.ctx.arc(spirit.x, spirit.y, radius * 0.3, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  private drawParticles(w: number, h: number) {
    this.ctx.globalCompositeOperation = 'screen';
    
    this.particles.forEach((p) => {
      p.x += p.speedX + Math.sin(this.time + p.y * 0.006) * 0.2;
      p.y += p.speedY + Math.cos(this.time * 0.7 + p.x * 0.004) * 0.1;
      
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      const twinkle = 0.7 + Math.sin(this.time * 3 + p.phase) * 0.3;
      const opacity = p.opacity * twinkle;

      const glow = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5);
      glow.addColorStop(0, `hsla(${p.hue}, 95%, 85%, ${opacity})`);
      glow.addColorStop(0.4, `hsla(${p.hue}, 85%, 65%, ${opacity * 0.3})`);
      glow.addColorStop(1, 'transparent');
      this.ctx.fillStyle = glow;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * 5, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = `hsla(${p.hue}, 100%, 95%, ${opacity * 1.2})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    this.ctx.globalCompositeOperation = 'source-over';
  }

  private drawFireflies(w: number, h: number) {
    this.ctx.globalCompositeOperation = 'screen';
    
    this.fireflies.forEach((ff) => {
      ff.x += ff.vx + Math.sin(this.time * 2 + ff.brightness * 10) * 0.3;
      ff.y += ff.vy + Math.cos(this.time * 1.5 + ff.brightness * 8) * 0.2;
      ff.brightness += ff.blinkSpeed;
      
      if (ff.x < 0) ff.x = w;
      if (ff.x > w) ff.x = 0;
      if (ff.y < 0) ff.y = h;
      if (ff.y > h) ff.y = 0;

      const glow = Math.sin(ff.brightness) * 0.5 + 0.5;
      const alpha = glow * 0.8;

      const gradient = this.ctx.createRadialGradient(ff.x, ff.y, 0, ff.x, ff.y, ff.size * 4);
      gradient.addColorStop(0, `hsla(${ff.hue}, 100%, 90%, ${alpha})`);
      gradient.addColorStop(0.3, `hsla(${ff.hue}, 95%, 70%, ${alpha * 0.5})`);
      gradient.addColorStop(1, 'transparent');
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(ff.x, ff.y, ff.size * 4, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = `hsla(${ff.hue}, 100%, 98%, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(ff.x, ff.y, ff.size * 0.6, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    this.ctx.globalCompositeOperation = 'source-over';
  }

  private drawGearSilhouettes(w: number, h: number) {
    const base = h * 0.88;
    this.ctx.fillStyle = 'rgba(22, 18, 42, 0.85)';
    this.ctx.strokeStyle = 'rgba(55, 48, 88, 0.92)';
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

  /** Main mascot character - Rayman inspired */
  private drawMascot(w: number, h: number) {
    const cx = w * 0.15;
    const cy = h * 0.72;
    const bounce = Math.sin(this.time * 5) * 6;
    const squash = 1 + Math.sin(this.time * 5 + 0.4) * 0.06;

    this.ctx.save();
    this.ctx.translate(cx, cy + bounce);
    this.ctx.scale(1, squash);

    const bodyW = 80;
    const bodyH = 65;
    const bx = -bodyW / 2;
    const by = -bodyH / 2;

    // Shadow
    this.ctx.fillStyle = 'rgba(0,0,0,0.35)';
    this.ctx.beginPath();
    this.ctx.ellipse(4, bodyH * 0.55, 42, 11, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Body - red/pink colors like Rayman
    this.roundRect(bx, by, bodyW, bodyH, 18, '#e01f3d');
    this.roundRect(bx + 5, by + 7, bodyW - 10, bodyH - 20, 14, '#ff3b5c');

    // Highlight
    this.ctx.fillStyle = 'rgba(255,255,255,0.35)';
    this.ctx.beginPath();
    this.ctx.ellipse(bx + 20, by + 16, 16, 9, -0.4, 0, Math.PI * 2);
    this.ctx.fill();

    // Eyes
    const eyeY = by + 18;
    this.ctx.fillStyle = '#fff';
    this.ctx.beginPath();
    this.ctx.arc(bx + 24, eyeY, 12, 0, Math.PI * 2);
    this.ctx.arc(bx + 56, eyeY, 12, 0, Math.PI * 2);
    this.ctx.fill();

    const look = Math.sin(this.time * 2) * 2;
    this.ctx.fillStyle = '#0a0a12';
    this.ctx.beginPath();
    this.ctx.arc(bx + 26 + look, eyeY + 1, 5.5, 0, Math.PI * 2);
    this.ctx.arc(bx + 58 + look, eyeY + 1, 5.5, 0, Math.PI * 2);
    this.ctx.fill();

    // Feet
    this.ctx.fillStyle = '#b81832';
    this.ctx.fillRect(bx + 15, by + bodyH - 6, 18, 24);
    this.ctx.fillRect(bx + 47, by + bodyH - 6, 18, 24);

    // Arms with hands
    const armSwing = Math.sin(this.time * 4) * 0.12;
    this.ctx.save();
    this.ctx.translate(bx + bodyW - 4, by + 30);
    this.ctx.rotate(armSwing);
    this.ctx.fillStyle = '#ff3b5c';
    this.ctx.fillRect(0, -7, 40, 14);
    this.ctx.fillStyle = '#2a2838';
    this.ctx.fillRect(36, -12, 12, 32);
    this.ctx.fillStyle = '#444';
    this.ctx.beginPath();
    this.ctx.arc(42, 20, 10, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = 'rgba(255,255,255,0.2)';
    this.ctx.beginPath();
    this.ctx.arc(39, 16, 3.5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();

    this.ctx.restore();
  }

  /** Secondary mascot - sidekick character */
  private drawMascotSidekick(w: number, h: number) {
    const cx = w * 0.82;
    const cy = h * 0.71;
    const bounce = Math.sin(this.time * 4.3 + 1.2) * 5;
    const squash = 1 + Math.sin(this.time * 4.3 + 1.7) * 0.05;

    this.ctx.save();
    this.ctx.translate(cx, cy + bounce);
    this.ctx.scale(1, squash);

    const bodyW = 65;
    const bodyH = 55;
    const bx = -bodyW / 2;
    const by = -bodyH / 2;

    // Shadow
    this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(2, bodyH * 0.58, 33, 10, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Boom microphone pole
    const boomAngle = -0.85 + Math.sin(this.time * 3) * 0.06;
    this.ctx.save();
    this.ctx.rotate(boomAngle);
    this.ctx.fillStyle = 'rgba(45, 42, 58, 0.95)';
    this.ctx.fillRect(-130, -4, 128, 8);
    this.ctx.fillStyle = 'rgba(75, 72, 95, 0.9)';
    this.ctx.fillRect(-135, -7, 15, 14);
    this.ctx.restore();

    // Body - teal/green
    this.roundRect(bx, by, bodyW, bodyH, 16, '#0f766e');
    this.roundRect(bx + 4, by + 6, bodyW - 8, bodyH - 18, 12, '#14b8a6');

    // Highlight
    this.ctx.fillStyle = 'rgba(255,255,255,0.28)';
    this.ctx.beginPath();
    this.ctx.ellipse(bx + 18, by + 14, 12, 7, -0.35, 0, Math.PI * 2);
    this.ctx.fill();

    // Headphones
    this.ctx.strokeStyle = 'rgba(15, 23, 42, 0.95)';
    this.ctx.lineWidth = 5;
    this.ctx.beginPath();
    this.ctx.arc(bx + bodyW * 0.5, by + 7, 24, Math.PI * 1.05, Math.PI * 1.95);
    this.ctx.stroke();
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(bx + 4, by - 2, 14, 18);
    this.ctx.fillRect(bx + bodyW - 18, by - 2, 14, 18);

    // Eyes
    const eyeY = by + 22;
    this.ctx.fillStyle = '#fff';
    this.ctx.beginPath();
    this.ctx.arc(bx + 20, eyeY, 9, 0, Math.PI * 2);
    this.ctx.arc(bx + 45, eyeY, 9, 0, Math.PI * 2);
    this.ctx.fill();
    const look = Math.sin(this.time * 2.1 + 0.8) * 1.5;
    this.ctx.fillStyle = '#0f172a';
    this.ctx.beginPath();
    this.ctx.arc(bx + 21 + look, eyeY + 1, 4, 0, Math.PI * 2);
    this.ctx.arc(bx + 46 + look, eyeY + 1, 4, 0, Math.PI * 2);
    this.ctx.fill();

    // Feet
    this.ctx.fillStyle = '#0d5c54';
    this.ctx.fillRect(bx + 14, by + bodyH - 5, 15, 20);
    this.ctx.fillRect(bx + 37, by + bodyH - 5, 15, 20);

    this.ctx.restore();
  }

  private drawForegroundGlow(w: number, h: number) {
    const bottomGlow = this.ctx.createRadialGradient(
      w * 0.5, h, 0,
      w * 0.5, h * 0.7, h * 0.8
    );
    bottomGlow.addColorStop(0, 'hsla(280, 50%, 35%, 0.15)');
    bottomGlow.addColorStop(0.5, 'hsla(240, 45%, 30%, 0.08)');
    bottomGlow.addColorStop(1, 'transparent');
    this.ctx.fillStyle = bottomGlow;
    this.ctx.fillRect(0, 0, w, h);

    const leftGlow = this.ctx.createRadialGradient(0, h * 0.6, 0, 0, h * 0.6, h * 0.8);
    leftGlow.addColorStop(0, 'hsla(200, 50%, 35%, 0.1)');
    leftGlow.addColorStop(1, 'transparent');
    this.ctx.fillStyle = leftGlow;
    this.ctx.fillRect(0, 0, w * 0.4, h);

    const rightGlow = this.ctx.createRadialGradient(w, h * 0.4, 0, w, h * 0.4, h * 0.7);
    rightGlow.addColorStop(0, 'hsla(160, 45%, 30%, 0.08)');
    rightGlow.addColorStop(1, 'transparent');
    this.ctx.fillStyle = rightGlow;
    this.ctx.fillRect(w * 0.6, 0, w * 0.4, h);
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

interface Firefly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  brightness: number;
  blinkSpeed: number;
  hue: number;
}

interface Spirit {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  hue: number;
  phase: number;
  pulseSpeed: number;
}

interface LightBeam {
  originX: number;
  originY: number;
  angle: number;
  spread: number;
  hue: number;
  speed: number;
}

interface Cloud {
  x: number;
  y: number;
  width: number;
  speed: number;
  opacity: number;
}
