import { Component, signal, inject, viewChild, ElementRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ImageConfig {
  file: File | null;
  previewUrl: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  alignment: 'left' | 'center' | 'right';
  borderRadius: number;
  shadow: boolean;
}

@Component({
  selector: 'app-image-insert',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [
    `
      .image-upload-zone {
        border: 2px dashed #cbd5e1;
        border-radius: 12px;
        padding: 2rem;
        text-align: center;
        cursor: pointer;
        transition: all 0.15s;
        background: #f8fafc;
      }

      .image-upload-zone:hover {
        border-color: #3b82f6;
        background: #eff6ff;
      }

      .image-upload-zone.drag-over {
        border-color: #3b82f6;
        background: #dbeafe;
        transform: scale(1.01);
      }

      .image-upload-icon {
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
      }

      .image-preview {
        position: relative;
        display: inline-block;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .image-preview img {
        display: block;
        max-width: 100%;
        height: auto;
      }

      .image-remove-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 28px;
        height: 28px;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.875rem;
        transition: background 0.15s;
      }

      .image-remove-btn:hover {
        background: rgba(239, 68, 68, 0.9);
      }

      .form-group {
        margin-bottom: 0.75rem;
      }

      .form-group label {
        display: block;
        font-size: 0.75rem;
        font-weight: 600;
        color: #64748b;
        margin-bottom: 0.25rem;
      }

      .form-group input[type='text'],
      .form-group input[type='number'] {
        width: 100%;
        padding: 0.5rem 0.625rem;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        font-size: 0.875rem;
      }

      .alignment-options {
        display: flex;
        gap: 0.375rem;
      }

      .alignment-option {
        flex: 1;
        padding: 0.5rem;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        text-align: center;
        cursor: pointer;
        transition: all 0.15s;
      }

      .alignment-option:hover {
        border-color: #3b82f6;
      }

      .alignment-option.active {
        border-color: #3b82f6;
        background: #eff6ff;
        color: #1d4ed8;
      }
    `,
  ],
  template: `
    <div class="space-y-4">
      @if (!imagePreviewUrl()) {
        <div
          class="image-upload-zone"
          [class.drag-over]="isDragOver()"
          (click)="fileInput.click()"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
        >
          <div class="image-upload-icon">📷</div>
          <p class="text-sm text-slate-600 font-medium">Arrastra una imagen aquí</p>
          <p class="text-xs text-slate-400 mt-1">o haz clic para seleccionar</p>
          <p class="text-xs text-slate-400 mt-2">PNG, JPG, GIF, SVG hasta 5MB</p>
        </div>
        <input
          #fileInput
          type="file"
          hidden
          accept="image/*"
          (change)="onFileSelected($event)"
        />
      } @else {
        <div class="image-preview" [style.text-align]="imageConfig().alignment">
          <img
            [src]="imagePreviewUrl()"
            [alt]="imageConfig().alt"
            [style.max-width.px]="imageConfig().width || undefined"
            [style.border-radius.px]="imageConfig().borderRadius"
            [style.box-shadow]="imageConfig().shadow ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'"
          />
          <button class="image-remove-btn" (click)="removeImage()">✕</button>
        </div>

        @if (imageConfig().caption) {
          <p
            class="text-sm text-slate-500 italic mt-2"
            [style.text-align]="imageConfig().alignment"
          >
            {{ imageConfig().caption }}
          </p>
        }

        <div class="grid grid-cols-2 gap-3">
          <div class="form-group">
            <label>Texto alternativo</label>
            <input
              type="text"
              [(ngModel)]="imageConfig().alt"
              placeholder="Descripción de la imagen"
            />
          </div>
          <div class="form-group">
            <label>Pie de foto</label>
            <input
              type="text"
              [(ngModel)]="imageConfig().caption"
              placeholder="Opcional"
            />
          </div>
        </div>

        <div class="form-group">
          <label>Alineación</label>
          <div class="alignment-options">
            @for (align of alignments; track align.id) {
              <div
                class="alignment-option"
                [class.active]="imageConfig().alignment === align.id"
                (click)="imageConfig.update((c) => ({ ...c, alignment: align.id }))"
              >
                {{ align.label }}
              </div>
            }
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div class="form-group">
            <label>Ancho (px)</label>
            <input
              type="number"
              [(ngModel)]="imageConfig().width"
              min="50"
              max="2000"
              placeholder="Auto"
            />
          </div>
          <div class="form-group">
            <label>Borde redondeado</label>
            <input
              type="number"
              [(ngModel)]="imageConfig().borderRadius"
              min="0"
              max="50"
              placeholder="0"
            />
          </div>
          <div class="form-group flex items-end">
            <label class="flex items-center gap-2 cursor-pointer pb-2">
              <input
                type="checkbox"
                [(ngModel)]="imageConfig().shadow"
                class="rounded"
              />
              <span class="text-sm">Sombra</span>
            </label>
          </div>
        </div>
      }
    </div>
  `,
})
export class ImageInsertComponent {
  fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  isDragOver = signal(false);
  imagePreviewUrl = signal<string>('');
  imageConfig = signal<ImageConfig>({
    file: null,
    previewUrl: '',
    alt: '',
    caption: '',
    width: 0,
    height: 0,
    alignment: 'center',
    borderRadius: 0,
    shadow: false,
  });

  readonly alignments = [
    { id: 'left' as const, label: 'Izq.' },
    { id: 'center' as const, label: 'Centro' },
    { id: 'right' as const, label: 'Der.' },
  ];

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  private processFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      this.imagePreviewUrl.set(url);
      this.imageConfig.update((c) => ({
        ...c,
        file,
        previewUrl: url,
      }));
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.imagePreviewUrl.set('');
    this.imageConfig.update((c) => ({
      ...c,
      file: null,
      previewUrl: '',
      alt: '',
      caption: '',
    }));
    const input = this.fileInput().nativeElement;
    if (input) input.value = '';
  }

  exportToMarkdown(): string {
    const c = this.imageConfig();
    if (!c.previewUrl) return '';

    const alignClass =
      c.alignment === 'center'
        ? 'image-center'
        : c.alignment === 'right'
          ? 'image-right'
          : 'image-left';

    let md = `\n![${c.alt || 'Imagen'}](${c.previewUrl}){: .${alignClass}`;
    if (c.width) md += ` width="${c.width}"`;
    md += '}\n';

    if (c.caption) {
      md += `\n*${c.caption}*\n`;
    }

    return md;
  }

  exportToHtml(): string {
    const c = this.imageConfig();
    if (!c.previewUrl) return '';

    const alignStyle =
      c.alignment === 'center'
        ? 'display: block; margin: 0 auto;'
        : c.alignment === 'right'
          ? 'display: block; margin-left: auto;'
          : '';

    const widthAttr = c.width ? ` width="${c.width}"` : '';
    const radiusStyle = c.borderRadius ? ` border-radius: ${c.borderRadius}px;` : '';
    const shadowStyle = c.shadow ? ' box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);' : '';

    let html = `<div style="text-align: ${c.alignment}; margin: 1.5rem 0;">
  <img src="${c.previewUrl}" alt="${c.alt || 'Imagen'}"${widthAttr} style="max-width: 100%;${alignStyle}${radiusStyle}${shadowStyle}" />
</div>`;

    if (c.caption) {
      html += `\n<p style="text-align: ${c.alignment}; color: #64748b; font-size: 0.875rem; font-style: italic; margin-top: 0.5rem;">${c.caption}</p>`;
    }

    return html;
  }
}
