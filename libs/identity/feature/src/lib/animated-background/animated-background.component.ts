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

  /** Parallax -1..1 objetivo / suavizado (sigue al puntero). */
  private parallaxTgX = 0;
  private parallaxTgY = 0;
  private parallaxSmX = 0;
  private parallaxSmY = 0;

  // All animation elements
  private particles: Particle[] = [];
  private fireflies: Firefly[] = [];
  private spirits: Spirit[] = [];
  private lightBeams: LightBeam[] = [];
  private clouds: Cloud[] = [];
  private stars: Star[] = [];
  /** Solo iconografía AV; opacidad pulsada y símbolo que rota al pasar por el “vacío”. */
  private ephemeralGlyphs: EphemeralGlyph[] = [];
  /** Lumens con halo (solo pool AV). */
  private avLumens: AvLumen[] = [];
  private tinyPals: TinyPal[] = [];

  /** Pool audiovisual (sin logística / ERP genérico). */
  private readonly avSymbolPool = [
    '🎬',
    '🎥',
    '🎞️',
    '📽️',
    '🎤',
    '🎧',
    '📹',
    '📷',
    '🎭',
    '🍿',
    '✨',
    '💡',
    '🎙️',
    '📼',
    '🎚️',
  ];

  private readonly crewPhrases = [
    '¡Hola!',
    'ROLL 🎬',
    'QUIETO',
    'ACTION!',
    'JOSANZ',
    'TIC… TAC',
    '¡PLATÓ!',
    'STUDIO',
  ];

  private readonly boundResize = () => this.resizeCanvas();
  private readonly boundPointerMove = (e: PointerEvent) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (w < 1 || h < 1) return;
    this.parallaxTgX = (e.clientX / w) * 2 - 1;
    this.parallaxTgY = (e.clientY / h) * 2 - 1;
  };
  private readonly boundPointerLeave = () => {
    this.parallaxTgX = 0;
    this.parallaxTgY = 0;
  };

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.ctx = ctx;
    this.resizeCanvas();
    window.addEventListener('resize', this.boundResize);
    window.addEventListener('pointermove', this.boundPointerMove, { passive: true });
    window.addEventListener('pointerleave', this.boundPointerLeave);
    this.initAllElements();
    this.animate();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.boundResize);
    window.removeEventListener('pointermove', this.boundPointerMove);
    window.removeEventListener('pointerleave', this.boundPointerLeave);
  }

  private smoothParallax(): void {
    const k = 0.085;
    this.parallaxSmX += (this.parallaxTgX - this.parallaxSmX) * k;
    this.parallaxSmY += (this.parallaxTgY - this.parallaxSmY) * k;
  }

  /** Capas: fondo mueve poco, primer plano más (efecto profundidad). */
  private shiftBack(w: number, h: number): { x: number; y: number } {
    const m = Math.min(w, h) * 0.02;
    return { x: this.parallaxSmX * m, y: this.parallaxSmY * m };
  }

  private shiftMid(w: number, h: number): { x: number; y: number } {
    const m = Math.min(w, h) * 0.036;
    return { x: this.parallaxSmX * m, y: this.parallaxSmY * m };
  }

  private shiftFront(w: number, h: number): { x: number; y: number } {
    const m = Math.min(w, h) * 0.052;
    return { x: this.parallaxSmX * m, y: this.parallaxSmY * m };
  }

  private shiftNear(w: number, h: number): { x: number; y: number } {
    const m = Math.min(w, h) * 0.028;
    return { x: this.parallaxSmX * m, y: this.parallaxSmY * m };
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

    // === STARS ===
    const starCount = 52;
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.5,
        size: Math.random() * 1.8 + 0.4,
        twinkleSpeed: Math.random() * 0.025 + 0.008,
        twinklePhase: Math.random() * Math.PI * 2,
        brightness: Math.random() * 0.42 + 0.22,
      });
    }

    // === PARTICLES ===
    const particleCount = 72;
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2 + 0.4,
        speedX: (Math.random() - 0.5) * 0.28,
        speedY: (Math.random() - 0.5) * 0.18,
        opacity: Math.random() * 0.35 + 0.12,
        hue: Math.random() > 0.5 ? 42 + Math.random() * 28 : 195 + Math.random() * 35,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // === FIREFLIES ===
    const fireflyCount = 17;
    for (let i = 0; i < fireflyCount; i++) {
      this.fireflies.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.8,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.32,
        size: Math.random() * 2.8 + 1.2,
        brightness: Math.random(),
        blinkSpeed: Math.random() * 0.04 + 0.018,
        hue: 48 + Math.random() * 22,
      });
    }

    // === SPIRITS ===
    const spiritCount = 8;
    for (let i = 0; i < spiritCount; i++) {
      this.spirits.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: Math.random() * 38 + 22,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.16,
        hue: i % 3 === 0 ? 48 + Math.random() * 18 : i % 3 === 1 ? 205 + Math.random() * 25 : 265 + Math.random() * 18,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.018 + 0.008,
      });
    }

    // === LIGHT BEAMS ===
    this.lightBeams = [
      { originX: 0.1, originY: -0.04, angle: 0.4, spread: 0.48, hue: 48, speed: 0.3 },
      { originX: 0.9, originY: 0, angle: -0.36, spread: 0.46, hue: 205, speed: -0.28 },
      { originX: 0.52, originY: -0.08, angle: 0.05, spread: 0.52, hue: 200, speed: 0.2 },
      { originX: 0.32, originY: -0.02, angle: 0.28, spread: 0.38, hue: 175, speed: 0.36 },
    ];

    // === CLOUDS ===
    const cloudCount = 7;
    for (let i = 0; i < cloudCount; i++) {
      this.clouds.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.32,
        width: Math.random() * 200 + 100,
        speed: Math.random() * 0.12 + 0.025,
        opacity: Math.random() * 0.11 + 0.025,
      });
    }

    // === GLIFOS EFÍMEROS AV ===
    const glyphCount = 21;
    for (let i = 0; i < glyphCount; i++) {
      this.ephemeralGlyphs.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.22,
        symbol: this.avSymbolPool[Math.floor(Math.random() * this.avSymbolPool.length)],
        size: Math.random() * 12 + 15,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.012,
        phase: Math.random() * Math.PI * 2,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.28 + Math.random() * 0.4,
        swapLock: false,
      });
    }

    // === LUMENS AV (halo + emoji, sin iconos ERP) ===
    const lumenCount = 16;
    const lumenHues = [42, 52, 195, 210, 265, 175, 310, 125];
    for (let i = 0; i < lumenCount; i++) {
      const label = this.avSymbolPool[Math.floor(Math.random() * this.avSymbolPool.length)];
      this.avLumens.push({
        label,
        hue: lumenHues[i % lumenHues.length] + Math.random() * 20,
        x: Math.random() * w,
        y: Math.random() * h * 0.62 + h * 0.12,
        vx: (Math.random() - 0.5) * 0.72,
        vy: (Math.random() - 0.5) * 0.48,
        size: 15 + Math.random() * 14,
        phase: Math.random() * Math.PI * 2,
        floatSpeed: 0.38 + Math.random() * 0.42,
        bobAmount: 11 + Math.random() * 14,
      });
    }

    // === Mini crew plató ===
    const palHues = [195, 210, 175, 265, 40, 220, 155, 48, 300, 185];
    const palCount = 10;
    for (let i = 0; i < palCount; i++) {
      this.tinyPals.push({
        x: (w / (palCount + 1)) * (i + 1) + (Math.random() - 0.5) * 36,
        baseY: h * 0.83 + Math.random() * h * 0.055,
        vx: (Math.random() - 0.5) * 0.2,
        hue: palHues[i % palHues.length] + Math.random() * 12,
        phase: Math.random() * Math.PI * 2,
        r: 7.5 + Math.random() * 5.5,
        kind: i % 4,
      });
    }
  }

  private animate = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.time += 0.016;
    this.smoothParallax();
    this.ctx.clearRect(0, 0, w, h);

    // Draw everything in layers (back to front)
    this.drawSky(w, h);
    this.drawStars(w, h);
    this.drawAurora(w, h);
    this.drawClouds(w, h);
    this.drawLightBeams(w, h);
    this.drawSpirits(w, h);
    this.drawParticles(w, h);
    this.drawFireflies(w, h);
    this.drawEphemeralGlyphs(w, h);
    this.drawAvLumens(w, h);
    this.drawGearSilhouettes(w, h);
    this.drawTinyPals(w, h);
    this.drawMascot(w, h);
    this.drawMascotSidekick(w, h);
    this.drawCrewSpeech(w, h);
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
    const s = this.shiftBack(w, h);
    this.stars.forEach((star) => {
      const sx = star.x + s.x;
      const sy = star.y + s.y;
      const twinkle = Math.sin(this.time * star.twinkleSpeed * 60 + star.twinklePhase);
      const alpha = star.brightness * (0.5 + twinkle * 0.5);

      const gradient = this.ctx.createRadialGradient(sx, sy, 0, sx, sy, star.size * 2);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      gradient.addColorStop(0.5, `rgba(200, 220, 255, ${alpha * 0.5})`);
      gradient.addColorStop(1, 'transparent');

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(sx, sy, star.size * 2, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  private drawAurora(w: number, h: number) {
    const t = this.time * 0.15;
    const p = this.shiftBack(w, h);
    const oy = p.y * 0.65;

    // Aurora wave 1
    this.ctx.beginPath();
    this.ctx.moveTo(0, h * 0.15 + oy);
    for (let x = 0; x <= w; x += 20) {
      const y =
        h * 0.15 +
        oy +
        Math.sin(x * 0.005 + t + p.x * 0.002) * 30 +
        Math.sin(x * 0.01 + t * 0.7) * 15;
      this.ctx.lineTo(x + p.x * 0.35, y);
    }
    this.ctx.lineTo(w + p.x * 0.35, h * 0.3 + oy);
    this.ctx.lineTo(0, h * 0.3 + oy);
    this.ctx.closePath();

    const auroraGrad1 = this.ctx.createLinearGradient(0, h * 0.1 + oy, 0, h * 0.35 + oy);
    auroraGrad1.addColorStop(0, 'hsla(160, 70%, 50%, 0.12)');
    auroraGrad1.addColorStop(0.5, 'hsla(200, 60%, 45%, 0.085)');
    auroraGrad1.addColorStop(1, 'transparent');
    this.ctx.fillStyle = auroraGrad1;
    this.ctx.fill();

    // Aurora wave 2
    this.ctx.beginPath();
    this.ctx.moveTo(0, h * 0.2 + oy);
    for (let x = 0; x <= w; x += 20) {
      const y =
        h * 0.2 +
        oy +
        Math.sin(x * 0.006 + t + 2 + p.x * 0.0015) * 25 +
        Math.sin(x * 0.012 + t * 0.6) * 12;
      this.ctx.lineTo(x + p.x * 0.28, y);
    }
    this.ctx.lineTo(w + p.x * 0.28, h * 0.35 + oy);
    this.ctx.lineTo(0, h * 0.35 + oy);
    this.ctx.closePath();

    const auroraGrad2 = this.ctx.createLinearGradient(0, h * 0.15 + oy, 0, h * 0.4 + oy);
    auroraGrad2.addColorStop(0, 'hsla(260, 55%, 45%, 0.095)');
    auroraGrad2.addColorStop(0.5, 'hsla(300, 50%, 40%, 0.065)');
    auroraGrad2.addColorStop(1, 'transparent');
    this.ctx.fillStyle = auroraGrad2;
    this.ctx.fill();
  }

  private drawClouds(w: number, h: number) {
    const s = this.shiftMid(w, h);
    this.clouds.forEach((cloud) => {
      cloud.x += cloud.speed;
      if (cloud.x > w + cloud.width) cloud.x = -cloud.width;

      const cx = cloud.x + s.x;
      const cy = cloud.y + s.y;

      const gradient = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, cloud.width);
      gradient.addColorStop(0, `rgba(120, 150, 200, ${cloud.opacity})`);
      gradient.addColorStop(0.4, `rgba(90, 120, 180, ${cloud.opacity * 0.4})`);
      gradient.addColorStop(1, 'transparent');

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy, cloud.width, cloud.width * 0.2, 0, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = `rgba(100, 130, 190, ${cloud.opacity * 0.5})`;
      this.ctx.beginPath();
      this.ctx.ellipse(cx - cloud.width * 0.3, cy + 10, cloud.width * 0.5, cloud.width * 0.15, 0, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  private drawLightBeams(w: number, h: number) {
    const s = this.shiftMid(w, h);
    this.lightBeams.forEach((beam, i) => {
      const sway = Math.sin(this.time * beam.speed + i * 1.5) * 0.15;
      const ox = beam.originX * w + s.x * (0.85 + i * 0.05);
      const oy = beam.originY * h + s.y * (0.75 + i * 0.04);
      const angle = beam.angle + sway;
      const len = Math.hypot(w, h) * 1.25;

      this.ctx.save();
      this.ctx.translate(ox, oy);
      this.ctx.rotate(angle);

      const flicker = 0.9 + Math.sin(this.time * 2.5 + i) * 0.1;
      const a = (0.32 + Math.sin(this.time * 2.2 + i) * 0.08) * flicker * 0.64;
      
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
      spot.addColorStop(0, `hsla(${beam.hue}, 100%, 98%, 0.78)`);
      spot.addColorStop(0.12, `hsla(${beam.hue}, 95%, 82%, 0.5)`);
      spot.addColorStop(0.35, `hsla(${beam.hue}, 88%, 58%, 0.2)`);
      spot.addColorStop(1, 'transparent');
      this.ctx.fillStyle = spot;
      this.ctx.beginPath();
      this.ctx.arc(ox, oy, spotR, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  private drawSpirits(w: number, h: number) {
    const s = this.shiftMid(w, h);
    this.spirits.forEach((spirit) => {
      spirit.x += spirit.vx + Math.sin(this.time * 0.5 + spirit.phase) * 0.25;
      spirit.y += spirit.vy + Math.cos(this.time * 0.35 + spirit.phase) * 0.18;

      if (spirit.x < -spirit.radius) spirit.x = w + spirit.radius;
      if (spirit.x > w + spirit.radius) spirit.x = -spirit.radius;
      if (spirit.y < -spirit.radius) spirit.y = h + spirit.radius;
      if (spirit.y > h + spirit.radius) spirit.y = -spirit.radius;

      const sx = spirit.x + s.x;
      const sy = spirit.y + s.y;
      const pulse = 0.8 + Math.sin(this.time * 2 + spirit.phase) * 0.2;
      const radius = spirit.radius * pulse;

      const outerGlow = this.ctx.createRadialGradient(sx, sy, 0, sx, sy, radius * 2.4);
      outerGlow.addColorStop(0, `hsla(${spirit.hue}, 80%, 60%, 0.17)`);
      outerGlow.addColorStop(0.5, `hsla(${spirit.hue}, 70%, 50%, 0.08)`);
      outerGlow.addColorStop(1, 'transparent');
      this.ctx.fillStyle = outerGlow;
      this.ctx.beginPath();
      this.ctx.arc(sx, sy, radius * 2.4, 0, Math.PI * 2);
      this.ctx.fill();

      const innerGlow = this.ctx.createRadialGradient(sx, sy, 0, sx, sy, radius * 1.2);
      innerGlow.addColorStop(0, `hsla(${spirit.hue}, 88%, 78%, 0.55)`);
      innerGlow.addColorStop(0.6, `hsla(${spirit.hue}, 78%, 58%, 0.28)`);
      innerGlow.addColorStop(1, 'transparent');
      this.ctx.fillStyle = innerGlow;
      this.ctx.beginPath();
      this.ctx.arc(sx, sy, radius * 1.2, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = `hsla(${spirit.hue}, 95%, 92%, 0.78)`;
      this.ctx.beginPath();
      this.ctx.arc(sx, sy, radius * 0.35, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  private drawParticles(w: number, h: number) {
    const s = this.shiftFront(w, h);
    this.ctx.globalCompositeOperation = 'screen';
    this.particles.forEach((p) => {
      p.x += p.speedX + Math.sin(this.time + p.y * 0.005) * 0.2;
      p.y += p.speedY + Math.cos(this.time * 0.7 + p.x * 0.004) * 0.12;

      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      const px = p.x + s.x;
      const py = p.y + s.y;
      const twinkle = 0.65 + Math.sin(this.time * 3 + p.phase) * 0.28;
      const opacity = p.opacity * twinkle * 0.78;

      const glow = this.ctx.createRadialGradient(px, py, 0, px, py, p.size * 5);
      glow.addColorStop(0, `hsla(${p.hue}, 92%, 85%, ${opacity})`);
      glow.addColorStop(0.4, `hsla(${p.hue}, 85%, 65%, ${opacity * 0.3})`);
      glow.addColorStop(1, 'transparent');
      this.ctx.fillStyle = glow;
      this.ctx.beginPath();
      this.ctx.arc(px, py, p.size * 5, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = `hsla(${p.hue}, 100%, 95%, ${opacity * 1.1})`;
      this.ctx.beginPath();
      this.ctx.arc(px, py, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalCompositeOperation = 'source-over';
  }

  private drawFireflies(w: number, h: number) {
    const s = this.shiftFront(w, h);
    this.ctx.globalCompositeOperation = 'screen';
    this.fireflies.forEach((ff) => {
      ff.x += ff.vx + Math.sin(this.time * 2 + ff.brightness * 8) * 0.3;
      ff.y += ff.vy + Math.cos(this.time * 1.5 + ff.brightness * 6) * 0.2;
      ff.brightness += ff.blinkSpeed;

      if (ff.x < 0) ff.x = w;
      if (ff.x > w) ff.x = 0;
      if (ff.y < 0) ff.y = h;
      if (ff.y > h) ff.y = 0;

      const fx = ff.x + s.x;
      const fy = ff.y + s.y;
      const glow = Math.sin(ff.brightness) * 0.5 + 0.5;
      const alpha = glow * 0.58;

      const gradient = this.ctx.createRadialGradient(fx, fy, 0, fx, fy, ff.size * 4);
      gradient.addColorStop(0, `hsla(${ff.hue}, 100%, 90%, ${alpha})`);
      gradient.addColorStop(0.3, `hsla(${ff.hue}, 95%, 70%, ${alpha * 0.5})`);
      gradient.addColorStop(1, 'transparent');
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(fx, fy, ff.size * 4, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = `hsla(${ff.hue}, 100%, 98%, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(fx, fy, ff.size * 0.55, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalCompositeOperation = 'source-over';
  }

  private drawEphemeralGlyphs(w: number, h: number) {
    const s = this.shiftFront(w, h);
    this.ctx.globalCompositeOperation = 'screen';
    this.ephemeralGlyphs.forEach((g) => {
      g.x += g.vx + Math.sin(this.time * 0.38 + g.phase) * 0.1;
      g.y += g.vy + Math.cos(this.time * 0.32 + g.phase) * 0.08;
      g.rotation += g.rotSpeed;

      if (g.x < -40) g.x = w + 40;
      if (g.x > w + 40) g.x = -40;
      if (g.y < -40) g.y = h + 40;
      if (g.y > h + 40) g.y = -40;

      g.pulsePhase += 0.018 * g.pulseSpeed;
      const wave = Math.sin(g.pulsePhase);
      const alpha = 0.07 + 0.4 * wave * wave;

      if (wave < -0.82 && !g.swapLock) {
        g.symbol = this.avSymbolPool[Math.floor(Math.random() * this.avSymbolPool.length)];
        g.swapLock = true;
      }
      if (wave > 0.15) {
        g.swapLock = false;
      }

      this.ctx.save();
      this.ctx.translate(g.x + s.x, g.y + s.y);
      this.ctx.rotate(g.rotation);
      this.ctx.globalAlpha = alpha;
      this.ctx.font = `${g.size}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(g.symbol, 0, 0);
      this.ctx.restore();
    });
    this.ctx.globalCompositeOperation = 'source-over';
  }

  private drawAvLumens(w: number, h: number) {
    const s = this.shiftFront(w, h);
    this.ctx.globalCompositeOperation = 'screen';
    this.avLumens.forEach((lumen) => {
      lumen.x += lumen.vx + Math.sin(this.time * lumen.floatSpeed + lumen.phase) * 0.32;
      lumen.y += lumen.vy + Math.cos(this.time * lumen.floatSpeed * 0.72 + lumen.phase) * 0.2;

      if (lumen.x < -48) lumen.x = w + 48;
      if (lumen.x > w + 48) lumen.x = -48;
      if (lumen.y < h * 0.1) lumen.y = h * 0.9;
      if (lumen.y > h * 0.9) lumen.y = h * 0.1;

      const lx = lumen.x + s.x;
      const ly = lumen.y + s.y;
      const bobY = ly + Math.sin(this.time * 2.05 + lumen.phase) * lumen.bobAmount;
      const pulseAlpha = 0.52 + Math.sin(this.time * 2.65 + lumen.phase) * 0.28;

      const glow = this.ctx.createRadialGradient(lx, bobY, 0, lx, bobY, lumen.size * 3.1);
      glow.addColorStop(0, `hsla(${lumen.hue}, 72%, 66%, ${pulseAlpha * 0.95})`);
      glow.addColorStop(0.38, `hsla(${lumen.hue}, 62%, 52%, ${pulseAlpha * 0.42})`);
      glow.addColorStop(1, 'transparent');
      this.ctx.fillStyle = glow;
      this.ctx.beginPath();
      this.ctx.arc(lx, bobY, lumen.size * 3.1, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = `hsla(${lumen.hue}, 86%, 80%, ${pulseAlpha + 0.12})`;
      this.ctx.font = `${lumen.size}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(lumen.label, lx, bobY);
    });
    this.ctx.globalCompositeOperation = 'source-over';
  }

  private drawGearSilhouettes(w: number, h: number) {
    const sn = this.shiftNear(w, h);
    const base = h * 0.88 + sn.y * 0.55;
    this.ctx.fillStyle = 'rgba(18, 14, 38, 0.92)';
    this.ctx.strokeStyle = 'rgba(50, 42, 82, 0.95)';
    this.ctx.lineWidth = 3;

    // Camera tripod
    const tx = w * 0.05 + sn.x;
    this.ctx.beginPath();
    this.ctx.moveTo(tx, base);
    this.ctx.lineTo(tx - 30, h + 5 + sn.y * 0.2);
    this.ctx.moveTo(tx, base);
    this.ctx.lineTo(tx + 35, h + 5 + sn.y * 0.2);
    this.ctx.moveTo(tx, base);
    this.ctx.lineTo(tx, h + 3 + sn.y * 0.2);
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
    const sx = w * 0.9 + sn.x;
    this.ctx.fillStyle = 'rgba(18, 14, 38, 0.92)';
    this.ctx.fillRect(sx - 45, base - 130, 90, 135);
    this.ctx.strokeStyle = 'rgba(50, 42, 82, 0.92)';
    this.ctx.strokeRect(sx - 45, base - 130, 90, 135);
    for (let i = 0; i < 5; i++) {
      this.ctx.fillStyle = 'rgba(12, 10, 28, 0.92)';
      this.ctx.fillRect(sx - 36, base - 120 + i * 24, 72, 18);
    }

    // Light panel
    const px = w * 0.73 + sn.x;
    this.ctx.fillStyle = 'rgba(16, 12, 34, 0.92)';
    this.ctx.fillRect(px - 3, base - 150, 8, 150);
    this.ctx.fillStyle = 'rgba(200, 220, 250, 0.26)';
    this.ctx.fillRect(px - 52, base - 145, 104, 78);
    this.ctx.strokeStyle = 'rgba(80, 70, 120, 0.88)';
    this.ctx.strokeRect(px - 52, base - 145, 104, 78);

    const ledPulse = 0.7 + Math.sin(this.time * 2.8) * 0.3;
    this.ctx.fillStyle = `rgba(160, 200, 255, ${0.16 * ledPulse})`;
    this.ctx.fillRect(px - 50, base - 142, 100, 22);

    // Foreground curve
    this.ctx.strokeStyle = 'rgba(40, 36, 70, 0.78)';
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();
    this.ctx.moveTo(w * 0.12 + sn.x * 0.4, base + 10);
    this.ctx.bezierCurveTo(
      w * 0.35 + sn.x * 0.35,
      base - 25,
      w * 0.5 + sn.x * 0.3,
      base + 35,
      w * 0.8 + sn.x * 0.35,
      base + 8
    );
    this.ctx.stroke();
  }

  private drawMascot(w: number, h: number) {
    const sn = this.shiftNear(w, h);
    const cx = w * 0.14 + sn.x * 1.14;
    const cy = h * 0.73 + sn.y * 1.06;
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
    const blink = Math.sin(this.time * 2.8) > 0.88;
    if (blink) {
      this.ctx.strokeStyle = '#0a0a12';
      this.ctx.lineWidth = 3;
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(bx + 18, eyeY);
      this.ctx.lineTo(bx + 34, eyeY);
      this.ctx.moveTo(bx + 51, eyeY);
      this.ctx.lineTo(bx + 67, eyeY);
      this.ctx.stroke();
    } else {
      this.ctx.fillStyle = '#0a0a12';
      this.ctx.beginPath();
      this.ctx.arc(bx + 28 + look, eyeY + 1, 6, 0, Math.PI * 2);
      this.ctx.arc(bx + 61 + look, eyeY + 1, 6, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = '#fff';
      this.ctx.beginPath();
      this.ctx.arc(bx + 30 + look, eyeY - 1, 2, 0, Math.PI * 2);
      this.ctx.arc(bx + 63 + look, eyeY - 1, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Smile + rosy cheeks
    this.ctx.strokeStyle = 'rgba(0,0,0,0.38)';
    this.ctx.lineWidth = 2.2;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(bx + 22, by + 36);
    this.ctx.quadraticCurveTo(bx + bodyW * 0.5, by + 52, bx + 63, by + 36);
    this.ctx.stroke();
    this.ctx.fillStyle = 'rgba(255, 120, 140, 0.35)';
    this.ctx.beginPath();
    this.ctx.arc(bx + 14, by + 32, 9, 0, Math.PI * 2);
    this.ctx.arc(bx + 71, by + 32, 9, 0, Math.PI * 2);
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
    const sn = this.shiftNear(w, h);
    const cx = w * 0.84 + sn.x * 1.14;
    const cy = h * 0.72 + sn.y * 1.06;
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
    const blink = Math.sin(this.time * 3.1 + 0.9) > 0.9;
    if (blink) {
      this.ctx.strokeStyle = '#0f172a';
      this.ctx.lineWidth = 2.2;
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(bx + 16, eyeY);
      this.ctx.lineTo(bx + 28, eyeY);
      this.ctx.moveTo(bx + 42, eyeY);
      this.ctx.lineTo(bx + 54, eyeY);
      this.ctx.stroke();
    } else {
      this.ctx.fillStyle = '#0f172a';
      this.ctx.beginPath();
      this.ctx.arc(bx + 23 + look, eyeY + 1, 4.5, 0, Math.PI * 2);
      this.ctx.arc(bx + 49 + look, eyeY + 1, 4.5, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.strokeStyle = 'rgba(15,23,42,0.45)';
    this.ctx.lineWidth = 1.8;
    this.ctx.beginPath();
    this.ctx.arc(bx + bodyW * 0.5, by + 34, 12, 0.2 * Math.PI, 0.8 * Math.PI);
    this.ctx.stroke();

    this.ctx.fillStyle = 'rgba(255, 160, 170, 0.28)';
    this.ctx.beginPath();
    this.ctx.arc(bx + 12, by + 30, 6, 0, Math.PI * 2);
    this.ctx.arc(bx + 58, by + 30, 6, 0, Math.PI * 2);
    this.ctx.fill();

    // Feet
    this.ctx.fillStyle = '#0f766e';
    this.ctx.fillRect(bx + 15, by + bodyH - 5, 17, 22);
    this.ctx.fillRect(bx + 39, by + bodyH - 5, 17, 22);

    this.ctx.restore();
  }

  private drawTinyPals(w: number, h: number) {
    const sn = this.shiftNear(w, h);
    this.tinyPals.forEach((pal) => {
      pal.x += pal.vx;
      if (pal.x < -20) pal.x = w + 20;
      if (pal.x > w + 20) pal.x = -20;

      const y = pal.baseY + Math.sin(this.time * 4.2 + pal.phase) * 11;
      const squash = 1 + Math.sin(this.time * 5 + pal.phase) * 0.08;

      this.ctx.save();
      this.ctx.translate(pal.x + sn.x, y + sn.y * 0.62);
      this.ctx.scale(1, squash);

      const g = this.ctx.createRadialGradient(0, -pal.r * 0.2, 0, 0, 0, pal.r * 1.4);
      g.addColorStop(0, `hsla(${pal.hue}, 78%, 62%, 0.95)`);
      g.addColorStop(0.7, `hsla(${pal.hue}, 65%, 42%, 0.9)`);
      g.addColorStop(1, `hsla(${pal.hue}, 55%, 28%, 0.85)`);
      this.ctx.fillStyle = g;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, pal.r, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();

      // Accesorios de plató (no blobs genéricos)
      if (pal.kind === 1) {
        // Claqueta mini
        this.ctx.fillStyle = 'rgba(20, 18, 32, 0.95)';
        this.ctx.fillRect(-pal.r * 0.55, -pal.r * 1.45, pal.r * 1.1, pal.r * 0.55);
        this.ctx.fillStyle = 'hsla(48, 92%, 58%, 0.95)';
        this.ctx.fillRect(-pal.r * 0.55, -pal.r * 1.45, pal.r * 1.1, pal.r * 0.22);
        this.ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(-pal.r * 0.55, -pal.r * 1.45, pal.r * 1.1, pal.r * 0.55);
      } else if (pal.kind === 2) {
        // Aro objetivo / lente
        this.ctx.strokeStyle = 'rgba(255,255,255,0.55)';
        this.ctx.lineWidth = 2.2;
        this.ctx.beginPath();
        this.ctx.arc(0, -pal.r * 0.85, pal.r * 0.65, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.fillStyle = 'rgba(30, 40, 60, 0.85)';
        this.ctx.beginPath();
        this.ctx.arc(0, -pal.r * 0.85, pal.r * 0.28, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (pal.kind === 3) {
        // Perforaciones tipo celuloide
        for (let k = -2; k <= 2; k++) {
          this.ctx.fillStyle = 'rgba(255,255,255,0.35)';
          this.ctx.fillRect(k * pal.r * 0.35 - 1.5, -pal.r * 1.35, 3, 5);
        }
      } else {
        // kind 0: pértiga / boom
        this.ctx.strokeStyle = 'rgba(255,255,255,0.45)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -pal.r);
        this.ctx.lineTo(pal.r * 1.1, -pal.r * 1.85);
        this.ctx.stroke();
        this.ctx.fillStyle = 'rgba(255,255,255,0.25)';
        this.ctx.beginPath();
        this.ctx.arc(pal.r * 1.1, -pal.r * 1.85, 3, 0, Math.PI * 2);
        this.ctx.fill();
      }

      const eyeY = -pal.r * 0.15;
      const blink = Math.sin(this.time * 3.3 + pal.phase * 2) > 0.91;
      if (blink) {
        this.ctx.strokeStyle = '#0a0a12';
        this.ctx.lineWidth = 1.8;
        this.ctx.beginPath();
        this.ctx.moveTo(-pal.r * 0.45, eyeY);
        this.ctx.lineTo(-pal.r * 0.15, eyeY);
        this.ctx.moveTo(pal.r * 0.15, eyeY);
        this.ctx.lineTo(pal.r * 0.45, eyeY);
        this.ctx.stroke();
      } else {
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(-pal.r * 0.32, eyeY, pal.r * 0.28, 0, Math.PI * 2);
        this.ctx.arc(pal.r * 0.32, eyeY, pal.r * 0.28, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#0a0a12';
        this.ctx.beginPath();
        this.ctx.arc(-pal.r * 0.28, eyeY, pal.r * 0.12, 0, Math.PI * 2);
        this.ctx.arc(pal.r * 0.36, eyeY, pal.r * 0.12, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      this.ctx.lineWidth = 1.2;
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(-pal.r * 0.35, pal.r * 0.35);
      this.ctx.quadraticCurveTo(0, pal.r * 0.62, pal.r * 0.35, pal.r * 0.35);
      this.ctx.stroke();

      this.ctx.restore();
    });
  }

  private drawSpeechBubble(cx: number, cy: number, text: string, fill: string) {
    this.ctx.save();
    this.ctx.font = '700 12px Outfit, "Segoe UI", system-ui, sans-serif';
    const padX = 12;
    const tw = Math.ceil(this.ctx.measureText(text).width) + padX * 2;
    const th = 26;
    const x = cx - tw / 2;
    const y = cy - th;
    const r = 10;

    this.roundRect2(x, y, tw, th, r, fill);
    this.ctx.strokeStyle = 'rgba(255,255,255,0.42)';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.arcTo(x + tw, y, x + tw, y + th, r);
    this.ctx.arcTo(x + tw, y + th, x, y + th, r);
    this.ctx.arcTo(x, y + th, x, y, r);
    this.ctx.arcTo(x, y, x + tw, y, r);
    this.ctx.closePath();
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(cx - 6, y + th);
    this.ctx.lineTo(cx + 6, y + th);
    this.ctx.lineTo(cx, y + th + 9);
    this.ctx.closePath();
    this.ctx.fillStyle = fill;
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = 'rgba(15, 20, 35, 0.92)';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, cx, y + th / 2 + 0.5);
    this.ctx.restore();
  }

  private drawCrewSpeech(w: number, h: number) {
    const sn = this.shiftNear(w, h);
    const bounce1 = Math.sin(this.time * 5.2) * 7;
    const cx1 = w * 0.14 + sn.x * 1.14;
    const cy1 = h * 0.73 + bounce1 + sn.y * 1.06;
    const i1 = Math.floor(this.time / 2.6) % this.crewPhrases.length;
    this.drawSpeechBubble(cx1 + 48, cy1 - 88, this.crewPhrases[i1], 'rgba(255, 248, 252, 0.94)');

    const bounce2 = Math.sin(this.time * 4.5 + 1.2) * 5.5;
    const cx2 = w * 0.84 + sn.x * 1.14;
    const cy2 = h * 0.72 + bounce2 + sn.y * 1.06;
    const i2 = Math.floor(this.time / 3.1 + 2) % this.crewPhrases.length;
    this.drawSpeechBubble(cx2 - 52, cy2 - 82, this.crewPhrases[i2], 'rgba(236, 253, 250, 0.92)');
  }

  private drawForegroundGlow(w: number, h: number) {
    // Bottom warm glow
    const bottomGlow = this.ctx.createRadialGradient(w * 0.5, h, 0, w * 0.5, h * 0.55, h * 0.75);
    bottomGlow.addColorStop(0, 'hsla(280, 45%, 34%, 0.18)');
    bottomGlow.addColorStop(0.4, 'hsla(240, 40%, 28%, 0.09)');
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

interface EphemeralGlyph {
  x: number;
  y: number;
  vx: number;
  vy: number;
  symbol: string;
  size: number;
  rotation: number;
  rotSpeed: number;
  phase: number;
  pulsePhase: number;
  pulseSpeed: number;
  swapLock: boolean;
}

interface AvLumen {
  label: string;
  hue: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  phase: number;
  floatSpeed: number;
  bobAmount: number;
}

interface TinyPal {
  x: number;
  baseY: number;
  vx: number;
  hue: number;
  phase: number;
  r: number;
  kind: number;
}
