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
  
  // All animation elements
  private particles: Particle[] = [];
  private fireflies: Firefly[] = [];
  private spirits: Spirit[] = [];
  private lightBeams: LightBeam[] = [];
  private clouds: Cloud[] = [];
  private stars: Star[] = [];
  private rainDrops: RainDrop[] = [];
  private lumens: Lumen[] = [];
  private floatingElements: FloatingElement[] = [];

  private readonly boundResize = () => this.resizeCanvas();

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.ctx = ctx;
    this.resizeCanvas();
    window.addEventListener('resize', this.boundResize);
    this.initAllElements();
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

  private initAllElements() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // === STARS (background stars) ===
    const starCount = 80;
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.5,
        size: Math.random() * 2 + 0.5,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
        brightness: Math.random() * 0.5 + 0.3,
      });
    }

    // === PARTICLES (fairy dust) ===
    const particleCount = 150;
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.25,
        opacity: Math.random() * 0.5 + 0.2,
        hue: Math.random() > 0.5 ? 40 + Math.random() * 30 : 180 + Math.random() * 40,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // === FIREFLIES ===
    const fireflyCount = 30;
    for (let i = 0; i < fireflyCount; i++) {
      this.fireflies.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.8,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 3.5 + 1.5,
        brightness: Math.random(),
        blinkSpeed: Math.random() * 0.05 + 0.02,
        hue: 45 + Math.random() * 25,
      });
    }

    // === SPIRITS (large glowing orbs) ===
    const spiritCount = 12;
    for (let i = 0; i < spiritCount; i++) {
      this.spirits.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: Math.random() * 50 + 30,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.2,
        hue: i % 3 === 0 ? 45 + Math.random() * 20 : i % 3 === 1 ? 200 + Math.random() * 30 : 280 + Math.random() * 20,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
      });
    }

    // === LIGHT BEAMS ===
    this.lightBeams = [
      { originX: 0.08, originY: -0.05, angle: 0.42, spread: 0.55, hue: 45, speed: 0.35 },
      { originX: 0.88, originY: 0, angle: -0.38, spread: 0.5, hue: 200, speed: -0.32 },
      { originX: 0.5, originY: -0.1, angle: 0.06, spread: 0.6, hue: 55, speed: 0.22 },
      { originX: 0.25, originY: 0.02, angle: 0.55, spread: 0.4, hue: 280, speed: 0.48 },
      { originX: 0.75, originY: -0.03, angle: -0.25, spread: 0.45, hue: 160, speed: 0.28 },
    ];

    // === CLOUDS ===
    const cloudCount = 8;
    for (let i = 0; i < cloudCount; i++) {
      this.clouds.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.35,
        width: Math.random() * 220 + 120,
        speed: Math.random() * 0.15 + 0.03,
        opacity: Math.random() * 0.15 + 0.03,
      });
    }

    // === RAIN DROPS ===
    const rainCount = 50;
    for (let i = 0; i < rainCount; i++) {
      this.rainDrops.push({
        x: Math.random() * w,
        y: Math.random() * h,
        speed: Math.random() * 3 + 2,
        length: Math.random() * 20 + 10,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }

    // === FLOATING ELEMENTS (magical items) ===
    const floatCount = 15;
    const floatTypes = ['✨', '⭐', '💫', '🔮', '🌟', '💎', '🔷', '🌙'];
    for (let i = 0; i < floatCount; i++) {
      this.floatingElements.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.3,
        symbol: floatTypes[Math.floor(Math.random() * floatTypes.length)],
        size: Math.random() * 20 + 15,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        opacity: Math.random() * 0.6 + 0.3,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // === LUMEN CHARACTERS (CRM feature emojis flying) ===
    const lumenTypes = [
      { type: 'inventory', hue: 35, label: '📦' },
      { type: 'clients', hue: 200, label: '👥' },
      { type: 'billing', hue: 45, label: '💰' },
      { type: 'fleet', hue: 220, label: '🚗' },
      { type: 'rentals', hue: 280, label: '📅' },
      { type: 'delivery', hue: 160, label: '🚚' },
      { type: 'budget', hue: 120, label: '📊' },
    ];

    lumenTypes.forEach((type) => {
      for (let i = 0; i < 4; i++) {
        this.lumens.push({
          type: type.type,
          hue: type.hue,
          label: type.label,
          x: Math.random() * w,
          y: Math.random() * h * 0.5 + h * 0.2,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.5,
          size: 18 + Math.random() * 14,
          phase: Math.random() * Math.PI * 2,
          floatSpeed: 0.4 + Math.random() * 0.5,
          bobAmount: 12 + Math.random() * 12,
        });
      }
    });
  }

  private animate = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.time += 0.016;
    this.ctx.clearRect(0, 0, w, h);

    // Draw everything in layers (back to front)
    this.drawSky(w, h);
    this.drawStars(w, h);
    this.drawAurora(w, h);
    this.drawClouds(w, h);
    this.drawLightBeams(w, h);
    this.drawSpirits(w, h);
    this.drawRain(w, h);
    this.drawParticles(w, h);
    this.drawFireflies(w, h);
    this.drawFloatingElements(w, h);
    this.drawLumenCharacters(w, h);
    this.drawGearSilhouettes(w, h);
    this.drawMascot(w, h);
    this.drawMascotSidekick(w, h);
    this.drawForegroundGlow(w, h);

    this.animationId = requestAnimationFrame(this.animate);
  };

  private drawSky(w: number, h: number) {
    const t = this.time * 0.08;
    const g = this.ctx.createLinearGradient(0, 0, 0, h);
    
    g.addColorStop(0, `hsl(${215 + Math.sin(t * 0.4) * 8}, 45%, ${32 + Math.sin(t * 0.25) * 4}%)`);
    g.addColorStop(0.3, `hsl(${230 + Math.sin(t * 0.35) * 6}, 42%, ${22 + Math.sin(t * 0.2) * 3}%)`);
    g.addColorStop(0.55, `hsl(${250 + Math.sin(t * 0.3) * 5}, 38%, ${16 + Math.sin(t * 0.15) * 2}%)`);
    g.addColorStop(0.75, `hsl(${270 + Math.sin(t * 0.25) * 4}, 35%, ${12 + Math.sin(t * 0.1) * 2}%)`);
    g.addColorStop(1, '#080d18');
    
    this.ctx.fillStyle = g;
    this.ctx.fillRect(0, 0, w, h);
  }

  private drawStars(w: number, h: number) {
    this.stars.forEach((star) => {
      const twinkle = Math.sin(this.time * star.twinkleSpeed * 60 + star.twinklePhase);
      const alpha = star.brightness * (0.5 + twinkle * 0.5);
      
      const gradient = this.ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 2);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      gradient.addColorStop(0.5, `rgba(200, 220, 255, ${alpha * 0.5})`);
      gradient.addColorStop(1, 'transparent');
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  private drawAurora(w: number, h: number) {
    const t = this.time * 0.15;
    
    // Aurora wave 1
    this.ctx.beginPath();
    this.ctx.moveTo(0, h * 0.15);
    for (let x = 0; x <= w; x += 20) {
      const y = h * 0.15 + Math.sin(x * 0.005 + t) * 30 + Math.sin(x * 0.01 + t * 0.7) * 15;
      this.ctx.lineTo(x, y);
    }
    this.ctx.lineTo(w, h * 0.3);
    this.ctx.lineTo(0, h * 0.3);
    this.ctx.closePath();
    
    const auroraGrad1 = this.ctx.createLinearGradient(0, h * 0.1, 0, h * 0.35);
    auroraGrad1.addColorStop(0, 'hsla(160, 70%, 50%, 0.15)');
    auroraGrad1.addColorStop(0.5, 'hsla(200, 60%, 45%, 0.1)');
    auroraGrad1.addColorStop(1, 'transparent');
    this.ctx.fillStyle = auroraGrad1;
    this.ctx.fill();

    // Aurora wave 2
    this.ctx.beginPath();
    this.ctx.moveTo(0, h * 0.2);
    for (let x = 0; x <= w; x += 20) {
      const y = h * 0.2 + Math.sin(x * 0.006 + t + 2) * 25 + Math.sin(x * 0.012 + t * 0.6) * 12;
      this.ctx.lineTo(x, y);
    }
    this.ctx.lineTo(w, h * 0.35);
    this.ctx.lineTo(0, h * 0.35);
    this.ctx.closePath();
    
    const auroraGrad2 = this.ctx.createLinearGradient(0, h * 0.15, 0, h * 0.4);
    auroraGrad2.addColorStop(0, 'hsla(260, 55%, 45%, 0.12)');
    auroraGrad2.addColorStop(0.5, 'hsla(300, 50%, 40%, 0.08)');
    auroraGrad2.addColorStop(1, 'transparent');
    this.ctx.fillStyle = auroraGrad2;
    this.ctx.fill();
  }

  private drawClouds(w: number, h: number) {
    this.clouds.forEach((cloud) => {
      cloud.x += cloud.speed;
      if (cloud.x > w + cloud.width) cloud.x = -cloud.width;

      const gradient = this.ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.width);
      gradient.addColorStop(0, `rgba(120, 150, 200, ${cloud.opacity})`);
      gradient.addColorStop(0.4, `rgba(90, 120, 180, ${cloud.opacity * 0.4})`);
      gradient.addColorStop(1, 'transparent');
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.ellipse(cloud.x, cloud.y, cloud.width, cloud.width * 0.2, 0, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Add some cloud layers for depth
      this.ctx.fillStyle = `rgba(100, 130, 190, ${cloud.opacity * 0.5})`;
      this.ctx.beginPath();
      this.ctx.ellipse(cloud.x - cloud.width * 0.3, cloud.y + 10, cloud.width * 0.5, cloud.width * 0.15, 0, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  private drawLightBeams(w: number, h: number) {
    this.lightBeams.forEach((beam, i) => {
      const sway = Math.sin(this.time * beam.speed + i * 1.5) * 0.15;
      const ox = beam.originX * w;
      const oy = beam.originY * h;
      const angle = beam.angle + sway;
      const len = Math.hypot(w, h) * 1.25;

      this.ctx.save();
      this.ctx.translate(ox, oy);
      this.ctx.rotate(angle);

      const flicker = 0.9 + Math.sin(this.time * 2.5 + i) * 0.1;
      const a = (0.32 + Math.sin(this.time * 2.2 + i) * 0.08) * flicker;
      
      const grad = this.ctx.createLinearGradient(0, 0, 0, len);
      grad.addColorStop(0, `hsla(${beam.hue}, 92%, 92%, ${a})`);
      grad.addColorStop(0.1, `hsla(${beam.hue}, 88%, 78%, ${a * 0.9})`);
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

      // Glowing source orb
      const pulse = 0.5 + Math.sin(this.time * 3.5 + i) * 0.2;
      const spotR = 55 * pulse;
      const spot = this.ctx.createRadialGradient(ox, oy, 0, ox, oy, spotR);
      spot.addColorStop(0, `hsla(${beam.hue}, 100%, 98%, 0.92)`);
      spot.addColorStop(0.12, `hsla(${beam.hue}, 95%, 82%, 0.6)`);
      spot.addColorStop(0.35, `hsla(${beam.hue}, 88%, 58%, 0.25)`);
      spot.addColorStop(1, 'transparent');
      this.ctx.fillStyle = spot;
      this.ctx.beginPath();
      this.ctx.arc(ox, oy, spotR, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  private drawSpirits(w: number, h: number) {
    this.spirits.forEach((spirit) => {
      spirit.x += spirit.vx + Math.sin(this.time * 0.5 + spirit.phase) * 0.25;
      spirit.y += spirit.vy + Math.cos(this.time * 0.35 + spirit.phase) * 0.18;
      
      if (spirit.x < -spirit.radius) spirit.x = w + spirit.radius;
      if (spirit.x > w + spirit.radius) spirit.x = -spirit.radius;
      if (spirit.y < -spirit.radius) spirit.y = h + spirit.radius;
      if (spirit.y > h + spirit.radius) spirit.y = -spirit.radius;

      const pulse = 0.8 + Math.sin(this.time * 2 + spirit.phase) * 0.2;
      const radius = spirit.radius * pulse;
      
      // Multiple glow layers
      const outerGlow = this.ctx.createRadialGradient(spirit.x, spirit.y, 0, spirit.x, spirit.y, radius * 3);
      outerGlow.addColorStop(0, `hsla(${spirit.hue}, 80%, 60%, 0.2)`);
      outerGlow.addColorStop(0.5, `hsla(${spirit.hue}, 70%, 50%, 0.08)`);
      outerGlow.addColorStop(1, 'transparent');
      this.ctx.fillStyle = outerGlow;
      this.ctx.beginPath();
      this.ctx.arc(spirit.x, spirit.y, radius * 3, 0, Math.PI * 2);
      this.ctx.fill();

      const innerGlow = this.ctx.createRadialGradient(spirit.x, spirit.y, 0, spirit.x, spirit.y, radius * 1.2);
      innerGlow.addColorStop(0, `hsla(${spirit.hue}, 88%, 78%, 0.5)`);
      innerGlow.addColorStop(0.6, `hsla(${spirit.hue}, 78%, 58%, 0.25)`);
      innerGlow.addColorStop(1, 'transparent');
      this.ctx.fillStyle = innerGlow;
      this.ctx.beginPath();
      this.ctx.arc(spirit.x, spirit.y, radius * 1.2, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = `hsla(${spirit.hue}, 95%, 92%, 0.75)`;
      this.ctx.beginPath();
      this.ctx.arc(spirit.x, spirit.y, radius * 0.35, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  private drawRain(w: number, h: number) {
    this.ctx.globalCompositeOperation = 'screen';
    this.rainDrops.forEach((drop) => {
      drop.y += drop.speed;
      if (drop.y > h) {
        drop.y = -drop.length;
        drop.x = Math.random() * w;
      }

      const gradient = this.ctx.createLinearGradient(drop.x, drop.y, drop.x, drop.y + drop.length);
      gradient.addColorStop(0, `rgba(150, 180, 255, ${drop.opacity})`);
      gradient.addColorStop(1, 'transparent');
      
      this.ctx.strokeStyle = gradient;
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(drop.x, drop.y);
      this.ctx.lineTo(drop.x - 2, drop.y + drop.length);
      this.ctx.stroke();
    });
    this.ctx.globalCompositeOperation = 'source-over';
  }

  private drawParticles(w: number, h: number) {
    this.ctx.globalCompositeOperation = 'screen';
    this.particles.forEach((p) => {
      p.x += p.speedX + Math.sin(this.time + p.y * 0.005) * 0.2;
      p.y += p.speedY + Math.cos(this.time * 0.7 + p.x * 0.004) * 0.12;
      
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      const twinkle = 0.7 + Math.sin(this.time * 3 + p.phase) * 0.3;
      const opacity = p.opacity * twinkle;

      const glow = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5);
      glow.addColorStop(0, `hsla(${p.hue}, 92%, 85%, ${opacity})`);
      glow.addColorStop(0.4, `hsla(${p.hue}, 85%, 65%, ${opacity * 0.3})`);
      glow.addColorStop(1, 'transparent');
      this.ctx.fillStyle = glow;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * 5, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = `hsla(${p.hue}, 100%, 95%, ${opacity * 1.1})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalCompositeOperation = 'source-over';
  }

  private drawFireflies(w: number, h: number) {
    this.ctx.globalCompositeOperation = 'screen';
    this.fireflies.forEach((ff) => {
      ff.x += ff.vx + Math.sin(this.time * 2 + ff.brightness * 8) * 0.3;
      ff.y += ff.vy + Math.cos(this.time * 1.5 + ff.brightness * 6) * 0.2;
      ff.brightness += ff.blinkSpeed;
      
      if (ff.x < 0) ff.x = w;
      if (ff.x > w) ff.x = 0;
      if (ff.y < 0) ff.y = h;
      if (ff.y > h) ff.y = 0;

      const glow = Math.sin(ff.brightness) * 0.5 + 0.5;
      const alpha = glow * 0.75;

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
      this.ctx.arc(ff.x, ff.y, ff.size * 0.55, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalCompositeOperation = 'source-over';
  }

  private drawFloatingElements(w: number, h: number) {
    this.ctx.globalCompositeOperation = 'screen';
    this.floatingElements.forEach((el) => {
      el.x += el.vx + Math.sin(this.time * 0.5 + el.phase) * 0.15;
      el.y += el.vy + Math.cos(this.time * 0.4 + el.phase) * 0.1;
      el.rotation += el.rotationSpeed;
      
      if (el.x < -30) el.x = w + 30;
      if (el.x > w + 30) el.x = -30;
      if (el.y < -30) el.y = h + 30;
      if (el.y > h + 30) el.y = -30;

      const pulse = 0.7 + Math.sin(this.time * 2 + el.phase) * 0.3;
      
      this.ctx.save();
      this.ctx.translate(el.x, el.y);
      this.ctx.rotate(el.rotation);
      this.ctx.globalAlpha = el.opacity * pulse;
      this.ctx.font = `${el.size}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(el.symbol, 0, 0);
      this.ctx.restore();
    });
    this.ctx.globalCompositeOperation = 'source-over';
  }

  private drawLumenCharacters(w: number, h: number) {
    this.ctx.globalCompositeOperation = 'screen';
    this.lumens.forEach((lumen) => {
      lumen.x += lumen.vx + Math.sin(this.time * lumen.floatSpeed + lumen.phase) * 0.35;
      lumen.y += lumen.vy + Math.cos(this.time * lumen.floatSpeed * 0.7 + lumen.phase) * 0.22;
      
      if (lumen.x < -40) lumen.x = w + 40;
      if (lumen.x > w + 40) lumen.x = -40;
      if (lumen.y < h * 0.12) lumen.y = h * 0.88;
      if (lumen.y > h * 0.88) lumen.y = h * 0.12;

      const bobY = lumen.y + Math.sin(this.time * 2.2 + lumen.phase) * lumen.bobAmount;
      const pulseAlpha = 0.55 + Math.sin(this.time * 3 + lumen.phase) * 0.3;
      
      const glow = this.ctx.createRadialGradient(lumen.x, bobY, 0, lumen.x, bobY, lumen.size * 2.8);
      glow.addColorStop(0, `hsla(${lumen.hue}, 75%, 68%, ${pulseAlpha})`);
      glow.addColorStop(0.4, `hsla(${lumen.hue}, 65%, 52%, ${pulseAlpha * 0.35})`);
      glow.addColorStop(1, 'transparent');
      this.ctx.fillStyle = glow;
      this.ctx.beginPath();
      this.ctx.arc(lumen.x, bobY, lumen.size * 2.8, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = `hsla(${lumen.hue}, 88%, 78%, ${pulseAlpha + 0.15})`;
      this.ctx.font = `${lumen.size}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(lumen.label, lumen.x, bobY);
    });
    this.ctx.globalCompositeOperation = 'source-over';
  }

  private drawGearSilhouettes(w: number, h: number) {
    const base = h * 0.88;
    this.ctx.fillStyle = 'rgba(18, 14, 38, 0.92)';
    this.ctx.strokeStyle = 'rgba(50, 42, 82, 0.95)';
    this.ctx.lineWidth = 3;

    // Camera tripod
    const tx = w * 0.05;
    this.ctx.beginPath();
    this.ctx.moveTo(tx, base);
    this.ctx.lineTo(tx - 30, h + 5);
    this.ctx.moveTo(tx, base);
    this.ctx.lineTo(tx + 35, h + 5);
    this.ctx.moveTo(tx, base);
    this.ctx.lineTo(tx, h + 3);
    this.ctx.stroke();

    const camY = base - 100;
    this.ctx.fillStyle = 'rgba(18, 14, 38, 0.95)';
    this.ctx.fillRect(tx - 42, camY, 84, 58);
    this.ctx.beginPath();
    this.ctx.arc(tx + 46, camY + 29, 24, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = 'rgba(24, 20, 48, 0.95)';
    this.ctx.beginPath();
    this.ctx.arc(tx + 52, camY + 29, 14, 0, Math.PI * 2);
    this.ctx.fill();

    // Mixer/Speaker
    const sx = w * 0.9;
    this.ctx.fillStyle = 'rgba(18, 14, 38, 0.92)';
    this.ctx.fillRect(sx - 45, base - 130, 90, 135);
    this.ctx.strokeStyle = 'rgba(50, 42, 82, 0.92)';
    this.ctx.strokeRect(sx - 45, base - 130, 90, 135);
    for (let i = 0; i < 5; i++) {
      this.ctx.fillStyle = 'rgba(12, 10, 28, 0.92)';
      this.ctx.fillRect(sx - 36, base - 120 + i * 24, 72, 18);
    }

    // Light panel
    const px = w * 0.73;
    this.ctx.fillStyle = 'rgba(16, 12, 34, 0.92)';
    this.ctx.fillRect(px - 3, base - 150, 8, 150);
    this.ctx.fillStyle = 'rgba(200, 220, 250, 0.18)';
    this.ctx.fillRect(px - 52, base - 145, 104, 78);
    this.ctx.strokeStyle = 'rgba(80, 70, 120, 0.88)';
    this.ctx.strokeRect(px - 52, base - 145, 104, 78);

    const ledPulse = 0.7 + Math.sin(this.time * 2.8) * 0.3;
    this.ctx.fillStyle = `rgba(160, 200, 255, ${0.1 * ledPulse})`;
    this.ctx.fillRect(px - 50, base - 142, 100, 22);

    // Foreground curve
    this.ctx.strokeStyle = 'rgba(40, 36, 70, 0.78)';
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();
    this.ctx.moveTo(w * 0.12, base + 10);
    this.ctx.bezierCurveTo(w * 0.35, base - 25, w * 0.5, base + 35, w * 0.8, base + 8);
    this.ctx.stroke();
  }

  private drawMascot(w: number, h: number) {
    const cx = w * 0.14;
    const cy = h * 0.73;
    const bounce = Math.sin(this.time * 5.2) * 7;
    const squash = 1 + Math.sin(this.time * 5.2 + 0.4) * 0.065;

    this.ctx.save();
    this.ctx.translate(cx, cy + bounce);
    this.ctx.scale(1, squash);

    const bodyW = 85;
    const bodyH = 70;
    const bx = -bodyW / 2;
    const by = -bodyH / 2;

    // Shadow
    this.ctx.fillStyle = 'rgba(0,0,0,0.38)';
    this.ctx.beginPath();
    this.ctx.ellipse(5, bodyH * 0.52, 45, 12, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Body
    this.roundRect2(bx, by, bodyW, bodyH, 20, '#dc2626');
    this.roundRect2(bx + 5, by + 8, bodyW - 10, bodyH - 22, 15, '#ef4444');

    // Highlight
    this.ctx.fillStyle = 'rgba(255,255,255,0.38)';
    this.ctx.beginPath();
    this.ctx.ellipse(bx + 22, by + 18, 18, 10, -0.4, 0, Math.PI * 2);
    this.ctx.fill();

    // Eyes
    const eyeY = by + 20;
    this.ctx.fillStyle = '#fff';
    this.ctx.beginPath();
    this.ctx.arc(bx + 26, eyeY, 13, 0, Math.PI * 2);
    this.ctx.arc(bx + 59, eyeY, 13, 0, Math.PI * 2);
    this.ctx.fill();

    const look = Math.sin(this.time * 2.2) * 2.2;
    this.ctx.fillStyle = '#0a0a12';
    this.ctx.beginPath();
    this.ctx.arc(bx + 28 + look, eyeY + 1, 6, 0, Math.PI * 2);
    this.ctx.arc(bx + 61 + look, eyeY + 1, 6, 0, Math.PI * 2);
    this.ctx.fill();

    // Feet
    this.ctx.fillStyle = '#b91c1c';
    this.ctx.fillRect(bx + 16, by + bodyH - 6, 20, 26);
    this.ctx.fillRect(bx + 49, by + bodyH - 6, 20, 26);

    // Arms
    const armSwing = Math.sin(this.time * 4.2) * 0.14;
    this.ctx.save();
    this.ctx.translate(bx + bodyW - 4, by + 32);
    this.ctx.rotate(armSwing);
    this.ctx.fillStyle = '#ef4444';
    this.ctx.fillRect(0, -8, 44, 16);
    this.ctx.fillStyle = '#1f1f2e';
    this.ctx.fillRect(40, -14, 14, 36);
    this.ctx.fillStyle = '#333';
    this.ctx.beginPath();
    this.ctx.arc(47, 22, 11, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = 'rgba(255,255,255,0.22)';
    this.ctx.beginPath();
    this.ctx.arc(44, 17, 4, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();

    this.ctx.restore();
  }

  private drawMascotSidekick(w: number, h: number) {
    const cx = w * 0.84;
    const cy = h * 0.72;
    const bounce = Math.sin(this.time * 4.5 + 1.2) * 5.5;
    const squash = 1 + Math.sin(this.time * 4.5 + 1.7) * 0.055;

    this.ctx.save();
    this.ctx.translate(cx, cy + bounce);
    this.ctx.scale(1, squash);

    const bodyW = 70;
    const bodyH = 60;
    const bx = -bodyW / 2;
    const by = -bodyH / 2;

    // Shadow
    this.ctx.fillStyle = 'rgba(0,0,0,0.32)';
    this.ctx.beginPath();
    this.ctx.ellipse(3, bodyH * 0.56, 36, 11, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Boom mic
    const boomAngle = -0.88 + Math.sin(this.time * 3.2) * 0.07;
    this.ctx.save();
    this.ctx.rotate(boomAngle);
    this.ctx.fillStyle = 'rgba(40, 36, 55, 0.96)';
    this.ctx.fillRect(-140, -5, 138, 10);
    this.ctx.fillStyle = 'rgba(68, 64, 88, 0.92)';
    this.ctx.fillRect(-145, -8, 16, 16);
    this.ctx.restore();

    // Body
    this.roundRect2(bx, by, bodyW, bodyH, 18, '#0d9488');
    this.roundRect2(bx + 4, by + 7, bodyW - 8, bodyH - 20, 14, '#14b8a6');

    // Highlight
    this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(bx + 20, by + 16, 14, 8, -0.35, 0, Math.PI * 2);
    this.ctx.fill();

    // Headphones
    this.ctx.strokeStyle = 'rgba(12, 20, 40, 0.96)';
    this.ctx.lineWidth = 5.5;
    this.ctx.beginPath();
    this.ctx.arc(bx + bodyW * 0.5, by + 8, 26, Math.PI * 1.05, Math.PI * 1.95);
    this.ctx.stroke();
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(bx + 4, by - 2, 16, 20);
    this.ctx.fillRect(bx + bodyW - 20, by - 2, 16, 20);

    // Eyes
    const eyeY = by + 24;
    this.ctx.fillStyle = '#fff';
    this.ctx.beginPath();
    this.ctx.arc(bx + 22, eyeY, 10, 0, Math.PI * 2);
    this.ctx.arc(bx + 48, eyeY, 10, 0, Math.PI * 2);
    this.ctx.fill();
    const look = Math.sin(this.time * 2.3 + 0.8) * 1.6;
    this.ctx.fillStyle = '#0f172a';
    this.ctx.beginPath();
    this.ctx.arc(bx + 23 + look, eyeY + 1, 4.5, 0, Math.PI * 2);
    this.ctx.arc(bx + 49 + look, eyeY + 1, 4.5, 0, Math.PI * 2);
    this.ctx.fill();

    // Feet
    this.ctx.fillStyle = '#0f766e';
    this.ctx.fillRect(bx + 15, by + bodyH - 5, 17, 22);
    this.ctx.fillRect(bx + 39, by + bodyH - 5, 17, 22);

    this.ctx.restore();
  }

  private drawForegroundGlow(w: number, h: number) {
    // Bottom warm glow
    const bottomGlow = this.ctx.createRadialGradient(w * 0.5, h, 0, w * 0.5, h * 0.55, h * 0.75);
    bottomGlow.addColorStop(0, 'hsla(280, 45%, 30%, 0.14)');
    bottomGlow.addColorStop(0.4, 'hsla(240, 40%, 25%, 0.07)');
    bottomGlow.addColorStop(1, 'transparent');
    this.ctx.fillStyle = bottomGlow;
    this.ctx.fillRect(0, 0, w, h);

    // Left cool glow
    const leftGlow = this.ctx.createRadialGradient(0, h * 0.55, 0, 0, h * 0.55, h * 0.75);
    leftGlow.addColorStop(0, 'hsla(200, 45%, 32%, 0.1)');
    leftGlow.addColorStop(1, 'transparent');
    this.ctx.fillStyle = leftGlow;
    this.ctx.fillRect(0, 0, w * 0.35, h);

    // Right accent glow
    const rightGlow = this.ctx.createRadialGradient(w, h * 0.35, 0, w, h * 0.35, h * 0.65);
    rightGlow.addColorStop(0, 'hsla(160, 40%, 28%, 0.08)');
    rightGlow.addColorStop(1, 'transparent');
    this.ctx.fillStyle = rightGlow;
    this.ctx.fillRect(w * 0.65, 0, w * 0.35, h);

    // Subtle vignette
    const vignette = this.ctx.createRadialGradient(w * 0.5, h * 0.4, Math.min(w, h) * 0.3, w * 0.5, h * 0.5, Math.max(w, h) * 0.8);
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(0.6, 'rgba(0,0,0,0.04)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.15)');
    this.ctx.fillStyle = vignette;
    this.ctx.fillRect(0, 0, w, h);
  }

  private roundRect2(x: number, y: number, w: number, h: number, r: number, fill: string) {
    this.ctx.fillStyle = fill;
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.arcTo(x + w, y, x + w, y + h, r);
    this.ctx.arcTo(x + w, y + h, x, y + h, r);
    this.ctx.arcTo(x, y + h, x, y, r);
    this.ctx.arcTo(x, y, x + w, y, r);
    this.ctx.closePath();
    this.ctx.fill();
  }
}

// Interfaces
interface Particle {
  x: number; y: number; size: number;
  speedX: number; speedY: number;
  opacity: number; hue: number; phase: number;
}

interface Firefly {
  x: number; y: number; vx: number; vy: number;
  size: number; brightness: number; blinkSpeed: number; hue: number;
}

interface Spirit {
  x: number; y: number; radius: number;
  vx: number; vy: number; hue: number;
  phase: number; pulseSpeed: number;
}

interface LightBeam {
  originX: number; originY: number;
  angle: number; spread: number; hue: number; speed: number;
}

interface Cloud {
  x: number; y: number; width: number;
  speed: number; opacity: number;
}

interface Star {
  x: number; y: number; size: number;
  twinkleSpeed: number; twinklePhase: number; brightness: number;
}

interface RainDrop {
  x: number; y: number; speed: number;
  length: number; opacity: number;
}

interface Lumen {
  type: string; hue: number; label: string;
  x: number; y: number; vx: number; vy: number;
  size: number; phase: number; floatSpeed: number; bobAmount: number;
}

interface FloatingElement {
  x: number; y: number; vx: number; vy: number;
  symbol: string; size: number;
  rotation: number; rotationSpeed: number; opacity: number; phase: number;
}
