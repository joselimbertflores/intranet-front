import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-directory-section',
  imports: [CommonModule, AccordionModule, ButtonModule],
  template: `
    <!-- directory-section-accordion.component.html -->
    <div class="bg-white rounded-xl border">

    
     
      <p-accordion [multiple]="true">
        <p-accordion-panel>
          <p-accordion-panel value="0">
            <div class="flex items-center justify-between w-full">
              <div class="font-bold">{{ section.name }}</div>
              <div class="text-xs text-gray-500">
                <ng-container *ngIf="(section.contacts?.length ?? 0) > 0">
                  {{ section.contacts.length }} contacto(s)
                </ng-container>
              </div>
            </div>
          </p-accordion-panel>
           <p-accordion-content>  
            sd
           </p-accordion-content>

          <!-- Contactos directos de la sección -->
          <div *ngIf="(section.contacts?.length ?? 0) > 0" class="space-y-2">
            <div
              *ngFor="let c of section.contacts"
              class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-3 rounded-lg border bg-gray-50"
            >
              <div class="font-medium">{{ c.title }}</div>

              <div class="flex flex-wrap gap-2 items-center">
                <span class="text-sm text-gray-700">
                  <span class="text-gray-500">Int:</span>
                  {{ c.internalPhone || '—' }}
                </span>
                <p-button
                  icon="pi pi-copy"
                  severity="secondary"
                  size="small"
                  [disabled]="!c.internalPhone"
                  (onClick)="copy(c.internalPhone)"
                  pTooltip="Copiar interno"
                ></p-button>

                <span class="text-sm text-gray-700 ml-2">
                  <span class="text-gray-500">Ext:</span>
                  {{ c.externalPhone || '—' }}
                </span>
                <p-button
                  icon="pi pi-copy"
                  severity="secondary"
                  size="small"
                  [disabled]="!c.externalPhone"
                  (onClick)="copy(c.externalPhone)"
                  pTooltip="Copiar externo"
                ></p-button>
              </div>
            </div>
          </div>

          <!-- Hijos (Direcciones / Unidades / Áreas sueltas) -->
          <div
            *ngIf="(section.children?.length ?? 0) > 0"
            class="mt-3 space-y-3"
          >
            <app-directory-section
              *ngFor="let child of section.children"
              [section]="child"
              (copyPhone)="copyPhone.emit($event)"
            ></app-directory-section>
          </div>

          <div
            *ngIf="
              (section.contacts?.length ?? 0) === 0 &&
              (section.children?.length ?? 0) === 0
            "
            class="text-sm text-gray-500 py-2"
          >
            Sin información disponible.
          </div>
        </p-accordion-panel>
      </p-accordion>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DirectorySection {
  @Input({ required: true }) section!: any;
  @Output() copyPhone = new EventEmitter<string>();

  copy(v?: string | null) {
    if (v) this.copyPhone.emit(v);
  }
}
