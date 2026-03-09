import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PortalDocumentResponse } from '../../../interfaces';

@Component({
  selector: 'landing-documents-section',
  imports: [CommonModule, RouterModule],
  template: `
    <section class="py-14 sm:py-16 lg:py-20">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div
          class="mb-8 flex flex-col gap-6 md:mb-10 md:flex-row md:items-end md:justify-between"
        >
          <div class="max-w-3xl">
            <span
              class="inline-flex rounded-full border border-primary-200/80 bg-primary-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary-700"
            >
              Documentos
            </span>

            <h2
              class="mt-4 text-3xl font-semibold tracking-tight text-surface-950 sm:text-4xl"
            >
              Documentos m&aacute;s descargados
            </h2>

            <p class="mt-3 max-w-2xl text-sm leading-7 text-surface-600 sm:text-base">
              Normativas, recursos y archivos de consulta frecuente disponibles
              para descarga inmediata.
            </p>
          </div>

          <a
            routerLink="/documents"
            class="inline-flex items-center gap-2 rounded-full border border-surface-200/90 bg-surface-0/95 px-5 py-2.5 text-sm font-semibold text-surface-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:bg-primary-50/60 hover:text-primary-700"
          >
            Ver todos
            <i class="pi pi-arrow-right text-xs"></i>
          </a>
        </div>

        <div
          class="divide-y divide-surface-200/80 overflow-hidden rounded-[1.75rem] border border-surface-200/80 bg-surface-0/90 shadow-[0_24px_70px_-50px_rgba(15,23,42,0.25)]"
        >
          <a
            *ngFor="let doc of documents()"
            [href]="doc.file.url"
            target="_blank"
            rel="noopener noreferrer"
            class="group flex flex-col gap-5 p-5 transition-all duration-200 hover:bg-primary-50/30 sm:flex-row sm:items-center sm:justify-between md:px-6"
          >
            <div class="flex min-w-0 items-center gap-4">
              <div
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-surface-200 bg-surface-50 text-surface-600 shadow-sm transition-all duration-200 group-hover:border-primary-200 group-hover:bg-primary-50 group-hover:text-primary-700"
              >
                <i class="pi pi-file-pdf"></i>
              </div>

              <div class="min-w-0">
                <h3
                  class="line-clamp-2 text-sm font-semibold leading-6 text-surface-900 transition-colors duration-200 group-hover:text-primary-700 sm:text-base"
                >
                  {{ doc.title }}
                </h3>

                <div
                  class="mt-2 flex flex-wrap items-center gap-2 text-xs text-surface-500"
                >
                  <span *ngIf="doc.type" class="rounded-full bg-surface-100 px-2.5 py-1">
                    {{ doc.type }}
                  </span>

                  <ng-container *ngIf="doc.section">
                    <span class="text-surface-300">&middot;</span>
                    <span>{{ doc.section }}</span>
                  </ng-container>

                  <ng-container *ngIf="doc.fiscalYear">
                    <span class="text-surface-300">&middot;</span>
                    <span>Gesti&oacute;n {{ doc.fiscalYear }}</span>
                  </ng-container>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-4 text-sm text-surface-500">
              <span
                class="rounded-full bg-surface-100 px-3 py-1.5 text-xs font-medium text-surface-600"
              >
                {{ doc.file.downloadCount }} descargas
              </span>

              <span
                class="flex h-10 w-10 items-center justify-center rounded-full bg-surface-900 text-white transition-all duration-200 group-hover:translate-x-0.5 group-hover:bg-primary-700"
              >
                <i class="pi pi-download text-xs"></i>
              </span>
            </div>
          </a>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingDocumentsSection {
  documents = input.required<PortalDocumentResponse[]>();
}
