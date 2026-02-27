import {
  ChangeDetectionStrategy,
  Component,
  output,
  input,
  computed,
  inject,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CdkDragHandle, CdkDrag } from '@angular/cdk/drag-drop';
import { ButtonModule } from 'primeng/button';

import { TutorialBlockResponse } from '../../interfaces';
import { FileIcon } from '../../../../../shared';

@Component({
  selector: 'tutorial-block-preview',
  imports: [ButtonModule, CdkDrag, CdkDragHandle, FileIcon],
  template: `
    <div
      cdkDrag
      class="group relative bg-surface-0 rounded-xl border border-surface-200 p-5 shadow-sm hover:border-primary-300 transition-colors"
    >
      <div class="flex items-center justify-between mb-4 select-none">
        <div class="flex items-center gap-3">
          <div
            cdkDragHandle
            class="cursor-grab active:cursor-grabbing p-1 text-surface-400 hover:text-surface-700 transition-colors"
            title="Arrastrar para reordenar"
          >
            <i class="pi pi-bars text-lg"></i>
          </div>
          <span
            class="text-[10px] font-bold uppercase tracking-wider text-surface-600 bg-surface-100 px-2 py-1 rounded border border-surface-200"
          >
            {{ data().type }}
          </span>
        </div>

        <div
          class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <button
            pButton
            icon="pi pi-pencil"
            [rounded]="true"
            [text]="true"
            size="small"
            title="Editar bloque"
            (click)="edit.emit()"
          ></button>
          <button
            pButton
            icon="pi pi-trash"
            [rounded]="true"
            [text]="true"
            size="small"
            severity="danger"
            title="Eliminar bloque"
            (click)="remove.emit()"
          ></button>
        </div>
      </div>

      <div class="pl-2 sm:pl-8">
        @switch (data().type) {
          @case ('TEXT') {
            <div
              class="prose prose-sm max-w-none text-surface-700 wrap-break-word overflow-hidden"
              [innerHTML]="data().content"
            ></div>
          }

          @case ('IMAGE') {
            <figure class="flex flex-col items-center gap-2 m-0">
              <div
                class="rounded-lg border border-surface-100 overflow-hidden bg-surface-50 w-full flex justify-center"
              >
                <img
                  [src]="data().file?.url"
                  [alt]="data().content || 'Imagen del tutorial'"
                  loading="lazy"
                  class="max-h-[350px] w-auto object-contain"
                />
              </div>
              @if (data().content) {
                <figcaption class="text-sm text-surface-500 italic mt-1">
                  {{ data().content }}
                </figcaption>
              }
            </figure>
          }

          @case ('VIDEO_URL') {
            @if (previewUrl()) {
              <div
                class="aspect-video w-full rounded-lg overflow-hidden border border-surface-200 bg-black shadow-inner"
              >
                <iframe
                  [src]="previewUrl()"
                  class="w-full h-full"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                  loading="lazy"
                ></iframe>
              </div>
            } @else {
              <div
                class="p-4 text-sm text-surface-500 border border-dashed border-surface-300 rounded-lg text-center"
              >
                URL de YouTube no válida
              </div>
            }
          }

          @case ('VIDEO_FILE') {
            <div class="flex flex-col items-center gap-2">
              <video
                controls
                preload="metadata"
                class="w-full max-h-[400px] rounded-lg border border-surface-200 bg-black shadow-inner"
              >
                <source [src]="data().file?.url" type="video/mp4" />
                Tu navegador no soporta el elemento de video.
              </video>
              @if (data().content) {
                <p class="text-xs text-surface-500 m-0">
                  {{ data().content }}
                </p>
              }
            </div>
          }

          @case ('FILE') {
            <div class="flex flex-col gap-2">
              @if (data().content) {
                <div class="text-surface-700 text-sm">
                  {{ data().content }}
                </div>
              }
              @if (data().file) {
                <a
                  [href]="data().file?.url"
                  target="_blank"
                  class="flex items-center gap-4 p-4 border border-surface-200 rounded-lg hover:bg-surface-50 hover:border-primary-200 no-underline group/file w-full"
                >
                  <file-icon [fileName]="data().file?.originalName ?? ''" />
                  <div class="flex flex-col">
                    <span
                      class="text-sm font-semibold text-surface-800 group-hover/file:text-primary-700 transition-colors line-clamp-1"
                    >
                      {{ data().file?.originalName }}
                    </span>
                    <span
                      class="text-xs text-surface-500 mt-0.5 uppercase tracking-wide"
                    >
                      ARCHIVO ADJUNTO
                    </span>
                  </div>
                </a>
              }
            </div>
          }
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TutorialBlockPreview {
  private sanitizer = inject(DomSanitizer);
  readonly data = input.required<TutorialBlockResponse>();

  edit = output<void>();
  remove = output<void>();

  previewUrl = computed(() => {
    switch (this.data().type) {
      case 'VIDEO_URL':
        return this.getYoutubeEmbedUrl(this.data().content);
      default:
        return null;
    }
  });

  constructor() {}

  private getYoutubeEmbedUrl(url: string | null): SafeResourceUrl | null {
    if (url === null) return null;
    const id = this.extractYoutubeId(url);
    if (!id) return null;

    const embedUrl = `https://www.youtube-nocookie.com/embed/${id}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  private extractYoutubeId(url: string): string | null {
    if (!url) return null;

    const match =
      url.match(/youtube\.com\/watch\?v=([^&]+)/) ||
      url.match(/youtu\.be\/([^?&]+)/) ||
      url.match(/youtube\.com\/shorts\/([^?&]+)/);

    return match ? match[1] : null;
  }
}
