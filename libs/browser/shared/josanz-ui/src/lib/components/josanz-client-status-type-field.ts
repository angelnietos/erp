import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  CLIENT_STATUS_CUSTOM_OPTION,
  listClientTariffLabels,
  resolveClientTypePillColor,
} from '../catalog/catalog-theme';
import { normalizeHexColor } from '../catalog/client-rail-presets';
import { pillFilledBadgeStyles } from '../catalog/status-pill-presets';
import { CatalogThemeFacade } from '../services/catalog-theme.facade';
import { JosanzClientRailPickerComponent } from './josanz-client-rail-picker';

@Component({
  selector: 'josanz-client-status-type-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, JosanzClientRailPickerComponent],
  template: `
    <div class="josanz-client-status-type" [formGroup]="parentForm">
      <div class="josanz-client-status-type__type-block">
        <div class="josanz-client-status-type__type-head">
          <label class="josanz-client-status-type__label" [attr.for]="selectId">
            Tipo de estado / tarifa
            <span class="text-[color:var(--josanz-danger)]" aria-hidden="true"> *</span>
          </label>
          @if (typeLabel()) {
          <span class="josanz-client-type-chip josanz-client-status-type__preview" [ngStyle]="pillPreviewStyles()">
            {{ typeLabel() }}
          </span>
          }
        </div>

        @if (customMode()) {
        <div class="josanz-client-status-type__custom">
          <input
            [id]="selectId"
            class="josanz-client-status-type__custom-input"
            type="text"
            [formControlName]="typeControlName"
            placeholder="Ej. VIP, Inactivo, Partner…"
            maxlength="48"
          />
          <button type="button" class="josanz-client-status-type__link" (click)="switchToPresetMode()">
            Volver a tipos predefinidos
          </button>
        </div>
        } @else {
        <div class="josanz-client-type-select__trigger josanz-client-status-type__trigger">
          <span class="josanz-client-type-chip josanz-client-status-type__trigger-chip" [ngStyle]="pillPreviewStyles()">
            {{ typeLabel() || 'Selecciona un tipo' }}
          </span>
          <span class="josanz-client-type-select__spacer" aria-hidden="true"></span>
          <svg
            class="josanz-client-type-select__chevron"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
          <select
            [id]="selectId"
            [value]="typeLabel()"
            aria-label="Tipo de estado / tarifa"
            (change)="onPresetSelect($event)"
          >
            @for (option of presetOptions(); track option) {
            <option [value]="option">{{ option }}</option>
            }
            <option [value]="customOption">Crear tipo personalizado…</option>
          </select>
        </div>
        }

        <p class="josanz-client-status-type__hint">
          Etiqueta que verás en la pastilla del listado de clientes.
        </p>
      </div>

      <div class="josanz-client-status-type__color-block">
        <josanz-client-rail-picker
          [parentForm]="parentForm"
          [controlName]="colorControlName"
          fieldLabel="Color de tipo / estado"
          [fieldHint]="colorHint()"
        ></josanz-client-rail-picker>

        @if (colorManual()) {
        <button type="button" class="josanz-client-status-type__link" (click)="resetColorToDefault()">
          Usar color por defecto del tipo ({{ defaultColor() }})
        </button>
        }
      </div>
    </div>
  `,
})
export class JosanzClientStatusTypeFieldComponent implements OnInit, OnDestroy {
  private readonly catalogTheme = inject(CatalogThemeFacade);
  private readonly subs: Subscription[] = [];
  private applyingDefaultColor = false;

  readonly customOption = CLIENT_STATUS_CUSTOM_OPTION;
  readonly selectId = `josanz-client-status-type-${Math.random().toString(36).slice(2, 9)}`;

  readonly customMode = signal(false);
  readonly colorManual = signal(false);
  readonly presetOptions = signal<string[]>([]);

  private readonly presetSync = effect(() => {
    const labels = listClientTariffLabels(this.catalogTheme.mergedTheme());
    this.presetOptions.set(labels);
  });

  /** Espejo reactivo del control de tipo (los computed no leen FormControl). */
  private readonly typeValue = signal('');
  /** Espejo reactivo del control de color. */
  private readonly colorValue = signal('');

  @Input({ required: true }) parentForm!: FormGroup;
  @Input() typeControlName = 'tarifa';
  @Input() colorControlName = 'colorPill';

  readonly typeLabel = computed(() => this.typeValue().trim());

  readonly defaultColor = computed(() =>
    resolveClientTypePillColor(this.typeLabel(), this.catalogTheme.mergedTheme()).toUpperCase(),
  );

  readonly pillPreviewStyles = computed(() => {
    const color =
      normalizeHexColor(this.colorValue()) ?? this.defaultColor();
    return pillFilledBadgeStyles(color);
  });

  readonly colorHint = computed(() => {
    if (this.colorManual()) {
      return 'Color personalizado. Puedes restablecer el valor por defecto del tipo.';
    }
    return `Color sugerido para «${this.typeLabel() || 'este tipo'}». Puedes cambiarlo manualmente.`;
  });

  ngOnInit(): void {
    this.catalogTheme.loadCatalogTheme();

    const typeControl = this.parentForm.get(this.typeControlName);
    const colorControl = this.parentForm.get(this.colorControlName);

    if (typeControl) {
      this.typeValue.set(String(typeControl.value ?? ''));
      this.subs.push(
        typeControl.valueChanges.subscribe((value) => {
          const next = String(value ?? '');
          this.typeValue.set(next);

          if (next === this.customOption) {
            return;
          }

          if (this.customMode()) {
            this.applyDefaultColorForType(next);
            return;
          }

          if (!this.colorManual()) {
            this.applyDefaultColorForType(next);
          }
        }),
      );
    }

    if (colorControl) {
      this.colorValue.set(String(colorControl.value ?? ''));
      this.subs.push(
        colorControl.valueChanges.subscribe((value) => {
          const next = String(value ?? '');
          this.colorValue.set(next);

          if (this.applyingDefaultColor) {
            return;
          }

          const normalized = normalizeHexColor(next);
          const expected = normalizeHexColor(this.defaultColor());
          this.colorManual.set(Boolean(normalized && expected && normalized !== expected));
        }),
      );
    }

    this.syncModeFromCurrentType();
  }

  ngOnDestroy(): void {
    for (const sub of this.subs) {
      sub.unsubscribe();
    }
  }

  onPresetSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;

    if (value === this.customOption) {
      this.customMode.set(true);
      this.colorManual.set(false);
      this.parentForm.patchValue({ [this.typeControlName]: '' });
      this.typeValue.set('');
      return;
    }

    this.customMode.set(false);
    this.colorManual.set(false);
    this.parentForm.patchValue({ [this.typeControlName]: value });
    this.typeValue.set(value);
    this.applyDefaultColorForType(value, true);
  }

  switchToPresetMode(): void {
    this.customMode.set(false);
    const fallback = this.presetOptions()[0] ?? listClientTariffLabels(this.catalogTheme.mergedTheme())[0];
    if (!fallback) {
      return;
    }
    this.colorManual.set(false);
    this.parentForm.patchValue({ [this.typeControlName]: fallback });
    this.typeValue.set(fallback);
    this.applyDefaultColorForType(fallback, true);
  }

  resetColorToDefault(): void {
    this.colorManual.set(false);
    this.applyDefaultColorForType(this.typeLabel(), true);
  }

  registerExtraTypes(labels: string[]): void {
    const merged = new Set([...this.presetOptions(), ...labels.filter(Boolean)]);
    this.presetOptions.set([...merged]);
    this.syncModeFromCurrentType();
  }

  private syncModeFromCurrentType(): void {
    const current = this.typeLabel();
    if (!current) {
      this.customMode.set(false);
      return;
    }

    const isPreset = listClientTariffLabels(this.catalogTheme.mergedTheme()).some(
      (option) => option.toLowerCase() === current.toLowerCase(),
    );
    this.customMode.set(!isPreset);

    if (!isPreset && current) {
      this.presetOptions.update((options) =>
        options.includes(current) ? options : [...options, current],
      );
    }

    const stored = normalizeHexColor(this.colorValue());
    const expected = normalizeHexColor(this.defaultColor());
    this.colorManual.set(Boolean(stored && expected && stored !== expected));
  }

  private applyDefaultColorForType(type: string, force = false): void {
    if (!force && this.colorManual()) {
      return;
    }

    const label = type.trim();
    if (!label && this.customMode()) {
      return;
    }

    const color = resolveClientTypePillColor(label, this.catalogTheme.mergedTheme());
    const normalized = color.toUpperCase();

    this.applyingDefaultColor = true;
    this.parentForm.patchValue({ [this.colorControlName]: normalized });
    this.colorValue.set(normalized);
    this.parentForm.get(this.colorControlName)?.markAsDirty();
    this.applyingDefaultColor = false;

    if (force) {
      this.colorManual.set(false);
    }
  }
}
