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

export interface HierarchicalComboboxItem {
  readonly id: string | number;
  readonly name: string;
  readonly depth?: number;
  readonly parentPath?: string;
  readonly searchText?: string;
  readonly children?: readonly HierarchicalComboboxItem[];
}

interface HierarchicalComboboxOption {
  readonly id: string | number;
  readonly name: string;
  readonly depth: number;
  readonly parentPath: string;
  readonly searchText: string;
}

@Component({
  selector: 'hierarchical-combobox',
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
                  @if (option.parentPath) {
                    <span class="block truncate text-xs text-muted-foreground">
                      {{ option.parentPath }}
                    </span>
                  }
                </span>
              </hlm-combobox-item>
            }
          </div>

          <div hlmComboboxEmpty>{{ emptyText() }}</div>
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
export class HierarchicalCombobox
  implements FormValueControl<string | number | null>
{
  readonly items = input.required<readonly HierarchicalComboboxItem[]>();
  readonly label = input('Opción');
  readonly inputId = input('hierarchical-combobox');
  readonly placeholder = input('Seleccione una opción');
  readonly emptyText = input('Sin resultados.');
  readonly disabled = input(false);

  readonly value = model<string | number | null>(null);

  private readonly hierarchicalOptions = computed<
    readonly HierarchicalComboboxOption[]
  >(() => this.flattenItems(this.items()));

  protected readonly options = this.hierarchicalOptions;

  readonly selectedOption = computed(
    () =>
      this.hierarchicalOptions().find(
        (option) => option.id === this.value(),
      ) ?? null,
  );

  readonly optionToString = (option: HierarchicalComboboxOption): string =>
    option.name;
  readonly filterOption = (
    option: HierarchicalComboboxOption,
    search: string,
  ): boolean => option.searchText.includes(this.normalizeSearchText(search));
  readonly isSameOption = (
    option: HierarchicalComboboxOption,
    selected: HierarchicalComboboxOption | null | undefined,
  ): boolean => option.id === selected?.id;

  selectOption(option: HierarchicalComboboxOption | null | undefined): void {
    this.value.set(option?.id ?? null);
  }

  private flattenItems(
    items: readonly HierarchicalComboboxItem[],
    ancestorNames: readonly string[] = [],
  ): HierarchicalComboboxOption[] {
    return items.flatMap((item) => {
      const path = [...ancestorNames, item.name];
      const parentPath = item.parentPath ?? ancestorNames.join(' / ');
      const depth = item.depth ?? ancestorNames.length;
      return [
        {
          id: item.id,
          name: item.name,
          depth,
          parentPath,
          searchText: this.normalizeSearchText(
            item.searchText ?? path.join(' / '),
          ),
        },
        ...this.flattenItems(item.children ?? [], path),
      ];
    });
  }

  private normalizeSearchText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLocaleLowerCase()
      .trim();
  }
}
