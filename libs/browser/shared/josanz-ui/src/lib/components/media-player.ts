import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import type { JosanzControlShape } from '../josanz-control-styles';
import { JosanzThemeService } from '../services/theme.service';

@Component({
  selector: 'josanz-video-player',
  standalone: true,
  imports: [CommonModule],
  template: `
    <figure
      class="m-0 overflow-hidden border border-solid"
      [ngClass]="cornerClass()"
      [ngStyle]="shellStyles()"
    >
      <video
        class="aspect-video w-full object-cover"
        [src]="src"
        [poster]="poster"
        [controls]="controls"
        [muted]="muted"
        [autoplay]="autoplay"
        [attr.aria-label]="ariaLabel || title"
      ></video>
      @if (title || description) {
        <figcaption class="p-4">
          @if (title) {
            <strong
              class="block text-sm font-black"
              [style.color]="'var(--josanz-text)'"
              >{{ title }}</strong
            >
          }
          @if (description) {
            <span
              class="mt-1 block text-sm"
              [style.color]="'var(--josanz-text-muted)'"
              >{{ description }}</span
            >
          }
        </figcaption>
      }
    </figure>
  `,
})
export class VideoPlayerComponent {
  readonly themeService = inject(JosanzThemeService);

  @Input() src = '';
  @Input() poster = '';
  @Input() title = '';
  @Input() description = '';
  @Input() controls = true;
  @Input() muted = false;
  @Input() autoplay = false;
  @Input() shape?: JosanzControlShape;
  @Input() ariaLabel = '';

  cornerClass(): string {
    const shape = this.shape ?? this.themeService.currentTheme().defaultShape;
    return shape === 'square'
      ? 'rounded-none'
      : shape === 'pill'
        ? 'rounded-[32px]'
        : 'rounded-3xl';
  }

  shellStyles(): Record<string, string> {
    const atmosphere = this.themeService.currentTheme().atmosphere;
    return {
      backgroundColor: atmosphere.surface,
      borderColor: atmosphere.border,
      boxShadow: atmosphere.shadow,
    };
  }
}

@Component({
  selector: 'josanz-audio-player',
  standalone: true,
  imports: [CommonModule],
  template: `
    <figure
      class="m-0 rounded-3xl border border-solid p-4"
      [ngStyle]="shellStyles()"
    >
      @if (title || description) {
        <figcaption class="mb-3">
          @if (title) {
            <strong
              class="block text-sm font-black"
              [style.color]="'var(--josanz-text)'"
              >{{ title }}</strong
            >
          }
          @if (description) {
            <span
              class="mt-1 block text-sm"
              [style.color]="'var(--josanz-text-muted)'"
              >{{ description }}</span
            >
          }
        </figcaption>
      }
      <audio
        class="w-full"
        [src]="src"
        [controls]="controls"
        [attr.aria-label]="ariaLabel || title"
      ></audio>
    </figure>
  `,
})
export class AudioPlayerComponent {
  readonly themeService = inject(JosanzThemeService);

  @Input() src = '';
  @Input() title = '';
  @Input() description = '';
  @Input() controls = true;
  @Input() ariaLabel = '';

  shellStyles(): Record<string, string> {
    const atmosphere = this.themeService.currentTheme().atmosphere;
    return {
      backgroundColor: atmosphere.surface,
      borderColor: atmosphere.border,
      boxShadow: atmosphere.shadow,
    };
  }
}
