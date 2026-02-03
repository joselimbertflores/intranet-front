import {
  ChangeDetectionStrategy,
  Component,
  output,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectButton } from 'primeng/selectbutton';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';

import { DocumentResponse } from '../../../interfaces';
import { PrimengFileIconPipe } from '../../../../../shared';

@Component({
  selector: 'document-list',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ButtonModule,
    SelectButton,
    DataViewModule,
    PaginatorModule,
    PrimengFileIconPipe,
  ],
  template: `
    <p-dataview #dv [value]="dataSource()" [layout]="layout">
      <ng-template #header>
        <div class="flex justify-between items-center">
          <p class="text-xl font-medium">Listado de Documentos</p>
          <p-selectbutton
            [(ngModel)]="layout"
            [options]="options"
            [allowEmpty]="false"
          >
            <ng-template #item let-item>
              <i
                class="pi "
                [ngClass]="{
                  'pi-bars': item === 'list',
                  'pi-table': item === 'grid',
                }"
              ></i>
            </ng-template>
          </p-selectbutton>
        </div>
      </ng-template>
      <ng-template #list let-items>
        @for (doc of items; track $index; let first = $first) {
          <div
            class="flex flex-col sm:flex-row sm:items-center p-2 gap-4 border border-surface-300 rounded-xl"
            [ngClass]="{ 'mt-2': !first }"
          >
            <div
              class="flex justify-center items-center md:w-20 h-20 bg-surface-100 rounded-xl"
            >
              <i
                [ngClass]="doc.originalName | primengFileIcon"
                style="font-size: 1.8rem;"
              ></i>
            </div>

            <div
              class="flex flex-col md:flex-row justify-between md:items-center flex-1 gap-4"
            >
              <div class="flex flex-col gap-1">
                <span class="text-sm">
                  {{ doc.sectionCategory.category.name | titlecase }} -
                  {{ doc.fiscalYear }}
                </span>
                <h3 class="text-lg font-semibold">
                  {{ doc.originalName }}
                </h3>
                <p class="text-sm text-surface-500">
                  Subido el {{ doc.createdAt | date: 'dd/MM/yyyy' }}
                </p>
              </div>

              <div
                class="flex flex-row sm:flex-col justify-between items-center gap-2 "
              >
                <div class="flex items-center gap-2 text-surface-600">
                  <i class="pi pi-download text-primary"></i>
                  <span class="text-sm">{{ doc.downloadCount }} descargas</span>
                </div>
                <p-button
                  icon="pi pi-arrow-down"
                  size="small"
                  label="Descargar"
                  (onClick)="download(doc)"
                />
              </div>
            </div>
          </div>
        }
      </ng-template>
      <ng-template #grid let-items>
        <div class="grid grid-cols-12 gap-4">
          @for (doc of items; track $index) {
            <div
              class="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-6 p-2"
            >
              <div
                class="p-2 border border-surface-300 rounded-xl flex flex-col"
              >
                <div class="bg-surface-50 flex justify-center rounded p-4">
                  <i
                    [ngClass]="doc.originalName | primengFileIcon"
                    style="font-size: 2.5rem;"
                  ></i>
                </div>
                <div class="pt-2">
                  <div
                    class="flex flex-row justify-between products-start gap-1"
                  >
                    <div>
                      <span class="text-sm">
                        {{ doc.sectionCategory.category.name | titlecase }} -
                        {{ doc.fiscalYear }}
                      </span>
                      <div class="text-lg mt-1 font-semibold">
                        {{ doc.originalName }}
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center justify-between mt-4">
                    <p class="text-sm text-surface-500">
                      Subido el {{ doc.createdAt | date: 'dd/MM/yyyy' }}
                    </p>
                    <p-button
                      icon="pi pi-arrow-down"
                      size="small"
                      label="Descargar"
                    />
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </ng-template>
      @if (dataSize() > 0) {
        <ng-template #footer>
          <p-paginator
            [rows]="limit()"
            [first]="offset()"
            [totalRecords]="dataSize()"
            [rowsPerPageOptions]="[10, 20, 30, 50]"
            (onPageChange)="changePage($event)"
          />
        </ng-template>
      }
      <ng-template #emptymessage>
        <div class="p-4 text-lg">No se encontraron resultados.</div>
      </ng-template>
    </p-dataview>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentListComponent {
  dataSource = input.required<DocumentResponse[]>();

  dataSize = input.required<number>();
  limit = input<number>();
  offset = input<number>(0);

  onPageChange = output<{ index: number; limit: number }>();

  onDowload = output<DocumentResponse>();

  layout: 'list' | 'grid' = 'list';

  options = ['list', 'grid'];

  changePage(event: PaginatorState) {
    this.onPageChange.emit({
      index: event.page ?? 0,
      limit: event.rows ?? 10,
    });
  }

  download(doc: DocumentResponse) {
    this.onDowload.emit(doc);
  }
}
