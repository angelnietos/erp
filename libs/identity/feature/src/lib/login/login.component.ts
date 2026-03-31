import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthStore } from '@josanz-erp/identity-data-access';
import { UiInputComponent, UiButtonComponent, UiAlertComponent } from '@josanz-erp/shared-ui-kit';
import { LucideAngularModule, User, Lock, ArrowRight, Sparkles, Palette, Zap, Waves, Cpu, Volume2, Grid, Aperture, Search, Moon } from 'lucide-angular';
import { AnimatedBackgroundComponent, BackgroundTheme } from '../animated-background/animated-background.component';

interface BackgroundThemeOption {
  id: BackgroundTheme;
  name: string;
  icon: typeof Palette | typeof Zap | typeof Sparkles | typeof Waves | typeof Cpu | typeof Volume2 | typeof Grid | typeof Aperture | typeof Search | typeof Moon;
  color: string;
}

@Component({
  selector: 'lib-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, UiInputComponent, UiButtonComponent, UiAlertComponent, AnimatedBackgroundComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  readonly store = inject(AuthStore);

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly icons = { User, Lock, ArrowRight, Sparkles, Palette, Zap, Waves, Cpu, Volume2, Grid, Aperture, Search, Moon };
  
  readonly backgroundTheme = signal<BackgroundTheme>('josanz-classic');
  
  readonly themes: BackgroundThemeOption[] = [
    { id: 'josanz-classic', name: 'Josanz Classic', icon: Palette, color: '#dc2626' },
    { id: 'cyber-neon', name: 'Cyber Neon', icon: Zap, color: '#06b6d4' },
    { id: 'golden-vintage', name: 'Golden Vintage', icon: Sparkles, color: '#f59e0b' },
    { id: 'deep-abyss', name: 'Deep Abyss', icon: Waves, color: '#1e3a8a' },
    { id: 'digital-matrix', name: 'Digital Matrix', icon: Cpu, color: '#10b981' },
    { id: 'audio-rhythm', name: 'Audio Rhythm', icon: Volume2, color: '#8b5cf6' },
    { id: 'grid-sketch', name: 'Grid Sketch', icon: Grid, color: '#3b82f6' },
    { id: 'bokeh-blur', name: 'Bokeh Blur', icon: Aperture, color: '#f43f5e' },
    { id: 'spot-scan', name: 'Spot Scan', icon: Search, color: '#facc15' },
    { id: 'nebula-cosmos', name: 'Nebula Cosmos', icon: Moon, color: '#6366f1' }
  ];

  setBackgroundTheme(theme: BackgroundTheme) {
    this.backgroundTheme.set(theme);
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.getRawValue();
      this.store.login({ email, password });
    }
  }
}
