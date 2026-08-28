import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowRight, lucideDownload } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';

import { FileIcon, FileSizePipe } from '../../../../../../shared';
import { PortalDocumentResponse } from '../../../../interfaces';
import { LandingReveal } from '../../scroll-reveal.directive';

@Component({
  selector: 'landing-documents-section',
  imports: [
    FileIcon,
    FileSizePipe,
    HlmButtonImports,
    LandingReveal,
    NgIcon,
    RouterLink,
  ],
  providers: [provideIcons({ lucideArrowRight, lucideDownload })],
  host: { class: 'block' },
  template: `
    <section
      class="documents-section py-14 sm:py-16 lg:py-20"
      aria-labelledby="documents-title"
    >
      <div class="relative mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div landingReveal class="documents-heading mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="documents-title"
              class="text-3xl leading-tight font-bold tracking-[-0.025em] text-primary sm:text-4xl"
            >
              Documentos más descargados
            </h2>
            <p class="mt-2 max-w-3xl text-base leading-relaxed font-medium text-muted-foreground sm:text-lg">
              Consulta y descarga los documentos más utilizados por los funcionarios municipales.
            </p>
          </div>
          <a hlmBtn variant="link" routerLink="/documentos" class="w-fit">
            Ver más documentos
            <ng-icon name="lucideArrowRight" data-icon="inline-end" />
          </a>
        </div>

        <div
          landingReveal
          [landingRevealDelay]="80"
          class="documents-list overflow-hidden rounded-2xl border text-card-foreground shadow-sm"
        >
          @for (document of visibleDocuments(); track document.id) {
            <article class="document-row grid gap-4 border-b p-4 transition-colors last:border-b-0 motion-reduce:transition-none md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div class="flex min-w-0 items-center gap-4">
                <span class="document-icon grid size-11 shrink-0 place-items-center rounded-xl" aria-hidden="true">
                  <file-icon [fileName]="document.file.name" [mimeType]="document.file.mimeType" />
                </span>
                <div class="min-w-0">
                  <h3 class="line-clamp-2 text-sm leading-snug font-semibold text-foreground sm:text-base">
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
                <ng-icon name="lucideDownload" data-icon="inline-end" />
              </a>
            </article>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    .documents-section {
      position: relative;
      overflow: hidden;
      background:
        radial-gradient(
          circle at 88% 8%,
          color-mix(in oklch, var(--landing-gold) 15%, transparent),
          transparent 27%
        ),
        linear-gradient(
          118deg,
          color-mix(in oklch, var(--landing-emerald) 64%, var(--landing-forest)) 0%,
          color-mix(in oklch, var(--landing-teal) 76%, var(--landing-forest)) 100%
        );
    }

    .documents-heading {
      --primary: var(--color-white);
      --muted-foreground: color-mix(
        in srgb,
        var(--color-white) 76%,
        transparent
      );
      --ring: color-mix(in srgb, var(--color-white) 86%, transparent);
    }

    .documents-list {
      border-color: color-mix(in srgb, var(--color-white) 24%, transparent);
      background: var(--card);
      box-shadow: 0 26px 64px -42px
        color-mix(in oklch, var(--landing-forest) 82%, transparent);
    }

    .document-row {
      border-color: var(--border);
    }

    .document-row:hover {
      background: var(--muted);
    }

    .document-icon {
      color: var(--primary);
      background: var(--muted);
    }
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
