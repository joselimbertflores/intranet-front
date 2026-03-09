import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PortalDocumentResponse } from '../../../interfaces';

@Component({
  selector: 'landing-documents-section',
  imports: [CommonModule],
  template: `
    <section class="py-16 md:py-24">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <!-- Header -->
        <div
          class="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          <div class="max-w-3xl">
            <span
              class="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-700 ring-1 ring-inset ring-primary-700/10"
            >
              Documentos
            </span>

            <h2
              class="mt-4 text-3xl font-semibold tracking-tight text-surface-900 sm:text-4xl"
            >
              Documentos más descargados
            </h2>

            <p class="mt-3 text-sm text-surface-600 sm:text-base">
              Normativas, recursos y archivos de consulta frecuente disponibles
              para descarga inmediata.
            </p>
          </div>

          <a
            routerLink="/documents"
            class="inline-flex items-center gap-2 rounded-full ring-1 ring-inset ring-surface-200 bg-surface-0 px-5 py-2.5 text-sm font-semibold text-surface-700 shadow-sm transition hover:ring-surface-300 hover:bg-surface-50 hover:text-surface-900"
          >
            Ver todos
            <i class="pi pi-arrow-right text-xs"></i>
          </a>
        </div>

        <!-- Document list -->
        <div
          class="divide-y divide-surface-100 rounded-xl border border-surface-200 bg-surface-0 overflow-hidden"
        >
          <a
            *ngFor="let doc of documents()"
            [href]="doc.file.url"
            target="_blank"
            rel="noopener noreferrer"
            class="group flex flex-col gap-4 p-5 transition-colors duration-200 hover:bg-surface-50/50 sm:flex-row sm:items-center sm:justify-between"
          >
            <!-- Left -->
            <div class="flex min-w-0 items-center gap-4">
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-surface-100 text-surface-600 transition group-hover:bg-primary-50 group-hover:text-primary-700"
              >
                <i class="pi pi-file-pdf"></i>
              </div>

              <div class="min-w-0">
                <h3
                  class="truncate text-sm font-semibold text-surface-900 group-hover:text-primary-700 sm:text-base"
                >
                  {{ doc.title }}
                </h3>

                <div
                  class="mt-1 flex flex-wrap items-center gap-2 text-xs text-surface-500"
                >
                  <span *ngIf="doc.type">
                    {{ doc.type }}
                  </span>

                  <span *ngIf="doc.section"> • {{ doc.section }} </span>

                  <span *ngIf="doc.fiscalYear">
                    • Gestión {{ doc.fiscalYear }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Right -->
            <div class="flex items-center gap-5 text-sm text-surface-500">
              <span class="text-xs font-medium">
                {{ doc.file.downloadCount }} descargas
              </span>

              <span
                class="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-900 text-white transition group-hover:bg-primary-700"
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
