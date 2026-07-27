import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmSelectImports } from '@spartan-ng/helm/select';

interface YearOption {
  label: string;
  value: number;
}

@Component({
  selector: 'year-selector',
  imports: [HlmFieldImports, HlmSelectImports],
  template: `
    <div hlmField>
      <label hlmFieldLabel [for]="inputId()">{{ label() }}</label>

      <hlm-select
        [disabled]="isDisabled()"
        [value]="value()"
        (valueChange)="onYearChange($event)"
      >
        <hlm-select-trigger class="w-full" [buttonId]="inputId()">
          <hlm-select-value />
          <hlm-select-placeholder>Sin gestión</hlm-select-placeholder>
        </hlm-select-trigger>

        <hlm-select-content *hlmSelectPortal class="max-h-72">
          <hlm-select-group>
            @if (showClear()) {
              <hlm-select-item [value]="null">Sin gestión</hlm-select-item>
            }

            @for (option of yearOptions(); track option.value) {
              <hlm-select-item [value]="option.value">
                {{ option.label }}
              </hlm-select-item>
            }
          </hlm-select-group>
        </hlm-select-content>
      </hlm-select>
    </div>
  `,
  host: {
    class: 'block w-full min-w-0',
    '(focusout)': 'markAsTouched()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => YearSelector),
      multi: true,
    },
  ],
})
export class YearSelector
  implements FormValueControl<number | null>, ControlValueAccessor
{
  readonly label = input('Gestión');
  readonly inputId = input('year-input');
  readonly minYear = input(2000);
  readonly maxYear = input(new Date().getFullYear() + 1);
  readonly showClear = input(true);
  readonly disabled = input(false);

  readonly value = model<number | null>(null);
  readonly touch = output<void>();
  readonly yearSelected = output<number | null>();

  private readonly cvaDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  readonly yearOptions = computed<YearOption[]>(() =>
    this.buildYearOptions(this.minYear(), this.maxYear()),
  );

  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  onYearChange(value: number | null | undefined): void {
    const selectedYear = value ?? null;
    this.value.set(selectedYear);
    this.onChange(selectedYear);
    this.yearSelected.emit(selectedYear);
  }

  markAsTouched(): void {
    this.touch.emit();
    this.onTouched();
  }

  writeValue(value: number | null): void {
    this.value.set(value);
  }

  registerOnChange(onChange: (value: number | null) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  private buildYearOptions(minYear: number, maxYear: number): YearOption[] {
    return Array.from({ length: maxYear - minYear + 1 }, (_, index) => {
      const year = maxYear - index;
      return { label: String(year), value: year };
    });
  }
}
