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
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { FloatLabelModule } from 'primeng/floatlabel';
import { SelectModule } from 'primeng/select';

type YearOption = {
  label: string;
  value: number;
};

@Component({
  selector: 'year-selector',
  imports: [FloatLabelModule, SelectModule, FormsModule],
  template: `
    <p-floatlabel class="w-full" variant="on">
      <p-select
        [inputId]="inputId()"
        class="w-full"
        appendTo="body"
        [options]="yearOptions()"
        optionLabel="label"
        optionValue="value"
        [filter]="filter()"
        [showClear]="showClear()"
        [filterPlaceholder]="filterPlaceholder()"
        [emptyMessage]="emptyMessage()"
        [disabled]="isDisabled()"
        [ngModel]="value()"
        (ngModelChange)="onYearChange($event)"
        (onBlur)="onBlur()"
      />

      <label [for]="inputId()">{{ label() }}</label>
    </p-floatlabel>
  `,
  host: {
    class: 'block w-full min-w-0',
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
  readonly inputId = input('yearInput');

  readonly minYear = input(2000);
  readonly maxYear = input(new Date().getFullYear() + 1);

  readonly showClear = input(true);
  readonly filter = input(true);
  readonly emptyMessage = input('Sin elementos');
  readonly filterPlaceholder = input('Buscar gestión');

  /**
   * Signal Forms necesita esta propiedad con este nombre: value.
   */
  readonly value = model<number | null>(null);

  /**
   * Signal Forms puede sincronizar disabled si existe este input.
   */
  readonly disabled = input(false);

  /**
   * Reactive Forms usa setDisabledState().
   */
  private readonly cvaDisabled = signal(false);

  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  readonly yearSelected = output<number | null>();

  readonly yearOptions = computed<YearOption[]>(() =>
    this.buildYearOptions(this.minYear(), this.maxYear()),
  );

  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  /**
   * Reactive Forms: setValue, patchValue, reset, etc.
   * Importante: aceptar null.
   */
  writeValue(value: number | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  onYearChange(value: number | null): void {
    /**
     * Signal Forms lee/escribe este model().
     */
    this.value.set(value);

    /**
     * Reactive Forms necesita esta llamada.
     */
    this.onChange(value);

    /**
     * Uso externo opcional.
     */
    this.yearSelected.emit(value);
  }

  onBlur(): void {
    /**
     * Reactive Forms.
     */
    this.onTouched();

    /**
     * Opcional: si luego quieres exponer touched para Signal Forms,
     * puedes agregar touch = output<void>().
     */
  }

  private buildYearOptions(minYear: number, maxYear: number): YearOption[] {
    return Array.from({ length: maxYear - minYear + 1 }, (_, index) => {
      const year = maxYear - index;

      return {
        label: String(year),
        value: year,
      };
    });
  }
}
