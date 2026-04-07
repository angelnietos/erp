import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type MascotType = 'inventory' | 'budget' | 'clients' | 'projects' | 'fleet' | 'rentals' | 'audit' | 'universal';

export type MascotPersonality = 'happy' | 'tech' | 'mystic' | 'worker' | 'explorer' | 'ninja' | 'queen';

@Component({
  selector: 'ui-josanz-mascot',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mascot-container" [class]="'personality-' + personality" [style.--mascot-color]="color" [style.--mascot-secondary]="secondaryColor">
      <div class="mascot-body-wrapper">
        <!-- Floating Glow -->
        <div class="mascot-glow"></div>
        
        <!-- Ears / Horns -->
        <div class="ears-container" *ngIf="personality !== 'tech'">
          <div class="ear left"></div>
          <div class="ear right"></div>
        </div>

        <!-- Antenna for Tech -->
        <div class="antenna" *ngIf="personality === 'tech' || personality === 'worker'">
          <div class="antenna-pole"></div>
          <div class="antenna-tip"></div>
        </div>
        
        <!-- Main Body -->
        <div class="mascot-body" [class]="bodyShape">
          <!-- Digital Eyes -->
          <div class="eyes-container">
            <div class="eye left" [class]="eyesType">
              <div class="pupil"></div>
            </div>
            <div class="eye right" [class]="eyesType">
              <div class="pupil"></div>
            </div>
          </div>
          
          <!-- Mouth -->
          <div class="mouth" [class]="mouthType"></div>
        </div>
        
        <!-- Arms / Wings / Accessories -->
        <div class="limbs-container">
          <div class="limb left"></div>
          <div class="limb right">
            <!-- Accessory held by hand -->
            <div class="accessory-hand" [ngSwitch]="type">
              <span *ngSwitchCase="'inventory'" class="acc-symbol">📦</span>
              <span *ngSwitchCase="'budget'" class="acc-symbol">💰</span>
              <span *ngSwitchCase="'clients'" class="acc-symbol">🤝</span>
              <span *ngSwitchCase="'projects'" class="acc-symbol">🎬</span>
              <span *ngSwitchCase="'fleet'" class="acc-symbol">🚚</span>
              <span *ngSwitchCase="'rentals'" class="acc-symbol">🔑</span>
              <span *ngSwitchCase="'audit'" class="acc-symbol">🕵️</span>
              <span *ngSwitchDefault class="acc-symbol">✨</span>
            </div>
          </div>
        </div>
        
        <!-- Base / Hover Effect -->
        <div class="mascot-shadow"></div>
      </div>
    </div>
  `,
  styles: [`
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
      perspective: 1200px;
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
      width: 140%;
      height: 140%;
      background: radial-gradient(circle, var(--mascot-color, #10b981) 0%, transparent 75%);
      opacity: 0.25;
      filter: blur(25px);
      border-radius: 50%;
    }

    .mascot-body {
      position: relative;
      width: 100%;
      height: 100%;
      background: linear-gradient(145deg, var(--mascot-color) 0%, var(--mascot-secondary, #1e293b) 100%);
      box-shadow: 
        inset 0 4px 10px rgba(255,255,255,0.4),
        inset 0 -4px 15px rgba(0,0,0,0.4),
        0 10px 30px rgba(0,0,0,0.5);
      border: 2px solid rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 2;
      transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    /* Shapes */
    .mascot-body.round { border-radius: 50%; }
    .mascot-body.square { border-radius: 20px; }
    .mascot-body.capsule { border-radius: 40px 40px 20px 20px; }
    .mascot-body.tri { clip-path: polygon(50% 0%, 100% 100%, 0% 100%); border-radius: 0; }

    /* Ears */
    .ears-container {
      position: absolute;
      top: -15px;
      width: 100%;
      display: flex;
      justify-content: space-between;
      padding: 0 5px;
    }

    .ear {
      width: 25px;
      height: 35px;
      background: var(--mascot-color);
      border-radius: 50% 50% 10px 10px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .ear.left { transform: rotate(-15deg); }
    .ear.right { transform: rotate(15deg); }

    .personality-mystic .ear {
      height: 50px;
      width: 15px;
      border-radius: 100px 100px 0 0;
      transform-origin: bottom;
      animation: earWiggle 5s infinite;
    }

    /* Antenna */
    .antenna {
      position: absolute;
      top: -25px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .antenna-pole { width: 4px; height: 20px; background: rgba(255, 255, 255, 0.3); }
    .antenna-tip { 
      width: 10px; height: 10px; background: var(--mascot-color); border-radius: 50%; 
      box-shadow: 0 0 10px var(--mascot-color);
      animation: pulse 1s infinite alternate;
    }

    /* Eyes */
    .eyes-container {
      display: flex;
      gap: 12px;
      margin: 0;
    }

    .eye {
      width: 20px;
      height: 20px;
      background: #000;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .eye.joy { height: 10px; border-radius: 10px 10px 0 0; }
    .eye.shades { width: 24px; height: 14px; border-radius: 4px; }

    .pupil {
      width: 8px;
      height: 8px;
      background: #fff;
      border-radius: 50%;
      box-shadow: 0 0 10px #fff;
      animation: blink 4s infinite;
    }

    /* Mouth */
    .mouth {
      width: 16px;
      height: 8px;
      border-bottom: 2px solid rgba(0,0,0,0.3);
      border-radius: 50%;
      margin-top: 8px;
    }

    .mouth.smile { border-bottom: 3px solid #fff; }
    .mouth.o { width: 10px; height: 10px; border: 3px solid #fff; border-radius: 50%; }

    /* Accessories */
    .limbs-container {
      position: absolute;
      top: 50%;
      width: 140%;
      left: -20%;
      display: flex;
      justify-content: space-between;
      z-index: 1;
    }

    .limb {
      width: 24px;
      height: 24px;
      background: var(--mascot-color);
      border-radius: 50%;
      box-shadow: inset -2px -2px 5px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .accessory-hand {
      position: absolute;
      top: -15px;
      right: -10px;
      font-size: 1.5rem;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
      animation: handGrip 2s infinite alternate;
      z-index: 10;
    }

    .mascot-shadow {
      position: absolute;
      bottom: -35px;
      left: 15%;
      width: 70%;
      height: 15px;
      background: rgba(0,0,0,0.5);
      filter: blur(10px);
      border-radius: 50%;
      animation: shadowMove 4s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0) rotateX(5deg) rotateY(0deg); }
      50% { transform: translateY(-20px) rotateX(10deg) rotateY(5deg); }
    }

    @keyframes handGrip {
      from { transform: translateY(0) rotate(-5deg); }
      to { transform: translateY(-5px) rotate(5deg); }
    }

    @keyframes earWiggle {
      0%, 90%, 100% { transform: rotate(0); }
      92% { transform: rotate(-20deg); }
      95% { transform: rotate(20deg); }
      98% { transform: rotate(-20deg); }
    }

    @keyframes shadowMove {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(0.8); opacity: 0.2; }
    }

    @keyframes blink {
      0%, 96%, 100% { transform: scaleY(1); }
      98% { transform: scaleY(0.1); }
    }

    @keyframes pulse {
      from { transform: scale(1); opacity: 1; }
      to { transform: scale(1.5); opacity: 0.6; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UIMascotComponent {
  @Input() type: MascotType = 'universal';
  @Input() color: string = '#10b981';
  @Input() secondaryColor: string = '#065f46';
  @Input() personality: MascotPersonality = 'happy';
  @Input() bodyShape: 'round' | 'square' | 'capsule' | 'tri' = 'round';
  @Input() eyesType: 'dots' | 'joy' | 'shades' = 'dots';
  @Input() mouthType: 'smile' | 'line' | 'o' = 'line';
}
