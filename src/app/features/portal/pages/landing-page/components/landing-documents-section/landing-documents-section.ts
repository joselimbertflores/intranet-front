import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { PortalDocumentResponse } from '../../../../interfaces';
import { FileIcon, FileSizePipe } from '../../../../../../shared';

@Component({
  selector: 'landing-documents-section',
  imports: [RouterLink, FileIcon, FileSizePipe],
  template: `
    <section class="border-y border-surface-200/70 bg-surface-50/70 py-12 md:py-14">
      <div class="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div class="mb-6 max-w-2xl">
          <h2
            class="text-2xl font-semibold tracking-tight text-surface-950 sm:text-3xl"
          >
            Documentos más consultados
          </h2>

          <p class="mt-3 text-sm text-surface-600 sm:text-base">
            Accede rápidamente a los documentos institucionales más utilizados.
          </p>
        </div>

        <div
          class="overflow-hidden rounded-xl border border-surface-200 bg-surface-0 shadow-[0_1px_2px_rgb(15_23_42/0.05)]"
        >
          <div class="divide-y divide-surface-100">
            @for (doc of visibleDocuments(); track doc.id) {
              <article
                class="grid gap-3 px-4 py-4 transition-colors hover:bg-surface-50 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5"
              >
                <div class="flex min-w-0 gap-3">
                  <span
                    class="grid size-11 shrink-0 place-items-center rounded-lg bg-surface-100 ring-1 ring-inset ring-surface-200"
                    aria-hidden="true"
                  >
                    <file-icon
                      [fileName]="doc.file.name"
                      [mimeType]="doc.file.mimeType"
                    />
                  </span>

                  <div class="min-w-0">
                    <h3
                      class="line-clamp-2 text-sm font-semibold leading-5 text-surface-950 sm:text-base"
                      [title]="doc.title"
                    >
                      {{ doc.title }}
                    </h3>

                    <div
                      class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-surface-500"
                    >
                      @if (documentCategory(doc)) {
                        <span
                          class="max-w-full truncate font-semibold text-primary-700"
                        >
                          {{ documentCategory(doc) }}
                        </span>
                      }

                      @if (doc.organizationalUnit) {
                        <span class="inline-flex items-center gap-1">
                          <i class="pi pi-building text-[10px]" aria-hidden="true"></i>
                          <span>{{ doc.organizationalUnit }}</span>
                        </span>
                      }

                      @if (doc.year) {
                        <span class="inline-flex items-center gap-1">
                          <i class="pi pi-calendar text-[10px]" aria-hidden="true"></i>
                          <span>Gestión {{ doc.year }}</span>
                        </span>
                      }
                    </div>
                  </div>
                </div>

                <div
                  class="flex flex-wrap items-center justify-between gap-3 pl-14 sm:justify-end sm:pl-0"
                >
                  <div
                    class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-surface-500"
                  >
                    <span class="inline-flex items-center gap-1">
                      <i class="pi pi-download text-[10px]" aria-hidden="true"></i>
                      <span>{{ doc.downloadCount }} descargas</span>
                    </span>
                    <span>{{ doc.file.size | fileSize }}</span>
                  </div>

                  <a
                    [href]="doc.file.downloadUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex min-h-9 items-center gap-2 rounded-lg bg-primary-600 px-3.5 text-sm font-semibold text-white no-underline shadow-sm transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
                    [attr.aria-label]="'Descargar ' + doc.title"
                  >
                    <i class="pi pi-download text-xs" aria-hidden="true"></i>
                    Descargar
                  </a>
                </div>
              </article>
            }
          </div>
        </div>

        <div
          class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          @if (documents().length > visibleDocuments().length) {
            <p
              class="text-xs font-medium text-surface-500"
              aria-label="Cantidad de documentos mostrados"
            >
              Mostrando {{ visibleDocuments().length }} de
              {{ documents().length }} documentos consultados.
            </p>
          } @else {
            <span aria-hidden="true"></span>
          }

          <a
            routerLink="/documents"
            class="group inline-flex w-fit items-center gap-2 rounded-lg border border-surface-300 bg-surface-0 px-4 py-2.5 text-sm font-semibold text-surface-800 shadow-sm transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
          >
            Ver todos los documentos
            <i
              class="pi pi-arrow-right text-xs transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            ></i>
          </a>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingDocumentsSection {
  readonly documents = input.required<PortalDocumentResponse[]>();

  readonly visibleDocuments = computed(() => this.documents().slice(0, 8));

  documentCategory(document: PortalDocumentResponse): string {
    return [document.documentType, document.documentSubtype]
      .filter(Boolean)
      .join(' / ');
  }
}
