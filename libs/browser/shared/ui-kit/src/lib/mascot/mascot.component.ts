import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type MascotType = 'inventory' | 'budget' | 'clients' | 'projects' | 'fleet' | 'rentals' | 'audit' | 'universal';

@Component({
  selector: 'ui-josanz-mascot',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mascot-container" [class]="'type-' + type" [style.--mascot-color]="color">
      <div class="mascot-body-wrapper">
        <!-- Floating Glow -->
        <div class="mascot-glow"></div>
        
        <!-- Main Body -->
        <div class="mascot-body">
          <!-- Digital Eyes -->
          <div class="eyes-container">
            <div class="eye left">
              <div class="pupil"></div>
            </div>
            <div class="eye right">
              <div class="pupil"></div>
            </div>
          </div>
          
          <!-- Accessory based on type -->
          <div class="accessory" [ngSwitch]="type">
            <div *ngSwitchCase="'inventory'" class="acc-box"></div>
            <div *ngSwitchCase="'budget'" class="acc-calc"></div>
            <div *ngSwitchCase="'clients'" class="acc-heart"></div>
            <div *ngSwitchCase="'projects'" class="acc-clapper"></div>
            <div *ngSwitchCase="'fleet'" class="acc-wheel"></div>
            <div *ngSwitchCase="'rentals'" class="acc-key"></div>
            <div *ngSwitchCase="'audit'" class="acc-glass"></div>
          </div>
          
          <!-- Mouth / Screen -->
          <div class="screen-light"></div>
        </div>
        
        <!-- Arms / Connectors -->
        <div class="arm left"></div>
        <div class="arm right"></div>
        
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
      perspective: 1000px;
    }

    .mascot-body-wrapper {
      position: relative;
      width: 100px;
      height: 100px;
      transform-style: preserve-3d;
      animation: float 4s ease-in-out infinite;
    }

    .mascot-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 120%;
      height: 120%;
      background: radial-gradient(circle, var(--mascot-color, #10b981) 0%, transparent 70%);
      opacity: 0.2;
      filter: blur(20px);
      border-radius: 50%;
    }

    .mascot-body {
      position: relative;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border-radius: 24px;
      border: 2px solid rgba(255, 255, 255, 0.1);
      box-shadow: 
        inset 0 0 20px rgba(0,0,0,0.5),
        0 10px 30px rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .eyes-container {
      display: flex;
      gap: 15px;
      margin-top: -10px;
    }

    .eye {
      width: 18px;
      height: 18px;
      background: #000;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .pupil {
      width: 8px;
      height: 8px;
      background: var(--mascot-color, #10b981);
      border-radius: 50%;
      box-shadow: 0 0 10px var(--mascot-color);
      animation: blink 5s infinite;
    }

    .screen-light {
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 20%;
      background: linear-gradient(to top, var(--mascot-color, #10b981) 0%, transparent 100%);
      opacity: 0.1;
    }

    .accessory {
      margin-top: 15px;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Accessory Visuals */
    .acc-box { width: 20px; height: 16px; border: 2px solid var(--mascot-color); border-radius: 2px; }
    .acc-calc { width: 18px; height: 22px; background: rgba(255,255,255,0.1); border-radius: 3px; position: relative; }
    .acc-calc::before { content: ''; position: absolute; top: 3px; left: 3px; right: 3px; height: 5px; background: var(--mascot-color); opacity: 0.5; }
    
    .arm {
      position: absolute;
      top: 40%;
      width: 15px;
      height: 40px;
      background: #1e293b;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .arm.left { left: -10px; transform: rotate(-10deg); }
    .arm.right { right: -10px; transform: rotate(10deg); }

    .mascot-shadow {
      position: absolute;
      bottom: -40px;
      left: 10%;
      width: 80%;
      height: 20px;
      background: rgba(0,0,0,0.4);
      filter: blur(8px);
      border-radius: 50%;
      animation: shadow 4s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0) rotateX(5deg); }
      50% { transform: translateY(-15px) rotateX(10deg); }
    }

    @keyframes shadow {
      0%, 100% { transform: scale(1); opacity: 0.4; }
      50% { transform: scale(0.85); opacity: 0.2; }
    }

    @keyframes blink {
      0%, 95%, 100% { transform: scaleY(1); }
      97.5% { transform: scaleY(0); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UIMascotComponent {
  @Input() type: MascotType = 'universal';
  @Input() color: string = '#10b981';
}
