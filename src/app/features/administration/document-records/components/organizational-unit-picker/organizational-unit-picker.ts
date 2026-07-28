import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { HlmComboboxImports } from '@spartan-ng/helm/combobox';
import { HlmFieldImports } from '@spartan-ng/helm/field';

export interface OrganizationalUnitOption {
  id: string;
  name: string;
  depth: number;
  searchText: string;
}

@Component({
  selector: 'organizational-unit-picker',
  imports: [HlmComboboxImports, HlmFieldImports],
  template: `
    <div hlmField>
      <label hlmFieldLabel [for]="inputId()">{{ label() }}</label>

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
          showClear
          [inputId]="inputId()"
          [placeholder]="placeholder()"
        />

        <hlm-combobox-content *hlmComboboxPortal>
          <div hlmComboboxList>
            @for (option of options(); track option.id) {
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

      <ng-content />
    </div>
  `,
  host: {
    class: 'block min-w-0',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationalUnitPicker implements FormValueControl<
  string | null
> {
  readonly options =
    input.required<readonly OrganizationalUnitOption[]>();
  readonly label = input('Unidad organizacional');
  readonly inputId = input('organizational-unit');
  readonly placeholder = input('Seleccione una unidad');
  readonly disabled = input(false);

  readonly value = model<string | null>(null);

  readonly selectedOption = computed(
    () =>
      this.options().find((option) => option.id === this.value()) ?? null,
  );

  readonly optionToString = (option: OrganizationalUnitOption): string =>
    option.name;
  readonly filterOption = (
    option: OrganizationalUnitOption,
    search: string,
  ): boolean =>
    this.normalizeSearchText(option.searchText).includes(
      this.normalizeSearchText(search),
    );
  readonly isSameOption = (
    option: OrganizationalUnitOption,
    selected: OrganizationalUnitOption | null | undefined,
  ): boolean => option.id === selected?.id;

  selectOption(option: OrganizationalUnitOption | null | undefined): void {
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
