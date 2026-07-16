import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { FileIcon, FileSizePipe } from '../../../../../../shared';
import { PortalDocumentResponse } from '../../../../interfaces';

@Component({
  selector: 'landing-documents-section',
  imports: [RouterLink, FileIcon, FileSizePipe],
  template: `
    <section
      class="w-full bg-[var(--portal-cream)] py-14 sm:py-16 lg:py-20"
      aria-labelledby="documents-title"
    >
      <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <header class="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="documents-title"
              class="text-3xl font-extrabold tracking-[-0.025em] text-primary-900 sm:text-4xl"
            >
              Documentos más consultados
            </h2>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-surface-600 sm:text-base">
              Accede a los documentos institucionales más utilizados.
            </p>
          </div>

          <a
            routerLink="/documents"
            class="group inline-flex min-h-11 w-fit items-center gap-2 rounded-xl px-1 py-2 text-sm font-bold text-primary-800 no-underline outline-none transition-colors hover:text-primary-600 focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-3"
          >
            Ver más documentos
            <i class="ui-icon ui-icon-arrow-right text-xs transition-transform group-hover:translate-x-0.5" aria-hidden="true"></i>
          </a>
        </header>

        <div class="overflow-hidden rounded-2xl bg-white/85 shadow-lg shadow-amber-950/5 ring-1 ring-amber-900/8 backdrop-blur-sm">
          <div class="divide-y divide-amber-900/10">
            @for (doc of visibleDocuments(); track doc.id) {
              <article class="grid gap-4 px-4 py-4 transition-colors hover:bg-white sm:px-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div class="flex min-w-0 gap-3.5">
                  <span class="grid size-12 shrink-0 place-items-center rounded-xl bg-surface-50 ring-1 ring-inset ring-surface-200" aria-hidden="true">
                    <file-icon [fileName]="doc.file.name" [mimeType]="doc.file.mimeType" />
                  </span>

                  <div class="min-w-0">
                    <h3 class="line-clamp-2 text-base font-bold leading-6 text-surface-950" [title]="doc.title">
                      {{ doc.title }}
                    </h3>

                    <div class="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-5 text-surface-600">
                      @if (documentCategory(doc)) {
                        <span class="font-bold text-primary-800">{{ documentCategory(doc) }}</span>
                      }
                      @if (doc.organizationalUnit) {
                        <span aria-hidden="true">•</span>
                        <span>{{ doc.organizationalUnit }}</span>
                      }
                      @if (doc.year) {
                        <span aria-hidden="true">•</span>
                        <span>Gestión {{ doc.year }}</span>
                      }
                    </div>
                  </div>
                </div>

                <div class="flex flex-col gap-3 pl-[3.75rem] sm:flex-row sm:items-center sm:justify-between lg:justify-end lg:pl-0">
                  <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-surface-500">
                    <span>{{ doc.file.size | fileSize }}</span>
                    <span class="inline-flex items-center gap-1.5">
                      <i class="ui-icon ui-icon-download text-[0.68rem]" aria-hidden="true"></i>
                      {{ doc.downloadCount }} descargas
                    </span>
                  </div>

                  <a
                    [href]="doc.file.downloadUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-xl border border-primary-600 bg-white px-4 py-2 text-sm font-bold text-primary-800 no-underline outline-none transition-colors hover:bg-primary-700 hover:text-white focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-3"
                    [attr.aria-label]="'Descargar ' + doc.title"
                  >
                    Descargar
                    <i class="ui-icon ui-icon-download text-xs" aria-hidden="true"></i>
                  </a>
                </div>
              </article>
            }
          </div>
        </div>

        @if (documents().length > visibleDocuments().length) {
          <p class="mt-4 text-xs font-medium text-surface-600">
            Mostrando {{ visibleDocuments().length }} de {{ documents().length }} documentos.
          </p>
        }
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
