import { Component, ElementRef, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-animated-background',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './animated-background.component.html',
  styleUrl: './animated-background.component.css',
})
export class AnimatedBackgroundComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private animationId!: number;
  private particles: Particle[] = [];
  private bubbles: Bubble[] = [];
  private time = 0;

  ngOnInit() {
    this.initParticles();
    this.initBubbles();
  }

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    this.animate();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  private initParticles() {
    const count = 80;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.8 + 0.2,
        hue: Math.random() * 60 + 40, // Golden to green
      });
    }
  }

  private initBubbles() {
    const count = 15;
    for (let i = 0; i < count; i++) {
      this.bubbles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 40 + 20,
        speedY: Math.random() * 0.5 + 0.2,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.02 + 0.01,
      });
    }
  }

  private animate() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.time += 0.016;

    // Draw gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0a1628');
    gradient.addColorStop(0.3, '#162447');
    gradient.addColorStop(0.6, '#1f3a5f');
    gradient.addColorStop(1, '#0d1b2a');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw glowing orbs (magical forest lights)
    this.drawGlowingOrbs();

    // Draw floating particles (fairy dust)
    this.drawParticles();

    // Draw rising bubbles (magical spores)
    this.drawBubbles();

    // Draw grass/plant silhouettes at bottom
    this.drawGrass();

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  private drawGlowingOrbs() {
    const orbPositions = [
      { x: 0.1, y: 0.2, size: 150, hue: 45 },
      { x: 0.8, y: 0.15, size: 180, hue: 60 },
      { x: 0.5, y: 0.4, size: 120, hue: 35 },
      { x: 0.2, y: 0.6, size: 100, hue: 50 },
      { x: 0.9, y: 0.5, size: 130, hue: 55 },
    ];

    orbPositions.forEach((orb, i) => {
      const x = orb.x * window.innerWidth + Math.sin(this.time + i) * 30;
      const y = orb.y * window.innerHeight + Math.cos(this.time * 0.5 + i) * 20;
      
      const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, orb.size);
      gradient.addColorStop(0, `hsla(${orb.hue}, 100%, 70%, 0.3)`);
      gradient.addColorStop(0.5, `hsla(${orb.hue}, 80%, 50%, 0.1)`);
      gradient.addColorStop(1, 'transparent');
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(x, y, orb.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  private drawParticles() {
    this.particles.forEach((p) => {
      p.x += p.speedX + Math.sin(this.time + p.x * 0.01) * 0.2;
      p.y += p.speedY + Math.cos(this.time * 0.5 + p.y * 0.01) * 0.1;

      // Wrap around
      if (p.x < 0) p.x = window.innerWidth;
      if (p.x > window.innerWidth) p.x = 0;
      if (p.y < 0) p.y = window.innerHeight;
      if (p.y > window.innerHeight) p.y = 0;

      // Draw glow
      const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
      gradient.addColorStop(0, `hsla(${p.hue}, 100%, 80%, ${p.opacity})`);
      gradient.addColorStop(0.5, `hsla(${p.hue}, 80%, 60%, ${p.opacity * 0.3})`);
      gradient.addColorStop(1, 'transparent');
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw core
      this.ctx.fillStyle = `hsla(${p.hue}, 100%, 90%, ${p.opacity})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  private drawBubbles() {
    this.bubbles.forEach((b, i) => {
      b.y -= b.speedY;
      b.wobble += b.wobbleSpeed;
      b.x += Math.sin(b.wobble) * 0.5;

      // Reset when out of view
      if (b.y < -b.radius) {
        b.y = window.innerHeight + b.radius;
        b.x = Math.random() * window.innerWidth;
      }

      // Draw bubble with glow
      const gradient = this.ctx.createRadialGradient(
        b.x - b.radius * 0.3, b.y - b.radius * 0.3, 0,
        b.x, b.y, b.radius
      );
      gradient.addColorStop(0, 'rgba(200, 255, 220, 0.2)');
      gradient.addColorStop(0.7, 'rgba(100, 200, 150, 0.1)');
      gradient.addColorStop(1, 'rgba(50, 150, 100, 0.05)');

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Bubble highlight
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.beginPath();
      this.ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.2, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  private drawGrass() {
    const grassCount = 30;
    const baseY = window.innerHeight;
    
    for (let i = 0; i < grassCount; i++) {
      const x = (i / grassCount) * window.innerWidth;
      const height = 50 + Math.random() * 80;
      const sway = Math.sin(this.time * 0.5 + i * 0.5) * 20;
      
      this.ctx.strokeStyle = 'rgba(30, 80, 50, 0.6)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(x, baseY);
      this.ctx.quadraticCurveTo(x + sway, baseY - height / 2, x + sway * 1.5, baseY - height);
      this.ctx.stroke();

      // Add some leaf details
      for (let j = 0; j < 3; j++) {
        const leafY = baseY - height * (0.3 + j * 0.25);
        const leafSway = sway * (0.5 + j * 0.2);
        
        this.ctx.fillStyle = 'rgba(40, 100, 60, 0.4)';
        this.ctx.beginPath();
        this.ctx.ellipse(x + leafSway, leafY, 8, 3, Math.PI / 4, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
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
  speedY: number;
  wobble: number;
  wobbleSpeed: number;
}