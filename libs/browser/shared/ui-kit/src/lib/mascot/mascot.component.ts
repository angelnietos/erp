import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type MascotType =
  | 'inventory'
  | 'budget'
  | 'clients'
  | 'projects'
  | 'fleet'
  | 'rentals'
  | 'audit'
  | 'dashboard'
  | 'universal';

export type MascotPersonality =
  | 'happy'
  | 'tech'
  | 'mystic'
  | 'worker'
  | 'explorer'
  | 'ninja'
  | 'queen';

@Component({
  selector: 'ui-mascot',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="mascot-container"
      [class]="'personality-' + personality"
      [style.--mascot-color]="effectiveColor"
      [style.--mascot-secondary]="effectiveSecondary"
    >
      <div class="mascot-body-wrapper">
        <!-- Ambient Aura -->
        <div class="mascot-glow"></div>

        <!-- Accessories behind the body (Wings, Capes) -->
        <div class="ears-container" *ngIf="personality !== 'tech'">
          <div class="ear left"></div>
          <div class="ear right"></div>
        </div>

        <!-- Tech/Robot Antenna -->
        <div
          class="antenna"
          *ngIf="personality === 'tech' || personality === 'worker'"
        >
          <div class="antenna-pole"></div>
          <div class="antenna-tip"></div>
        </div>

        <!-- Main Body -->
        <div class="mascot-body" [class]="bodyShape">
          <div class="glass-highlight"></div>

          <!-- Kawaii Anatomy -->
          <div class="face-container">
            <div class="blush left"></div>
            <div class="blush right"></div>

            <div class="eyes-container">
              <div class="eye left" [class]="effectiveEyes">
                <div class="pupil"></div>
              </div>
              <div class="eye right" [class]="effectiveEyes">
                <div class="pupil"></div>
              </div>
            </div>

            <div class="mouth" [class]="effectiveMouth"></div>
          </div>
        </div>

        <!-- Floating Limbs -->
        <div class="limbs-container">
          <div class="limb left"></div>
          <div class="limb right">
            <div class="accessory-hand" [ngSwitch]="type">
              <span *ngSwitchCase="'inventory'" class="acc-symbol">🍄</span>
              <span *ngSwitchCase="'budget'" class="acc-symbol">🪙</span>
              <span *ngSwitchCase="'clients'" class="acc-symbol">💖</span>
              <span *ngSwitchCase="'projects'" class="acc-symbol">⭐</span>
              <span *ngSwitchCase="'fleet'" class="acc-symbol">🛵</span>
              <span *ngSwitchCase="'rentals'" class="acc-symbol">🗝️</span>
              <span *ngSwitchCase="'audit'" class="acc-symbol">🛡️</span>
              <span *ngSwitchCase="'dashboard'" class="acc-symbol">🦆</span>
              <span *ngSwitchDefault class="acc-symbol">✨</span>
            </div>
          </div>
        </div>

        <!-- Ground Shadow -->
        <div class="mascot-shadow"></div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: inline-block;
        width: 100%;
        height: 100%;
      }

      .mascot-container {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        perspective: 1000px;
      }

      .mascot-body-wrapper {
        position: relative;
        width: 90px;
        height: 90px;
        transform-style: preserve-3d;
        animation: float 4s ease-in-out infinite;
      }

      .mascot-glow {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 150%;
        height: 150%;
        background: radial-gradient(
          circle,
          var(--mascot-color) 0%,
          var(--mascot-secondary) 30%,
          transparent 70%
        );
        opacity: 0.3;
        filter: blur(20px);
        border-radius: 50%;
      }

      .mascot-body {
        position: relative;
        width: 100%;
        height: 100%;
        background: radial-gradient(
          circle at 30% 20%,
          color-mix(in srgb, var(--mascot-color) 30%, white) 0%,
          var(--mascot-color) 30%,
          var(--mascot-secondary) 100%
        );
        box-shadow:
          inset -10px -10px 22px
            color-mix(in srgb, var(--mascot-secondary) 45%, rgba(0, 0, 0, 0.75)),
          inset 10px 10px 20px rgba(255, 255, 255, 0.4),
          0 15px 35px
            color-mix(in srgb, var(--mascot-secondary) 55%, rgba(0, 0, 0, 0.45)),
          0 28px 50px -12px
            color-mix(in srgb, var(--mascot-secondary) 35%, transparent);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 2;
        transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      .glass-highlight {
        position: absolute;
        top: 5%;
        left: 10%;
        width: 40%;
        height: 25%;
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.6) 0%,
          rgba(255, 255, 255, 0) 100%
        );
        border-radius: 50%;
        transform: rotate(-30deg);
        pointer-events: none;
      }

      /* Nintendo-esque Shapes */
      .mascot-body.round {
        border-radius: 50%;
      }
      .mascot-body.square {
        border-radius: 28px;
      }
      .mascot-body.capsule {
        border-radius: 45px 45px 25px 25px;
      }
      .mascot-body.tri {
        clip-path: polygon(50% 0%, 100% 90%, 0% 90%);
        border-radius: 10px;
      }
      .mascot-body.mushroom-cap {
        border-radius: 50% 50% 20% 20%;
        clip-path: ellipse(80% 60% at 50% 35%);
      }
      .mascot-body.mushroom-full {
        border-radius: 50% 50% 10% 10%;
        position: relative;
      }
      .mascot-body.mushroom-full::before {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 40%;
        width: 20%;
        height: 15px;
        background: var(--mascot-secondary);
        border-radius: 50%;
        box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
      }

      /* Rage / Toxic Core */
      .mascot-container.is-rage .mascot-glow {
        background: radial-gradient(circle, #ff0000 0%, transparent 80%);
        opacity: 0.8;
        animation: pulseRage 0.3s infinite alternate;
        filter: blur(30px);
      }

      .mascot-container.is-rage .mascot-body {
        animation: jitter 0.1s infinite;
        box-shadow: 0 0 40px rgba(255, 0, 0, 0.6);
      }

      .eye.angry {
        height: 14px;
        clip-path: polygon(0% 30%, 100% 0%, 100% 100%, 0% 100%);
        background: #000;
        border-top: 3.5px solid #ff0000;
      }

      .eye.insane {
        width: 24px;
        height: 24px;
        background: #fff;
        border: 4px solid #ff0000;
        border-radius: 50%;
        animation: eyeTwitch 0.15s infinite;
        overflow: hidden;
      }
      .eye.insane .pupil {
        background: #ff0000 !important;
        width: 6px !important;
        height: 6px !important;
        box-shadow: 0 0 10px #ff0000 !important;
      }

      .mouth.mean {
        width: 28px;
        height: 4px;
        background: #111;
        border-radius: 2px;
        transform: rotate(-3deg);
        margin-top: 12px;
      }

      @keyframes pulseRage {
        from {
          transform: translate(-50%, -50%) scale(1);
        }
        to {
          transform: translate(-50%, -50%) scale(1.5);
        }
      }
      @keyframes eyeTwitch {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.2) rotate(5deg);
        }
      }
      @keyframes jitter {
        0%,
        100% {
          transform: translate(0, 0);
        }
        25% {
          transform: translate(1px, -1px);
        }
        75% {
          transform: translate(-1px, 1px);
        }
      }

      /* Ears / Appendages */
      .ears-container {
        position: absolute;
        top: -12px;
        width: 100%;
        display: flex;
        justify-content: space-between;
        padding: 0 4px;
        z-index: 1;
      }

      .ear {
        width: 32px;
        height: 48px;
        background: radial-gradient(
          ellipse at center,
          var(--mascot-color) 0%,
          var(--mascot-secondary) 100%
        );
        border-radius: 50% 50% 20px 20px;
        box-shadow:
          inset -4px -4px 10px
            color-mix(in srgb, var(--mascot-secondary) 40%, rgba(0, 0, 0, 0.55)),
          inset 4px 4px 10px rgba(255, 255, 255, 0.4);
      }

      .ear.left {
        transform: rotate(-25deg) translate(-5px, 10px);
      }
      .ear.right {
        transform: rotate(25deg) translate(5px, 10px);
      }

      .personality-mystic .ear {
        height: 60px;
        width: 18px;
        border-radius: 100px 100px 0 0;
        transform-origin: bottom;
        animation: earWiggle 5s infinite;
        box-shadow: 0 0 15px var(--mascot-color);
      }

      /* Antenna */
      .antenna {
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        z-index: 1;
      }

      .antenna-pole {
        width: 6px;
        height: 25px;
        background: linear-gradient(90deg, #94a3b8, #cbd5e1, #64748b);
        border-radius: 4px;
      }
      .antenna-tip {
        width: 16px;
        height: 16px;
        background: radial-gradient(
          circle at 30% 30%,
          #fff,
          var(--mascot-color)
        );
        border-radius: 50%;
        box-shadow: 0 0 15px var(--mascot-color);
        animation: pulse 1s infinite alternate;
      }

      /* Face Layout */
      .face-container {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        z-index: 5;
      }

      /* Cheeks */
      .blush {
        position: absolute;
        top: 55%;
        width: 18px;
        height: 10px;
        background: rgba(255, 105, 135, 0.7);
        border-radius: 50%;
        filter: blur(3px);
      }
      .blush.left {
        left: 12%;
      }
      .blush.right {
        right: 12%;
      }

      /* Eyes */
      .eyes-container {
        display: flex;
        gap: 16px;
        margin-top: 10px;
      }

      .eye {
        width: 16px;
        height: 24px;
        background: #111;
        border-radius: 50%;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding-top: 3px;
        box-shadow: inset 0 3px 6px rgba(0, 0, 0, 0.8);
        position: relative;
      }

      .eye.joy {
        height: 12px;
        border-radius: 12px 12px 0 0;
        background: #222;
      }
      .eye.shades {
        width: 28px;
        height: 16px;
        border-radius: 6px;
        background: linear-gradient(135deg, #222, #000);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
      }

      /* Cute Anime Reflection */
      .pupil {
        width: 7px;
        height: 10px;
        background: #fff;
        border-radius: 50%;
        box-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
        position: relative;
        animation: lookAround 8s infinite;
      }
      .pupil::after {
        content: '';
        position: absolute;
        bottom: -6px;
        right: -2px;
        width: 3px;
        height: 4px;
        background: #fff;
        border-radius: 50%;
        opacity: 0.8;
      }

      /* Mouth */
      .mouth {
        width: 12px;
        height: 8px;
        border-bottom: 3px solid #333;
        border-radius: 50%;
        margin-top: 8px;
      }

      .mouth.smile {
        border-bottom: 4px solid #111;
        width: 16px;
      }
      .mouth.o {
        width: 12px;
        height: 12px;
        border: 4px solid #111;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.1);
      }
      .mouth.beak {
        width: 22px;
        height: 14px;
        border-radius: 10px 10px 18px 18px;
        background: #f59e0b;
        border-bottom: 3px solid #b45309;
        margin-top: 6px;
      }

      /* Floating Hands/Limbs */
      .limbs-container {
        position: absolute;
        top: 50%;
        width: 150%;
        left: -25%;
        display: flex;
        justify-content: space-between;
        z-index: 10;
      }

      .limb {
        width: 28px;
        height: 28px;
        background: radial-gradient(
          circle at 30% 30%,
          color-mix(in srgb, var(--mascot-color) 40%, white) 0%,
          var(--mascot-color) 50%,
          var(--mascot-secondary) 100%
        );
        border-radius: 50%;
        box-shadow:
          inset -4px -4px 8px rgba(0, 0, 0, 0.4),
          0 8px 15px
            color-mix(in srgb, var(--mascot-secondary) 40%, rgba(0, 0, 0, 0.3));
        display: flex;
        align-items: center;
        justify-content: center;
        animation: floatLimbs 3s ease-in-out infinite alternate;
      }

      .limb.left {
        animation-delay: 0.5s;
      }

      .accessory-hand {
        position: absolute;
        top: -20px;
        right: -15px;
        font-size: 2rem;
        filter: drop-shadow(
          0 8px 14px
            color-mix(in srgb, var(--mascot-secondary) 45%, rgba(0, 0, 0, 0.5))
        );
        animation: handItemHover 2.5s ease-in-out infinite alternate;
      }

      .mascot-shadow {
        position: absolute;
        bottom: -35px;
        left: 15%;
        width: 70%;
        height: 18px;
        background: radial-gradient(
          ellipse at center,
          color-mix(in srgb, var(--mascot-secondary) 65%, rgba(0, 0, 0, 0.55))
            0%,
          color-mix(in srgb, var(--mascot-secondary) 25%, rgba(0, 0, 0, 0.35))
            55%,
          transparent 100%
        );
        filter: blur(12px);
        border-radius: 50%;
        animation: shadowMove 4s ease-in-out infinite;
      }

      @keyframes float {
        0%,
        100% {
          transform: translateY(0) rotateX(5deg) rotateY(0deg);
        }
        50% {
          transform: translateY(-20px) rotateX(10deg) rotateY(5deg);
        }
      }

      @keyframes handGrip {
        from {
          transform: translateY(0) rotate(-5deg);
        }
        to {
          transform: translateY(-5px) rotate(5deg);
        }
      }

      @keyframes earWiggle {
        0%,
        90%,
        100% {
          transform: rotate(0);
        }
        92% {
          transform: rotate(-20deg);
        }
        95% {
          transform: rotate(20deg);
        }
        98% {
          transform: rotate(-20deg);
        }
      }

      @keyframes shadowMove {
        0%,
        100% {
          transform: scale(1);
          opacity: 0.5;
        }
        50% {
          transform: scale(0.8);
          opacity: 0.2;
        }
      }

      @keyframes blink {
        0%,
        96%,
        100% {
          transform: scaleY(1);
        }
        98% {
          transform: scaleY(0.1);
        }
      }

      @keyframes pulse {
        from {
          transform: scale(1);
          opacity: 1;
        }
        to {
          transform: scale(1.5);
          opacity: 0.6;
        }
      }

      @keyframes lookAround {
        0%,
        20%,
        100% {
          transform: translate(0, 0);
        }
        25%,
        45% {
          transform: translate(2px, 0);
        }
        50%,
        70% {
          transform: translate(-2px, 0);
        }
        75%,
        95% {
          transform: translate(0, 1px);
        }
      }

      @keyframes floatLimbs {
        0% {
          transform: translateY(0);
        }
        100% {
          transform: translateY(-8px);
        }
      }

      @keyframes handItemHover {
        0% {
          transform: translateY(0) rotate(-5deg);
        }
        100% {
          transform: translateY(-6px) rotate(5deg);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UIMascotComponent {
  @Input() type: MascotType = 'universal';
  @Input() color: string = '#10b981';
  @Input() secondaryColor: string = '#065f46';
  @Input() personality: MascotPersonality = 'happy';
  @Input() bodyShape:
    | 'round'
    | 'square'
    | 'capsule'
    | 'tri'
    | 'mushroom-cap'
    | 'mushroom-full' = 'round';
  @Input() eyesType: 'dots' | 'joy' | 'shades' | 'angry' | 'insane' = 'dots';
  @Input() mouthType: 'smile' | 'line' | 'o' | 'mean' = 'line';

  // Toxic / Rage configuration
  @Input() rageMode: boolean = false;
  @Input() rageStyle: 'terror' | 'angry' | 'dark' = 'angry';

  get effectiveColor(): string {
    if (!this.rageMode) return this.color;
    switch (this.rageStyle) {
      case 'terror':
        return '#ff0000';
      case 'dark':
        return '#1a1a1a';
      default:
        return '#dc2626';
    }
  }

  get effectiveSecondary(): string {
    if (!this.rageMode) return this.secondaryColor;
    return '#000000';
  }

  get effectiveEyes(): string {
    if (!this.rageMode) return this.eyesType;
    return this.rageStyle === 'terror' ? 'insane' : 'angry';
  }

  get effectiveMouth(): string {
    if (!this.rageMode) return this.mouthType;
    return 'mean';
  }
}
