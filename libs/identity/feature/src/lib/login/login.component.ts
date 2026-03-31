import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthStore } from '@josanz-erp/identity-data-access';
import { UiInputComponent, UiButtonComponent, UiAlertComponent } from '@josanz-erp/shared-ui-kit';
import { LucideAngularModule, User, Lock, ArrowRight, Sparkles, Palette, Zap, Waves } from 'lucide-angular';
import { AnimatedBackgroundComponent, BackgroundTheme } from '../animated-background/animated-background.component';

interface BackgroundThemeOption {
  id: BackgroundTheme;
  name: string;
  icon: typeof Palette | typeof Zap | typeof Sparkles | typeof Waves;
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

  readonly icons = { User, Lock, ArrowRight, Sparkles, Palette, Zap, Waves };
  
  readonly backgroundTheme = signal<BackgroundTheme>('josanz-classic');
  
  readonly themes: BackgroundThemeOption[] = [
    { id: 'josanz-classic', name: 'Josanz Classic', icon: Palette, color: '#dc2626' },
    { id: 'cyber-neon', name: 'Cyber Neon', icon: Zap, color: '#06b6d4' },
    { id: 'golden-vintage', name: 'Golden Vintage', icon: Sparkles, color: '#f59e0b' },
    { id: 'deep-abyss', name: 'Deep Abyss', icon: Waves, color: '#1e3a8a' }
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
