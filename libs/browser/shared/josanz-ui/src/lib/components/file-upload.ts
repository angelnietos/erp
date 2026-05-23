import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import type { JosanzControlShape } from '../josanz-control-styles';
import { JosanzThemeService } from '../services/theme.service';

@Component({
  selector: 'josanz-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label
      class="block cursor-pointer border border-dashed p-6 text-center transition-colors"
      [ngClass]="cornerClass()"
      [ngStyle]="dropzoneStyles()"
    >
      <input
        class="sr-only"
        type="file"
        [accept]="accept"
        [multiple]="multiple"
        [disabled]="disabled"
        (change)="selectFiles($event)"
      />
      <span
        class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl"
        [style.backgroundColor]="
          'color-mix(in srgb, ' + accentColor() + ' 12%, var(--josanz-surface))'
        "
        [style.color]="accentColor()"
        aria-hidden="true"
      >
        ↑
      </span>
      <span
        class="mt-4 block text-sm font-black"
        [style.color]="'var(--josanz-text)'"
        >{{ title }}</span
      >
      <span
        class="mt-1 block text-sm"
        [style.color]="'var(--josanz-text-muted)'"
        >{{ description }}</span
      >
      @if (selectedNames.length) {
        <span
          class="mt-4 block text-xs font-bold"
          [style.color]="accentColor()"
          >{{ selectedNames.join(', ') }}</span
        >
      }
    </label>
  `,
})
export class FileUploadComponent {
  readonly themeService = inject(JosanzThemeService);

  @Input() title = 'Subir archivo';
  @Input() description = 'Arrastra o selecciona un archivo';
  @Input() accept = '';
  @Input() multiple = false;
  @Input() disabled = false;
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;

  @Output() filesSelected = new EventEmitter<File[]>();

  selectedNames: string[] = [];

  selectFiles(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    this.selectedNames = files.map((file) => file.name);
    this.filesSelected.emit(files);
  }

  cornerClass(): string {
    const shape = this.shape ?? this.themeService.currentTheme().defaultShape;
    if (shape === 'square') {
      return 'rounded-none';
    }
    if (shape === 'pill') {
      return 'rounded-[32px]';
    }
    return 'rounded-3xl';
  }

  dropzoneStyles(): Record<string, string> {
    return {
      backgroundColor: 'var(--josanz-surface)',
      borderColor: `color-mix(in srgb, ${this.accentColor()} 34%, var(--josanz-border))`,
    };
  }

  accentColor(): string {
    return this.customColor || 'var(--josanz-primary)';
  }
}
