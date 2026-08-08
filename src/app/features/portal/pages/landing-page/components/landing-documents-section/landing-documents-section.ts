import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowRight, lucideDownload } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';

import { FileIcon, FileSizePipe } from '../../../../../../shared';
import { PortalDocumentResponse } from '../../../../interfaces';

@Component({
  selector: 'landing-documents-section',
  imports: [FileIcon, FileSizePipe, HlmButtonImports, NgIcon, RouterLink],
  providers: [provideIcons({ lucideArrowRight, lucideDownload })],
  host: { class: 'block' },
  template: `
    <section
      class="bg-secondary/45 py-14 text-secondary-foreground sm:py-16 lg:py-20"
      aria-labelledby="documents-title"
    >
      <div class="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div class="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="documents-title"
              class="font-display text-3xl leading-tight tracking-[-0.025em] text-primary sm:text-4xl"
            >
              Documentos más descargados
            </h2>
            <p class="mt-2 max-w-3xl text-base leading-relaxed font-medium text-muted-foreground sm:text-lg">
              Consulta y descarga los documentos más utilizados por los funcionarios municipales.
            </p>
          </div>
          <a hlmBtn variant="link" routerLink="/documents" class="w-fit">
            Ver más documentos
            <ng-icon name="lucideArrowRight" />
          </a>
        </div>

        <div class="overflow-hidden rounded-2xl border border-border bg-card/90 text-card-foreground shadow-sm">
          @for (document of visibleDocuments(); track document.id) {
            <article class="grid gap-4 border-b border-border p-4 transition-colors last:border-b-0 hover:bg-muted/70 motion-reduce:transition-none md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div class="flex min-w-0 items-center gap-4">
                <span class="grid size-11 shrink-0 place-items-center rounded-xl bg-muted text-primary" aria-hidden="true">
                  <file-icon [fileName]="document.file.name" [mimeType]="document.file.mimeType" />
                </span>
                <div class="min-w-0">
                  <h3 class="line-clamp-2 text-sm leading-snug font-bold text-foreground sm:text-base">
                    {{ document.title }}
                  </h3>
                  <div class="mt-1.5 flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <span class="font-semibold text-primary">{{ documentCategory(document) }}</span>
                    @if (document.organizationalUnit) {
                      <span>{{ document.organizationalUnit }}</span>
                    }
                    @if (document.year) {
                      <span>{{ document.year }}</span>
                    }
                    <span>{{ document.file.size | fileSize }}</span>
                    <span>{{ document.downloadCount }} descargas</span>
                  </div>
                </div>
              </div>

              <a
                hlmBtn
                variant="outline"
                [href]="document.file.downloadUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="ml-15 w-fit md:ml-0"
                [attr.aria-label]="'Descargar ' + document.title"
              >
                Descargar
                <ng-icon name="lucideDownload" />
              </a>
            </article>
          }
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingDocumentsSection {
  readonly items = input.required<PortalDocumentResponse[]>();
  readonly visibleDocuments = computed(() => this.items().slice(0, 6));

  documentCategory(document: PortalDocumentResponse): string {
    return [document.type, document.subtype].filter(Boolean).join(' / ');
  }
}
