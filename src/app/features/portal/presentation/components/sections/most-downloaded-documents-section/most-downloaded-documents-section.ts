import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { RouterModule } from '@angular/router';

import { AnimateOnScroll } from 'primeng/animateonscroll';
import { ButtonModule } from 'primeng/button';

import {
  PrimengFileIconPipe,
  FileSizePipe,
  UiBreakpointObserver,
} from '../../../../../../shared';
import { PortalService } from '../../../../services';

@Component({
  selector: 'most-downloaded-documents-section',
  imports: [
    CommonModule,
    RouterModule,
    PrimengFileIconPipe,
    FileSizePipe,
    AnimateOnScroll,
    ButtonModule,
  ],
  template: `
    <section
      class="relative py-20 bg-gradient-to-b from-surface-50 via-white to-surface-100"
      pAnimateOnScroll
      enterClass="animate-enter fade-in-20 slide-in-from-b-10 animate-duration-1000"
      [once]="true"
      [threshold]="0.1"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <h2
          class="text-xl sm:text-4xl font-semibold text-primary-800 mb-3 tracking-tight"
        >
          Documentos más descargados
        </h2>
        <p
          class="text-surface-600 mb-10 mx-auto leading-relaxed text-sm sm:text-xl "
        >
          Accede rápidamente a los documentos más consultados del portal
        </p>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (doc of visibleDocs(); track $index) {
          <div
            class="w-full bg-surface shadow-md rounded-2xl p-4 sm:p-5 flex flex-col justify-between border border-surface-200 hover:shadow-lg hover:-translate-y-1 transition-all"
            pAnimateOnScroll
            [enterClass]="
              $index % 2 === 0
                ? 'animate-enter fade-in-20 slide-in-from-l-10 animate-duration-1000'
                : 'animate-enter fade-in-20 slide-in-from-r-10 animate-duration-1000'
            "
            [once]="true"
            [threshold]="0.2"
          >
            <div class="flex items-center gap-3 sm:gap-4 mb-4">
              <i
                [ngClass]="doc.originalName | primengFileIcon"
                style="font-size: 1.5rem"
              ></i>
              <div class="text-left">
                <h3
                  class="text-base sm:text-lg font-medium text-surface-800 line-clamp-2 leading-snug"
                >
                  {{ doc.displayName }}
                </h3>
                <p class="text-xs sm:text-sm text-surface-500 mt-1">
                  {{ doc.category || 'Documento público' }}
                </p>
              </div>
            </div>

            <div
              class="flex items-center justify-between text-xs sm:text-sm text-surface-500 mb-4"
            >
              <span
                class="flex items-center gap-2 text-surface-600 font-medium truncate"
              >
                <i class="pi pi-download text-primary-500"></i>
                {{ doc.downloadCount }} descargas
              </span>
              <span
                class="px-2 py-1 text-xs font-medium rounded-full bg-surface-100 text-surface-700 whitespace-nowrap"
              >
                {{ doc.sizeBytes | fileSize }}
              </span>
            </div>

            <p-button
              icon="pi pi-arrow-down"
              label="Descargar"
              styleClass="w-full"
              (onClick)="download(doc)"
            />
          </div>
          }
        </div>

        <div
          pAnimateOnScroll
          enterClass="animate-enter fade-in-20 slide-in-from-b-10 animate-duration-800"
          [once]="true"
          class="mt-12"
        >
          <a routerLink="repository" pButton [outlined]="true">
            <i class="pi pi-list"></i>
            <span pButtonLabel> Ver todos los documentos</span>
          </a>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MostDownloadedDocumentsSection {
  private isMobile = inject(UiBreakpointObserver).isMobile;
  private portalService = inject(PortalService);

  documents = input.required<any[]>();
  visibleDocs = computed(() =>
    this.isMobile() ? this.documents().slice(0, 4) : this.documents()
  );

  download(item: any) {
    this.portalService
      .dowloadDocument(item.id, item.fileName, item.originalName)
      .subscribe();
  }
}
