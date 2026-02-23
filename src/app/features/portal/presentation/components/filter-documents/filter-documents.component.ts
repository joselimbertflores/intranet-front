import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  output,
  Signal,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

import { FloatLabelModule } from 'primeng/floatlabel';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { DatePicker } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { PanelModule } from 'primeng/panel';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { PortalDataSource } from '../../../services';
import { DocumentDataSource } from '../../../../administration/document-records/services/document-data-source';

@Component({
  selector: 'filter-documents',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SelectModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    FloatLabelModule,
    DatePicker,
    PanelModule,
    ToggleButtonModule,
  ],
  template: `
    <p-panel [toggleable]="true" style="border: none;">
      <ng-template #header>
        <span class="font-medium">Filtros </span>
        <!-- <div class="flex items-center gap-2">
          <p-togglebutton
            [(ngModel)]="isAdvancedMode"
            onLabel="Filtro: Avanzado"
            offLabel="Filtro: Simple"
            class="w-40"
          />
        </div> -->
      </ng-template>

      <ng-template #footer>
        <div class="flex justify-end gap-x-2">
          <button
            pButton
            label="Limpiar"
            text="true"
            (click)="reset()"
            size="small"
            type="button"
          ></button>
          <button
            pButton
            label="Buscar"
            size="small"
            type="submit"
            (click)="applyFilter()"
          ></button>
        </div>
      </ng-template>
      <div class="mt-2">
        <form [formGroup]="filterForm()" (ngSubmit)="applyFilter()">
          <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div class="md:col-span-2">
              <p-iconfield>
                <p-inputicon class="pi pi-search" />
                <input
                  pInputText
                  id="term"
                  class="w-full"
                  autocomplete="off"
                  placeholder="Nombre del documento"
                  formControlName="term"
                />
              </p-iconfield>
            </div>

            <div class="md:col-span-2">
              <!-- <p-select
                [filter]="true"
                [options]="sections()"
                placeholder="Sección documento"
                emptyFilterMessage="Sin resultados"
                optionValue="id"
                optionLabel="name"
                [showClear]="true"
                class="w-full"
                formControlName="sectionId"
                (onChange)="selectSection($event.value)"
              ></p-select> -->
            </div>

            <div class="md:col-span-2">
              <p-select
                [filter]="true"
                [options]="types()"
                placeholder="Tipo documento"
                emptyFilterMessage="Sin resultados"
                emptyMessage="Sin resultados"
                optionValue="id"
                optionLabel="name"
                [showClear]="true"
                class="w-full"
                formControlName="typeId"
                (onChange)="selectType($event.value)"
                [disabled]="!filterForm().value.sectionId"
              ></p-select>
            </div>

            <div class="md:col-span-2">
              <p-select
                [filter]="true"
                [options]="subtypes()"
                placeholder="Subtipo documento"
                emptyFilterMessage="Sin resultados"
                emptyMessage="Sin resultados"
                optionValue="id"
                optionLabel="name"
                [showClear]="true"
                class="w-full"
                formControlName="subtypeId"
                [disabled]="!filterForm().value.typeId"
              ></p-select>
            </div>

            <div class="md:col-span-2">
              <p-datepicker
                [maxDate]="CURRENT_DATE"
                formControlName="date"
                view="year"
                dateFormat="yy"
                appendTo="body"
                class="w-full"
                placeholder="Gestión"
              />
            </div>
            @if (isAdvancedMode()) {
              <div>
                <p-datepicker
                  [maxDate]="CURRENT_DATE"
                  formControlName="fiscalYear"
                  view="year"
                  dateFormat="yy"
                  appendTo="body"
                  class="w-full"
                  placeholder="Gestión"
                />
              </div>

              <div>
                <p-select
                  [options]="ORDER_DIRECTION_OPTIONS"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Tipo orden"
                  appendTo="body"
                  [showClear]="true"
                  class="w-full"
                  formControlName="orderDirection"
                ></p-select>
              </div>
            }
          </div>
        </form>
      </div>
    </p-panel>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterDocumentsComponent {
  private portalService = inject(PortalDataSource);

  private formBuilder = inject(FormBuilder);

  private documentDataSource = inject(DocumentDataSource);

  readonly CURRENT_DATE = new Date();

  types = signal<any[]>([]);
  subtypes = signal<any[]>([]);

  onFilter = output<object>();
  onReset = output<void>();

  // categories = this.documentDataSource.sections;
  // sections = this.documentDataSource.sections;

  filterForm: Signal<FormGroup> = computed(() => {
    return this.isAdvancedMode()
      ? this.formBuilder.group({
          term: [],
          sectionId: [],
          typeId: [],
          subtypeId: [],
          orderDirection: [],
          orderBy: [],
          fiscalYear: [this.CURRENT_DATE],
          date: [],
        })
      : this.formBuilder.group({
          term: [],
          sectionId: [],
          typeId: [],
          subtypeId: [],
          date: [],
        });
  });

  showAdvanced = signal(false);

  isAdvancedMode = signal(false);

  filterMode = signal<'simple'>;

  readonly ORDER_BY_OPTIONS = [
    { label: 'Gestión', value: 'fiscalYear' },
    { label: 'Nombre', value: 'name' },
  ];

  readonly ORDER_DIRECTION_OPTIONS = [
    { label: 'Ascendente', value: 'ASC' },
    { label: 'Descendente', value: 'DESC' },
  ];

  constructor() {}

  toggle() {
    this.showAdvanced.update((value) => !value);
  }

  selectCategory(value: number) {
    this.filterForm().get('sectionId')?.setValue(null);
    this.filterForm().get('typeId')?.setValue(null);
    this.filterForm().get('subtypeId')?.setValue(null);
    this.types.set([]);
    this.subtypes.set([]);
    // this.portalService.selectedCategoryId.set(value);
  }

  selectSection(value: number) {
    this.filterForm().patchValue({ typeId: null, subtypeId: null });
    this.types.set([]);
    this.subtypes.set([]);
    if (!value) return;
    // this.documentDataSource.getTypesBySection(value).subscribe((items) => {
    //   this.types.set(items);
    // });
  }

  selectType(value: number) {
    this.filterForm().patchValue({ subtypeId: null });
    this.subtypes.set([]);
    if (!value) return;
    // this.documentDataSource.getSubtypesByType(value).subscribe((items) => {
    //   this.subtypes.set(items);
    // });
  }

  reset() {
    this.filterForm().reset();
    this.types.set([]);
    this.subtypes.set([]);
    this.onReset.emit();
  }

  applyFilter() {
    this.onFilter.emit(this.filterForm().value);
  }
}
