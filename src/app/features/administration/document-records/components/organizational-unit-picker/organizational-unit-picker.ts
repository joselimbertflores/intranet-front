import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { HlmComboboxImports } from '@spartan-ng/helm/combobox';

export interface OrganizationalUnitOption {
  id: string;
  name: string;
  depth: number;
  searchText: string;
}

interface PickerOption {
  id: string | null;
  name: string;
  depth: number;
  searchText: string;
}

const INSTITUTIONAL_OPTION: PickerOption = {
  id: null,
  name: 'Institucional / transversal',
  depth: 0,
  searchText: 'Institucional / transversal',
};

@Component({
  selector: 'organizational-unit-picker',
  imports: [HlmComboboxImports],
  template: `
    <hlm-combobox
      class="w-full"
      [disabled]="disabled()"
      [filter]="filterOption"
      [itemToString]="optionToString"
      [isItemEqualToValue]="isSameOption"
      [value]="selectedOption()"
      (valueChange)="selectOption($event)"
    >
      <hlm-combobox-input
        class="w-full"
        [inputId]="inputId()"
        [placeholder]="placeholder()"
      />

      <hlm-combobox-content *hlmComboboxPortal>
        <div hlmComboboxList>
          @for (option of pickerOptions(); track option.id) {
            <hlm-combobox-item [value]="option">
              <span
                class="block min-w-0"
                [style.padding-inline-start.rem]="option.depth * 0.75"
              >
                <span class="block truncate">{{ option.name }}</span>
              </span>
            </hlm-combobox-item>
          }
        </div>

        <div hlmComboboxEmpty>Sin unidades coincidentes.</div>
      </hlm-combobox-content>
    </hlm-combobox>
  `,
  host: {
    class: 'block min-w-0',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationalUnitPicker
  implements FormValueControl<string | null>
{
  readonly options = input.required<readonly OrganizationalUnitOption[]>();
  readonly inputId = input('organizational-unit');
  readonly placeholder = input('Buscar por nombre o ruta');
  readonly disabled = input(false);

  readonly value = model<string | null>(null);

  readonly pickerOptions = computed<PickerOption[]>(() => [
    INSTITUTIONAL_OPTION,
    ...this.options(),
  ]);

  readonly selectedOption = computed(
    () =>
      this.pickerOptions().find((option) => option.id === this.value()) ??
      INSTITUTIONAL_OPTION,
  );

  readonly optionToString = (option: PickerOption): string => option.name;
  readonly filterOption = (
    option: PickerOption,
    search: string,
  ): boolean =>
    this.normalizeSearchText(option.searchText).includes(
      this.normalizeSearchText(search),
    );
  readonly isSameOption = (
    option: PickerOption,
    selected: PickerOption | null | undefined,
  ): boolean => option.id === selected?.id;

  selectOption(option: PickerOption | null | undefined): void {
    this.value.set(option?.id ?? null);
  }

  private normalizeSearchText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLocaleLowerCase()
      .trim();
  }
}
