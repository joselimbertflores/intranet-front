import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { TutorialBlockResponse } from '../../interfaces';
import { DialogService } from 'primeng/dynamicdialog';
import { TutorialBlockEditor } from '../../dialogs';

@Component({
  selector: 'app-tutorial-block-preview',
  imports: [ButtonModule],
  template: `
    <div
      cdkDrag
      class="group relative bg-surface-0 rounded-xl border border-surface-200 p-5 shadow-sm hover:border-primary-200"
    >
      <div class="flex items-center justify-between mb-3 select-none">
        <div class="flex items-center gap-3">
          <div
            cdkDragHandle
            class="cursor-grab active:cursor-grabbing p-1 text-surface-400 hover:text-surface-600 transition-colors"
          >
            <i class="pi pi-bars text-lg"></i>
          </div>

          <span
            class="text-xs font-bold uppercase tracking-wider text-surface-500 bg-surface-100 px-2 py-1 rounded"
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
            (click)="edit.emit()"
          ></button>

          <button
            pButton
            icon="pi pi-trash"
            [rounded]="true"
            [text]="true"
            size="small"
            severity="danger"
            (click)="delete.emit()"
          ></button>
        </div>
      </div>

      <div class="pl-2">
        @switch (data().type) {
          @case ('TEXT') {
            <div
              class="prose prose-sm max-w-none text-surface-700"
              [innerHTML]="data().content"
            ></div>
          }

          @case ('IMAGE') {
            <figure class="flex flex-col items-center gap-2">
              <div
                class="rounded-lg border border-surface-100 overflow-hidden bg-surface-50"
              >
                <img
                  [src]="data().file?.url"
                  loading="lazy"
                  class="max-h-[350px] w-auto object-contain"
                />
              </div>
              @if (data().content) {
                <figcaption class="text-xs text-surface-500 italic">
                  {{ data().content }}
                </figcaption>
              }
            </figure>
          }

          @case ('VIDEO_URL') {
            <div
              class="aspect-video w-full rounded-lg overflow-hidden border border-surface-100 bg-black"
            >
              <!-- <iframe
            [src]="sanitizeVideoUrl(data().content)"
            class="w-full h-full"
            frameborder="0"
            allowfullscreen
          ></iframe> -->
            </div>
          }

          @case ('VIDEO_FILE') {
            <div class="flex flex-col items-center gap-2">
              <video
                controls
                preload="metadata"
                class="w-full max-h-[350px] rounded-lg border border-surface-100 bg-black"
              >
                <source [src]="data().file?.url" type="video/mp4" />
              </video>
              @if (data().content) {
                <p class="text-xs text-surface-500">{{ data().content }}</p>
              }
            </div>
          }

          @case ('FILE') {
            <a
              [href]="data().file?.url"
              target="_blank"
              class="flex items-center gap-3 p-3 border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors"
            >
              <div class="p-2 bg-primary-50 text-primary-600 rounded-full">
                <i class="pi pi-file"></i>
              </div>
              <span class="text-sm font-medium text-surface-700">
                {{ data().content || data().file?.originalName }}
              </span>
            </a>
          }
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TutorialBlockPreview {
  readonly data = input.required<TutorialBlockResponse>();

  edit = output<void>();
  delete = output<void>();
}
