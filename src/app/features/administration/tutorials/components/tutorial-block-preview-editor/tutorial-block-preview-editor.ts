import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideExternalLink,
  lucideFileText,
  lucidePencil,
  lucideTrash2,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';

import { FileSizePipe } from '../../../../../shared';
import { TutorialBlockResponse, TutorialBlockType } from '../../interfaces';

@Component({
  selector: 'app-tutorial-block-preview-editor',
  imports: [FileSizePipe, HlmButtonImports, NgIcon],
  providers: [
    provideIcons({
      lucideExternalLink,
      lucideFileText,
      lucidePencil,
      lucideTrash2,
    }),
  ],
  template: `
    <div class="flex min-w-0 flex-1 flex-col gap-4 p-4 sm:p-5">
      <header class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {{ typeLabel(block().type) }}
          </p>
          @if (block().file; as file) {
            <p class="mt-1 truncate font-medium" [title]="file.originalName">
              {{ file.originalName }}
            </p>
            <p class="text-sm text-muted-foreground">
              {{ file.mimeType }} · {{ file.size | fileSize }}
            </p>
          }
        </div>

        <div class="flex items-center gap-1">
          @if (canEdit()) {
          <button
            hlmBtn
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Editar bloque"
            title="Editar bloque"
            (click)="edit.emit()"
          >
            <ng-icon name="lucidePencil" />
          </button>
          }
          @if (canDelete()) {
          <button
            hlmBtn
            type="button"
            size="icon-sm"
            variant="ghost"
            class="text-destructive hover:text-destructive"
            aria-label="Eliminar bloque"
            title="Eliminar bloque"
            (click)="remove.emit()"
          >
            <ng-icon name="lucideTrash2" />
          </button>
          }
        </div>
      </header>

      @switch (block().type) {
        @case (blockType.TEXT) {
          <div
            class="prose prose-sm max-w-none wrap-break-word text-foreground"
            [innerHTML]="block().content"
          ></div>
        }
        @case (blockType.IMAGE) {
          @if (block().file; as file) {
            <img
              class="max-h-96 w-full rounded-lg bg-muted object-contain"
              [src]="file.url"
              [alt]="file.originalName"
              loading="lazy"
            />
          }
        }
        @case (blockType.YOUTUBE) {
          @if (block().content; as url) {
            <a
              class="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
              [href]="url"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ng-icon name="lucideExternalLink" />
              Abrir video de YouTube
            </a>
          }
        }
        @case (blockType.VIDEO_FILE) {
          @if (block().file; as file) {
            <video class="max-h-[28rem] w-full rounded-lg bg-black" controls preload="metadata">
              <source [src]="file.url" [type]="file.mimeType" />
            </video>
          }
        }
        @case (blockType.FILE) {
          @if (block().file; as file) {
            <a
              class="flex items-center gap-3 rounded-lg border bg-muted/40 p-4 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
              [href]="file.url"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ng-icon name="lucideFileText" class="shrink-0 text-xl text-primary" />
              <span class="min-w-0 flex-1">
                <span class="block truncate font-medium">{{ file.originalName }}</span>
                <span class="text-sm text-muted-foreground">Abrir archivo</span>
              </span>
            </a>
          }
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TutorialBlockPreviewEditor {
  readonly block = input.required<TutorialBlockResponse>();
  readonly canEdit = input(true);
  readonly canDelete = input(true);
  readonly edit = output<void>();
  readonly remove = output<void>();
  readonly blockType = TutorialBlockType;

  typeLabel(type: TutorialBlockType): string {
    const labels: Record<TutorialBlockType, string> = {
      [TutorialBlockType.TEXT]: 'Texto',
      [TutorialBlockType.IMAGE]: 'Imagen',
      [TutorialBlockType.YOUTUBE]: 'YouTube',
      [TutorialBlockType.VIDEO_FILE]: 'Video subido',
      [TutorialBlockType.FILE]: 'Archivo',
    };
    return labels[type];
  }
}
