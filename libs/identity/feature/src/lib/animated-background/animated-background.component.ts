import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type BackgroundTheme = 'josanz-classic' | 'cyber-neon' | 'golden-vintage' | 'deep-abyss' | 'digital-matrix' | 'audio-rhythm';

@Component({
  selector: 'lib-animated-background',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './animated-background.component.html',
  styleUrl: './animated-background.component.css',
})
export class AnimatedBackgroundComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  /** Current theme of the background */
  @Input() theme: BackgroundTheme = 'josanz-classic';

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

  /** ============================================ */
  /** RAYMAN-INSPIRED EPHEMERAL LUMENS SYSTEM */
  /** ============================================ */
  
  /** Object pool for ephemeral lumens (Rayman-style) */
  private ephemeralLumens: EphemeralLumen[] = [];
  private readonly EPHEMERAL_LUMEN_POOL_SIZE = 28;
  
  /** Particle trail pool for lumens */
  private lumenParticles: LumenParticle[] = [];
  private readonly LUMEN_PARTICLE_POOL_SIZE = 180;
  
  /** Sparkle effects for magical atmosphere */
  private sparkles: Sparkle[] = [];
  private readonly SPARKLE_POOL_SIZE = 45;
  
  /** Ring effects that spawn from lumens */
  private rings: LumenRing[] = [];
  private readonly RING_POOL_SIZE = 20;

  /** NEW ATMOSPHERE ELEMENTS */
  private fogLayers: FogLayer[] = [];
  private shootingStars: ShootingStar[] = [];
  private readonly SHOOTING_STAR_POOL_SIZE = 4;

  /** THEME SPECIFIC COLLECTIONS */
  private matrixCodes: MatrixCode[] = [];
  private soundBars: SoundBar[] = [];

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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['theme'] && !changes['theme'].firstChange) {
      this.initAllElements();
    }
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

  private getThemeConfig(): ThemeConfigInternal {
    const themes: Record<BackgroundTheme, ThemeConfigInternal> = {
      'josanz-classic': {
        style: 'aurora',
        sky: [215, 230, 255, 280],
        aurora: [160, 280, 230],
        particles: [42, 195],
        spirits: [48, 205, 265],
        mascot: { body: '#dc2626', highlight: '#ef4444', feet: '#b91c1c' },
        sidekick: { body: '#0d9488', highlight: '#14b8a6', feet: '#0f766e' },
        fog: [210, 260],
        lumenHues: [42, 52, 195, 210, 265, 175, 310, 125, 45, 85]
      },
      'cyber-neon': {
        style: 'aurora',
        sky: [195, 300, 280, 320],
        aurora: [180, 300, 330],
        particles: [180, 300],
        spirits: [180, 310, 190],
        mascot: { body: '#06b6d4', highlight: '#22d3ee', feet: '#0891b2' },
        sidekick: { body: '#d946ef', highlight: '#f0abfc', feet: '#c026d3' },
        fog: [180, 300],
        lumenHues: [180, 200, 280, 300, 320, 190, 220, 210]
      },
      'golden-vintage': {
        style: 'aurora',
        sky: [35, 45, 55, 25],
        aurora: [40, 50, 45],
        particles: [45, 35],
        spirits: [45, 40, 50],
        mascot: { body: '#d97706', highlight: '#fbbf24', feet: '#b45309' },
        sidekick: { body: '#71717a', highlight: '#a1a1aa', feet: '#52525b' },
        fog: [40, 30],
        lumenHues: [40, 45, 50, 35, 55, 42, 38, 48]
      },
      'deep-abyss': {
        style: 'aurora',
        sky: [200, 210, 220, 230],
        aurora: [170, 190, 210],
        particles: [175, 190],
        spirits: [175, 200, 220],
        mascot: { body: '#1e3a8a', highlight: '#2563eb', feet: '#1e3a8a' },
        sidekick: { body: '#111827', highlight: '#1f2937', feet: '#111827' },
        fog: [200, 180],
        lumenHues: [180, 190, 200, 210, 175, 205, 195, 220]
      },
      'digital-matrix': {
        style: 'matrix',
        sky: [140, 160, 180, 200],
        aurora: [],
        particles: [160, 140],
        spirits: [140, 160],
        mascot: { body: '#10b981', highlight: '#34d399', feet: '#065f46' },
        sidekick: { body: '#047857', highlight: '#10b981', feet: '#064e3b' },
        fog: [140, 120],
        lumenHues: [140, 160, 150, 170]
      },
      'audio-rhythm': {
        style: 'audio',
        sky: [280, 260, 240, 300],
        aurora: [],
        particles: [280, 300],
        spirits: [280, 260],
        mascot: { body: '#8b5cf6', highlight: '#a78bfa', feet: '#5b21b6' },
        sidekick: { body: '#4c1d95', highlight: '#8b5cf6', feet: '#2e1065' },
        fog: [280, 310],
        lumenHues: [280, 300, 320, 260]
      }
    };
    return themes[this.theme] || themes['josanz-classic'];
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
    const cfg = this.getThemeConfig();

    // Reset arrays
    this.stars = [];
    this.particles = [];
    this.fireflies = [];
    this.spirits = [];
    this.clouds = [];
    this.ephemeralGlyphs = [];
    this.avLumens = [];
    this.tinyPals = [];
    this.fogLayers = [];
    this.ephemeralLumens = [];
    this.lumenParticles = [];
    this.sparkles = [];
    this.rings = [];
    this.matrixCodes = [];
    this.soundBars = [];

    if (cfg.style === 'matrix') {
      const columns = Math.floor(w / 25);
      for (let i = 0; i < columns; i++) {
        this.matrixCodes.push({
          x: i * 25,
          y: Math.random() * h,
          speed: 2 + Math.random() * 5,
          chars: Array.from({ length: 15 + Math.floor(Math.random() * 20) }, () => 
            this.avSymbolPool[Math.floor(Math.random() * this.avSymbolPool.length)]
          ),
          opacity: 0.1 + Math.random() * 0.4,
          size: 14 + Math.random() * 8,
        });
      }
    }

    if (cfg.style === 'audio') {
      const barCount = 40;
      const barWidth = w / barCount;
      for (let i = 0; i < barCount; i++) {
        this.soundBars.push({
          x: i * barWidth,
          height: 0,
          targetHeight: 50 + Math.random() * 200,
          width: barWidth - 4,
          hue: cfg.sky[i % cfg.sky.length],
        });
      }
    }

    // === STARS ===
    const starCount = 52;
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.5,
        size: Math.random() * 1.5 + 0.3,
        twinkleSpeed: Math.random() * 0.035 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
        brightness: Math.random() * 0.5 + 0.2,
      });
    }

    // === PARTICLES ===
    const particleCount = 72;
    for (let i = 0; i < particleCount; i++) {
      const hueBase = cfg.particles[i % cfg.particles.length];
      this.particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2 + 0.4,
        speedX: (Math.random() - 0.5) * 0.28,
        speedY: (Math.random() - 0.5) * 0.18,
        opacity: Math.random() * 0.35 + 0.12,
        hue: hueBase + Math.random() * 20,
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
        hue: cfg.particles[0] + Math.random() * 30,
      });
    }

    // === SPIRITS ===
    const spiritCount = 8;
    for (let i = 0; i < spiritCount; i++) {
      const hueBase = cfg.spirits[i % cfg.spirits.length];
      this.spirits.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: Math.random() * 38 + 22,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.16,
        hue: hueBase + Math.random() * 15,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.018 + 0.008,
      });
    }

    // === LIGHT BEAMS ===
    this.lightBeams = [
      { originX: 0.1, originY: -0.04, angle: 0.4, spread: 0.48, hue: cfg.sky[0], speed: 0.3 },
      { originX: 0.9, originY: 0, angle: -0.36, spread: 0.46, hue: cfg.sky[1], speed: -0.28 },
      { originX: 0.52, originY: -0.08, angle: 0.05, spread: 0.52, hue: cfg.sky[2], speed: 0.2 },
      { originX: 0.32, originY: -0.02, angle: 0.28, spread: 0.38, hue: cfg.sky[3], speed: 0.36 },
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
    const lumenHues = cfg.lumenHues;
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

    // === RAYMAN-STYLE EPHEMERAL LUMENS (Object Pool) ===
    this.initEphemeralLumenPool(w, h);
    
    // === LUMEN PARTICLE TRAIL POOL ===
    this.initLumenParticlePool(w, h);
    
    // === SPARKLE POOL ===
    this.initSparklePool(w, h);
    
    // === RING EFFECT POOL ===
    this.initRingPool(w, h);

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

    // === ATMOSPHERIC FOG ===
    const fogCount = 5;
    for (let i = 0; i < fogCount; i++) {
      this.fogLayers.push({
        x: Math.random() * w,
        y: h * (0.6 + Math.random() * 0.4),
        width: w * (1.2 + Math.random() * 0.8),
        height: h * (0.3 + Math.random() * 0.3),
        vx: (Math.random() - 0.5) * 0.15,
        opacity: 0.03 + Math.random() * 0.05,
        hue: i % 2 === 0 ? 210 : 260,
      });
    }

    // === SHOOTING STARS ===
    for (let i = 0; i < this.SHOOTING_STAR_POOL_SIZE; i++) {
      this.shootingStars.push({
        x: 0, y: 0, vx: 0, vy: 0, len: 0, active: false, opacity: 0
      });
    }
  }

  private animate = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cfg = this.getThemeConfig();
    this.time += 0.016;
    this.smoothParallax();
    this.ctx.clearRect(0, 0, w, h);

    // Draw everything in layers (back to front)
    this.drawSky(w, h);
    
    if (cfg.style === 'aurora') {
      this.drawStars(w, h);
      this.drawShootingStars(w, h);
      this.drawAurora(w, h);
      this.drawClouds(w, h);
      this.drawFog(w, h);
      this.drawLightBeams(w, h);
      this.drawSpirits(w, h);
      this.drawParticles(w, h);
      this.drawFireflies(w, h);
      this.drawEphemeralGlyphs(w, h);
      this.drawAvLumens(w, h);
      this.drawEphemeralLumens(w, h);
      this.drawLumenParticles(w, h);
      this.drawSparkles(w, h);
      this.drawRings(w, h);
    } else if (cfg.style === 'matrix') {
      this.drawMatrixStyle(w, h);
    } else if (cfg.style === 'audio') {
      this.drawAudioStyle(w, h);
    }
    
    this.drawGearSilhouettes(w, h);
    this.drawTinyPals(w, h);
    this.drawMascot(w, h);
    this.drawMascotSidekick(w, h);
    this.drawCrewSpeech(w, h);
    this.drawForegroundGlow(w, h);

    this.animationId = requestAnimationFrame(this.animate);
  };

  private drawSky(w: number, h: number) {
    const cfg = this.getThemeConfig();
    const t = this.time * 0.08;
    const g = this.ctx.createLinearGradient(0, 0, 0, h);
    
    // Deeper, more atmospheric colors
    g.addColorStop(0, `hsl(${cfg.sky[0] + Math.sin(t * 0.4) * 12}, 55%, ${28 + Math.sin(t * 0.25) * 6}%)`);
    g.addColorStop(0.35, `hsl(${cfg.sky[1] + Math.sin(t * 0.35) * 8}, 48%, ${18 + Math.sin(t * 0.2) * 5}%)`);
    g.addColorStop(0.6, `hsl(${cfg.sky[2] + Math.sin(t * 0.3) * 6}, 42%, ${12 + Math.sin(t * 0.15) * 4}%)`);
    g.addColorStop(0.85, `hsl(${cfg.sky[3] + Math.sin(t * 0.25) * 5}, 38%, ${8 + Math.sin(t * 0.1) * 3}%)`);
    g.addColorStop(1, this.theme === 'golden-vintage' ? '#1a0d00' : '#05070c');
    
    this.ctx.fillStyle = g;
    this.ctx.fillRect(0, 0, w, h);
  }

  private drawStars(w: number, h: number) {
    const s = this.shiftBack(w, h);
    this.stars.forEach((star) => {
      const sx = star.x + s.x;
      const sy = star.y + s.y;
      const twinkle = Math.sin(this.time * star.twinkleSpeed * 60 + star.twinklePhase);
      const alpha = star.brightness * (0.4 + twinkle * 0.6);
      const scale = 0.8 + twinkle * 0.4;

      const gradient = this.ctx.createRadialGradient(sx, sy, 0, sx, sy, star.size * 3 * scale);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      gradient.addColorStop(0.3, `rgba(220, 240, 255, ${alpha * 0.6})`);
      gradient.addColorStop(1, 'transparent');

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(sx, sy, star.size * 3 * scale, 0, Math.PI * 2);
      this.ctx.fill();

      // Sharp core for some stars
      if (star.brightness > 0.55 && twinkle > 0.7) {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        this.ctx.fillRect(sx - 0.5, sy - star.size * 2, 1, star.size * 4);
        this.ctx.fillRect(sx - star.size * 2, sy - 0.5, star.size * 4, 1);
      }
    });
  }

  private drawAurora(w: number, h: number) {
    const cfg = this.getThemeConfig();
    const t = this.time * 0.12;
    const p = this.shiftBack(w, h);
    const oy = p.y * 0.65;

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'screen';

    // Aurora wave 1
    this.renderAuroraWave(w, h, t, p.x, oy, cfg.aurora[0], 0.15, 0.14, 35);
    
    // Aurora wave 2
    this.renderAuroraWave(w, h, t + 2, p.x * 0.8, oy + 20, cfg.aurora[1], 0.22, 0.12, 45);

    // Aurora wave 3
    this.renderAuroraWave(w, h, t * 0.7, p.x * 1.2, oy - 15, cfg.aurora[2], 0.28, 0.1, 25);

    this.ctx.restore();
  }

  private renderAuroraWave(w: number, h: number, t: number, px: number, oy: number, hue: number, startY: number, alpha: number, amplitude: number) {
    this.ctx.beginPath();
    this.ctx.moveTo(0, h * startY + oy);
    for (let x = 0; x <= w; x += 15) {
      const y = h * startY + oy +
        Math.sin(x * 0.004 + t + px * 0.001) * amplitude +
        Math.sin(x * 0.008 + t * 0.6) * (amplitude * 0.5);
      this.ctx.lineTo(x + px * 0.3, y);
    }
    this.ctx.lineTo(w + px * 0.3, h * (startY + 0.25) + oy);
    this.ctx.lineTo(0, h * (startY + 0.25) + oy);
    this.ctx.closePath();

    const grad = this.ctx.createLinearGradient(0, h * startY + oy - amplitude, 0, h * (startY + 0.3) + oy);
    grad.addColorStop(0, `hsla(${hue}, 80%, 55%, 0)`);
    grad.addColorStop(0.2, `hsla(${hue}, 70%, 50%, ${alpha})`);
    grad.addColorStop(0.5, `hsla(${hue + 30}, 60%, 45%, ${alpha * 0.7})`);
    grad.addColorStop(1, 'transparent');
    this.ctx.fillStyle = grad;
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

  private drawFog(w: number, h: number) {
    const s = this.shiftMid(w, h);
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'screen';
    
    this.fogLayers.forEach(fog => {
      fog.x += fog.vx;
      if (fog.x > w + fog.width) fog.x = -fog.width;
      if (fog.x < -fog.width) fog.x = w + fog.width;

      const fx = fog.x + s.x * 0.5;
      const fy = fog.y + s.y * 0.5;

      const grad = this.ctx.createRadialGradient(fx, fy, 0, fx, fy, fog.width);
      grad.addColorStop(0, `hsla(${fog.hue}, 50%, 70%, ${fog.opacity})`);
      grad.addColorStop(0.6, `hsla(${fog.hue}, 40%, 60%, ${fog.opacity * 0.4})`);
      grad.addColorStop(1, 'transparent');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.ellipse(fx, fy, fog.width, fog.height, 0, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.restore();
  }

  private spawnShootingStar(w: number, h: number) {
    const star = this.shootingStars.find(s => !s.active);
    if (star) {
      star.active = true;
      star.x = Math.random() * w;
      star.y = Math.random() * h * 0.4;
      star.vx = (Math.random() + 1) * 12; // Directional speed
      star.vy = (Math.random() + 0.5) * 6;
      star.len = 120 + Math.random() * 150;
      star.opacity = 0.8 + Math.random() * 0.2;
    }
  }

  private drawShootingStars(w: number, h: number) {
    if (Math.random() < 0.004) {
      this.spawnShootingStar(w, h);
    }

    this.ctx.save();
    this.ctx.lineWidth = 1.5;
    this.ctx.lineCap = 'round';
    
    this.shootingStars.forEach(star => {
      if (!star.active) return;

      star.x += star.vx;
      star.y += star.vy;
      star.opacity -= 0.015;

      if (star.opacity <= 0 || star.x > w + star.len || star.y > h + star.len) {
        star.active = false;
        return;
      }

      const grad = this.ctx.createLinearGradient(star.x, star.y, star.x - star.vx, star.y - star.vy);
      grad.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
      grad.addColorStop(1, 'transparent');

      this.ctx.strokeStyle = grad;
      this.ctx.beginPath();
      this.ctx.moveTo(star.x, star.y);
      this.ctx.lineTo(star.x - star.vx * 3, star.y - star.vy * 3);
      this.ctx.stroke();

      // Small point at head
      this.ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, 1.2, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.restore();
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

  private drawMatrixStyle(w: number, h: number) {
    const cfg = this.getThemeConfig();
    this.matrixCodes.forEach(code => {
      code.y += code.speed;
      if (code.y - (code.chars.length * code.size) > h) {
        code.y = -code.size;
        code.speed = 2 + Math.random() * 5;
      }

      this.ctx.font = `${code.size}px monospace`;
      this.ctx.textAlign = 'center';
      
      code.chars.forEach((char, i) => {
        const charY = code.y - (i * code.size);
        if (charY < 0 || charY > h) return;

        const charOpacity = code.opacity * (1 - (i / code.chars.length));
        this.ctx.fillStyle = i === 0 
          ? `rgba(255, 255, 255, ${charOpacity * 2})` 
          : `hsla(${cfg.sky[0]}, 100%, 70%, ${charOpacity})`;
        
        this.ctx.fillText(char, code.x, charY);
      });
    });
  }

  private drawAudioStyle(w: number, h: number) {
    const ground = h * 0.88;
    
    this.soundBars.forEach(bar => {
      // Smooth growth towards target
      bar.height += (bar.targetHeight - bar.height) * 0.15;
      if (Math.abs(bar.targetHeight - bar.height) < 2) {
        bar.targetHeight = 30 + Math.random() * 250;
      }

      const grad = this.ctx.createLinearGradient(bar.x, ground, bar.x, ground - bar.height);
      grad.addColorStop(0, `hsla(${bar.hue}, 80%, 60%, 0.7)`);
      grad.addColorStop(1, `hsla(${bar.hue + 40}, 100%, 80%, 0.1)`);

      this.ctx.fillStyle = grad;
      this.ctx.fillRect(bar.x, ground - bar.height, bar.width, bar.height);
      
      // Top tip highlight
      this.ctx.fillStyle = `hsla(${bar.hue}, 100%, 90%, 0.8)`;
      this.ctx.fillRect(bar.x, ground - bar.height - 4, bar.width, 4);

      // Pulse particles from top
      if (Math.random() < 0.05) {
        this.spawnSparkle(w, h);
      }
    });

    // Spirits used as pulses
    this.drawSpirits(w, h);
    this.drawParticles(w, h);
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

  // ============================================================
  // RAYMAN-INSPIRED EPHEMERAL LUMENS SYSTEM
  // ============================================================
  
  /** Initialize ephemeral lumen object pool */
  private initEphemeralLumenPool(w: number, h: number) {
    const cfg = this.getThemeConfig();
    const lumenHues = cfg.lumenHues;
    
    for (let i = 0; i < this.EPHEMERAL_LUMEN_POOL_SIZE; i++) {
      const isActive = i < 12;
      this.ephemeralLumens.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.7 + h * 0.15,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 0.8,
        size: 8 + Math.random() * 18,
        hue: lumenHues[Math.floor(Math.random() * lumenHues.length)] + Math.random() * 15,
        phase: Math.random() * Math.PI * 2,
        life: isActive ? Math.random() * 3 + 1 : 0,
        maxLife: isActive ? 3 + Math.random() * 2 : 0,
        active: isActive,
        spawnDelay: Math.random() * 4,
        pulsePhase: Math.random() * Math.PI * 2,
        wiggleAmp: 0.3 + Math.random() * 0.5,
        wiggleFreq: 1.5 + Math.random() * 2,
        label: this.avSymbolPool[Math.floor(Math.random() * this.avSymbolPool.length)],
        trailCooldown: 0,
      });
    }
  }
  
  /** Initialize lumen particle trail pool */
  private initLumenParticlePool(w: number, h: number) {
    for (let i = 0; i < this.LUMEN_PARTICLE_POOL_SIZE; i++) {
      this.lumenParticles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.2,
        size: 1 + Math.random() * 3,
        life: Math.random() * 1.5,
        maxLife: 1 + Math.random() * 1.5,
        hue: 45 + Math.random() * 60,
        active: false,
        alpha: 0,
      });
    }
  }
  
  /** Initialize sparkle pool */
  private initSparklePool(w: number, h: number) {
    for (let i = 0; i < this.SPARKLE_POOL_SIZE; i++) {
      this.sparkles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 1 + Math.random() * 4,
        hue: 40 + Math.random() * 50,
        life: Math.random() * 2,
        maxLife: 1.5 + Math.random() * 1.5,
        active: i < 20,
        phase: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 3,
        decaySpeed: 0.5 + Math.random() * 0.8,
      });
    }
  }
  
  /** Initialize ring effect pool */
  private initRingPool(w: number, h: number) {
    for (let i = 0; i < this.RING_POOL_SIZE; i++) {
      this.rings.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: 0,
        maxRadius: 20 + Math.random() * 40,
        life: Math.random() * 0.8,
        maxLife: 0.6 + Math.random() * 0.4,
        hue: 45 + Math.random() * 50,
        active: false,
        thickness: 2 + Math.random() * 3,
      });
    }
  }
  
  /** Spawn a new ephemeral lumen from pool */
  private spawnEphemeralLumen(w: number, h: number) {
    const inactive = this.ephemeralLumens.find(l => !l.active && l.spawnDelay <= 0);
    if (inactive) {
      inactive.x = Math.random() * w;
      inactive.y = h + 30;
      inactive.vx = (Math.random() - 0.5) * 1.2;
      inactive.vy = -(0.5 + Math.random() * 0.8);
      inactive.life = 0;
      inactive.maxLife = 3 + Math.random() * 2.5;
      inactive.active = true;
      inactive.spawnDelay = Math.random() * 2;
    }
  }
  
  /** Spawn particle from a lumen */
  private spawnLumenParticle(x: number, y: number, hue: number) {
    const inactive = this.lumenParticles.find(p => !p.active);
    if (inactive) {
      inactive.x = x + (Math.random() - 0.5) * 10;
      inactive.y = y + (Math.random() - 0.5) * 10;
      inactive.vx = (Math.random() - 0.5) * 0.4;
      inactive.vy = (Math.random() - 0.5) * 0.3 - 0.15;
      inactive.life = 0;
      inactive.maxLife = 0.8 + Math.random() * 1.2;
      inactive.hue = hue + Math.random() * 20 - 10;
      inactive.active = true;
      inactive.alpha = 0.8 + Math.random() * 0.2;
    }
  }
  
  /** Spawn sparkle effect */
  private spawnSparkle(w: number, h: number) {
    const inactive = this.sparkles.find(s => !s.active);
    if (inactive) {
      inactive.x = Math.random() * w;
      inactive.y = Math.random() * h;
      inactive.life = 0;
      inactive.maxLife = 1 + Math.random() * 1.5;
      inactive.active = true;
      inactive.phase = Math.random() * Math.PI * 2;
      inactive.rotation = Math.random() * Math.PI * 2;
    }
  }
  
  /** Spawn ring effect from a lumen position */
  private spawnRing(x: number, y: number, hue: number) {
    const inactive = this.rings.find(r => !r.active);
    if (inactive) {
      inactive.x = x;
      inactive.y = y;
      inactive.radius = 5;
      inactive.life = 0;
      inactive.maxLife = 0.5 + Math.random() * 0.4;
      inactive.hue = hue;
      inactive.active = true;
    }
  }
  
  /** Draw ephemeral lumens (Rayman-style) */
  private drawEphemeralLumens(w: number, h: number) {
    const s = this.shiftFront(w, h);
    this.ctx.globalCompositeOperation = 'screen';
    
    if (Math.random() < 0.08) {
      this.spawnEphemeralLumen(w, h);
    }
    
    this.ephemeralLumens.forEach((lumen) => {
      if (lumen.spawnDelay > 0) lumen.spawnDelay -= 0.016;
      
      if (!lumen.active) return;
      
      lumen.life += 0.016;
      if (lumen.life >= lumen.maxLife) {
        lumen.active = false;
        lumen.spawnDelay = 1 + Math.random() * 3;
        return;
      }
      
      const lifeRatio = lumen.life / lumen.maxLife;
      lumen.x += lumen.vx + Math.sin(this.time * lumen.wiggleFreq + lumen.phase) * lumen.wiggleAmp;
      lumen.y += lumen.vy + Math.cos(this.time * lumen.wiggleFreq * 0.7 + lumen.phase) * lumen.wiggleAmp * 0.5;
      
      if (lumen.y < -50 && lifeRatio < 0.2) {
        lumen.y = h + 30;
        lumen.x = Math.random() * w;
      }
      
      const fadeIn = Math.min(lumen.life / 0.5, 1);
      const fadeOut = 1 - Math.min((lumen.life - lumen.maxLife + 0.8) / 0.8, 1);
      const alpha = fadeIn * fadeOut * (0.6 + Math.sin(this.time * 3 + lumen.pulsePhase) * 0.15);
      
      const lx = lumen.x + s.x;
      const ly = lumen.y + s.y;
      
      const glowSize = lumen.size * (2.5 + Math.sin(this.time * 2.5 + lumen.pulsePhase) * 0.3);
      const glow = this.ctx.createRadialGradient(lx, ly, 0, lx, ly, glowSize);
      glow.addColorStop(0, `hsla(${lumen.hue}, 85%, 75%, ${alpha * 0.9})`);
      glow.addColorStop(0.35, `hsla(${lumen.hue}, 75%, 55%, ${alpha * 0.5})`);
      glow.addColorStop(0.7, `hsla(${lumen.hue}, 65%, 45%, ${alpha * 0.2})`);
      glow.addColorStop(1, 'transparent');
      this.ctx.fillStyle = glow;
      this.ctx.beginPath();
      this.ctx.arc(lx, ly, glowSize, 0, Math.PI * 2);
      this.ctx.fill();
      
      const coreSize = lumen.size * 0.4;
      const core = this.ctx.createRadialGradient(lx, ly, 0, lx, ly, coreSize);
      core.addColorStop(0, `hsla(${lumen.hue}, 100%, 95%, ${alpha})`);
      core.addColorStop(0.5, `hsla(${lumen.hue}, 90%, 80%, ${alpha * 0.8})`);
      core.addColorStop(1, 'transparent');
      this.ctx.fillStyle = core;
      this.ctx.beginPath();
      this.ctx.arc(lx, ly, coreSize, 0, Math.PI * 2);
      this.ctx.fill();
      
      lumen.trailCooldown -= 0.016;
      if (lumen.trailCooldown <= 0 && Math.random() < 0.3) {
        this.spawnLumenParticle(lx, ly, lumen.hue);
        lumen.trailCooldown = 0.08 + Math.random() * 0.12;
      }
      
      if (Math.random() < 0.008) {
        this.spawnRing(lx, ly, lumen.hue);
      }
      
      if (Math.random() < 0.02) {
        this.spawnSparkle(w, h);
      }
    });
    
    this.ctx.globalCompositeOperation = 'source-over';
  }
  
  /** Draw lumen particle trails */
  private drawLumenParticles(w: number, h: number) {
    const s = this.shiftFront(w, h);
    this.ctx.globalCompositeOperation = 'screen';
    
    this.lumenParticles.forEach((particle) => {
      if (!particle.active) return;
      
      particle.life += 0.016;
      if (particle.life >= particle.maxLife) {
        particle.active = false;
        return;
      }
      
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      const lifeRatio = particle.life / particle.maxLife;
      const alpha = (1 - lifeRatio) * particle.alpha * 0.7;
      
      const px = particle.x + s.x;
      const py = particle.y + s.y;
      
      const glow = this.ctx.createRadialGradient(px, py, 0, px, py, particle.size * 3);
      glow.addColorStop(0, `hsla(${particle.hue}, 90%, 80%, ${alpha})`);
      glow.addColorStop(0.5, `hsla(${particle.hue}, 80%, 60%, ${alpha * 0.3})`);
      glow.addColorStop(1, 'transparent');
      this.ctx.fillStyle = glow;
      this.ctx.beginPath();
      this.ctx.arc(px, py, particle.size * 3, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.fillStyle = `hsla(${particle.hue}, 100%, 92%, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(px, py, particle.size * 0.5, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    this.ctx.globalCompositeOperation = 'source-over';
  }
  
  /** Draw sparkle effects */
  private drawSparkles(w: number, h: number) {
    const s = this.shiftFront(w, h);
    this.ctx.globalCompositeOperation = 'screen';
    
    if (Math.random() < 0.06) {
      this.spawnSparkle(w, h);
    }
    
    this.sparkles.forEach((sparkle) => {
      if (!sparkle.active) return;
      
      sparkle.life += 0.016;
      sparkle.rotation += sparkle.rotationSpeed * 0.016;
      
      if (sparkle.life >= sparkle.maxLife) {
        sparkle.active = false;
        return;
      }
      
      const lifeRatio = sparkle.life / sparkle.maxLife;
      const alpha = (1 - lifeRatio) * 0.9;
      const twinkle = 0.5 + Math.sin(this.time * 8 + sparkle.phase) * 0.5;
      
      const sx = sparkle.x + s.x;
      const sy = sparkle.y + s.y;
      
      this.ctx.save();
      this.ctx.translate(sx, sy);
      this.ctx.rotate(sparkle.rotation);
      
      const size = sparkle.size * (1 + twinkle * 0.5);
      this.ctx.fillStyle = `hsla(${sparkle.hue}, 100%, 90%, ${alpha})`;
      this.ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const outerX = Math.cos(angle) * size;
        const outerY = Math.sin(angle) * size;
        const innerAngle = angle + Math.PI / 4;
        const innerX = Math.cos(innerAngle) * size * 0.35;
        const innerY = Math.sin(innerAngle) * size * 0.35;
        
        if (i === 0) {
          this.ctx.moveTo(outerX, outerY);
        } else {
          this.ctx.lineTo(outerX, outerY);
        }
        this.ctx.lineTo(innerX, innerY);
      }
      this.ctx.closePath();
      this.ctx.fill();
      
      const glow = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size * 2);
      glow.addColorStop(0, `hsla(${sparkle.hue}, 90%, 85%, ${alpha * 0.6})`);
      glow.addColorStop(1, 'transparent');
      this.ctx.fillStyle = glow;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, size * 2, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.restore();
    });
    
    this.ctx.globalCompositeOperation = 'source-over';
  }
  
  /** Draw ring effects */
  private drawRings(w: number, h: number) {
    const s = this.shiftFront(w, h);
    this.ctx.globalCompositeOperation = 'screen';
    
    this.rings.forEach((ring) => {
      if (!ring.active) return;
      
      ring.life += 0.016;
      if (ring.life >= ring.maxLife) {
        ring.active = false;
        return;
      }
      
      const lifeRatio = ring.life / ring.maxLife;
      ring.radius = ring.maxRadius * lifeRatio;
      const alpha = (1 - lifeRatio) * 0.7;
      
      const rx = ring.x + s.x;
      const ry = ring.y + s.y;
      
      this.ctx.strokeStyle = `hsla(${ring.hue}, 85%, 70%, ${alpha})`;
      this.ctx.lineWidth = ring.thickness * (1 - lifeRatio);
      this.ctx.beginPath();
      this.ctx.arc(rx, ry, ring.radius, 0, Math.PI * 2);
      this.ctx.stroke();
      
      const innerGlow = this.ctx.createRadialGradient(rx, ry, ring.radius * 0.5, rx, ry, ring.radius);
      innerGlow.addColorStop(0, `hsla(${ring.hue}, 80%, 65%, ${alpha * 0.2})`);
      innerGlow.addColorStop(1, 'transparent');
      this.ctx.fillStyle = innerGlow;
      this.ctx.beginPath();
      this.ctx.arc(rx, ry, ring.radius, 0, Math.PI * 2);
      this.ctx.fill();
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

    // Shadows / Glow
    this.ctx.fillStyle = 'rgba(0,0,0,0.38)';
    this.ctx.beginPath();
    this.ctx.ellipse(5, bodyH * 0.52, 45, 12, 0, 0, Math.PI * 2);
    this.ctx.fill();

    const cfg = this.getThemeConfig();
    // Body
    this.roundRect2(bx, by, bodyW, bodyH, 20, cfg.mascot.body);
    this.roundRect2(bx + 5, by + 8, bodyW - 10, bodyH - 22, 15, cfg.mascot.highlight);

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
    this.ctx.fillStyle = cfg.mascot.feet;
    this.ctx.fillRect(bx + 16, by + bodyH - 6, 20, 26);
    this.ctx.fillRect(bx + 49, by + bodyH - 6, 20, 26);

    // Arms
    const armSwing = Math.sin(this.time * 4.2) * 0.14;
    this.ctx.save();
    this.ctx.translate(bx + bodyW - 4, by + 32);
    this.ctx.rotate(armSwing);
    this.ctx.fillStyle = cfg.mascot.highlight;
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

    // Shadows / Glow
    this.ctx.fillStyle = 'rgba(0,0,0,0.32)';
    this.ctx.beginPath();
    this.ctx.ellipse(3, bodyH * 0.56, 36, 11, 0, 0, Math.PI * 2);
    this.ctx.fill();

    const cfg = this.getThemeConfig();
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
    this.roundRect2(bx, by, bodyW, bodyH, 18, cfg.sidekick.body);
    this.roundRect2(bx + 4, by + 7, bodyW - 8, bodyH - 20, 14, cfg.sidekick.highlight);

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
    this.ctx.fillStyle = cfg.sidekick.feet;
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

/** ============================================ */
/** RAYMAN-INSPIRED LUMENS INTERFACES */
/** ============================================ */

interface EphemeralLumen {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  hue: number;
  phase: number;
  life: number;
  maxLife: number;
  active: boolean;
  spawnDelay: number;
  pulsePhase: number;
  wiggleAmp: number;
  wiggleFreq: number;
  label: string;
  trailCooldown: number;
}

interface LumenParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  hue: number;
  active: boolean;
  alpha: number;
}

interface Sparkle {
  x: number;
  y: number;
  size: number;
  hue: number;
  life: number;
  maxLife: number;
  active: boolean;
  phase: number;
  rotation: number;
  rotationSpeed: number;
  decaySpeed: number;
}

interface LumenRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
  hue: number;
  active: boolean;
  thickness: number;
}

interface ThemeConfigInternal {
  style: 'aurora' | 'matrix' | 'audio';
  sky: number[];
  aurora: number[];
  particles: number[];
  spirits: number[];
  mascot: { body: string; highlight: string; feet: string };
  sidekick: { body: string; highlight: string; feet: string };
  fog: number[];
  lumenHues: number[];
}

interface MatrixCode {
  x: number;
  y: number;
  speed: number;
  chars: string[];
  opacity: number;
  size: number;
}

interface SoundBar {
  x: number;
  height: number;
  targetHeight: number;
  width: number;
  hue: number;
}

interface FogLayer {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  opacity: number;
  hue: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  len: number;
  active: boolean;
  opacity: number;
}
