import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  output,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { SelectModule } from 'primeng/select';

type YearOption = {
  label: string;
  value: number;
};

@Component({
  selector: 'app-year-selector',
  imports: [FloatLabelModule, SelectModule, FormsModule],
  template: `
    <p-floatlabel class="w-full" variant="on">
      <p-select
        [inputId]="inputId()"
        class="w-full"
        appendTo="body"
        [options]="yearOptions"
        optionLabel="label"
        optionValue="value"
        [filter]="filter()"
        [showClear]="showClear()"
        [filterPlaceholder]="filterPlaceholder()"
        [emptyMessage]="emptyMessage()"
        [disabled]="disabled"
        [ngModel]="selectedYear"
        (ngModelChange)="onYearChange($event)"
        (onBlur)="onBlur()"
      />

      <label [for]="inputId()">{{ label() }}</label>
    </p-floatlabel>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => YearSelector),
      multi: true,
    },
  ],
})
export class YearSelector implements ControlValueAccessor {
  readonly label = input('Gestión');
  readonly inputId = input('yearInput');

  readonly minYear = input(2000);
  readonly maxYear = input(new Date().getFullYear() + 1);

  readonly showClear = input(true);
  readonly filter = input(true);
  readonly emptyMessage = input('Sin elementos');
  readonly filterPlaceholder = input('Buscar gestión');

  readonly yearSelected = output<number | null>();

  selectedYear: number | null = null;
  disabled = false;

  get yearOptions(): YearOption[] {
    return this.buildYearOptions(this.minYear(), this.maxYear());
  }

  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: number | null): void {
    this.selectedYear = value;
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onYearChange(value: number | null): void {
    this.selectedYear = value;

    // Para Reactive Forms
    this.onChange(value);

    // Para uso suelto o lógica adicional
    this.yearSelected.emit(value);
  }

  onBlur(): void {
    this.onTouched();
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
