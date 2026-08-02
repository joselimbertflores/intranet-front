import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  form,
  FormField,
  FormRoot,
  validate,
} from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideFileUp, lucideRefreshCw } from '@ng-icons/lucide';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { QuillEditorFieldComponent } from 'ngx-quill';
import type { QuillModules } from 'ngx-quill/config';
import { firstValueFrom } from 'rxjs';

import { FileSizePipe } from '../../../../../shared';
import { tutorialHttpErrorMessage } from '../../helpers';
import {
  TutorialBlockCreatePayload,
  TutorialBlockResponse,
  TutorialBlockType,
  TutorialBlockUpdatePayload,
} from '../../interfaces';
import { TutorialDataSource } from '../../services';

interface BlockEditorModel {
  content: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const FILE_RULES: Partial<
  Record<
    TutorialBlockType,
    { mimeTypes: readonly string[]; extensions: readonly string[]; accept: string }
  >
> = {
  [TutorialBlockType.IMAGE]: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    extensions: ['jpg', 'jpeg', 'png', 'webp'],
    accept: 'image/jpeg,image/png,image/webp',
  },
  [TutorialBlockType.VIDEO_FILE]: {
    mimeTypes: ['video/mp4'],
    extensions: ['mp4'],
    accept: 'video/mp4',
  },
  [TutorialBlockType.FILE]: {
    mimeTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ],
    extensions: ['pdf', 'pptx'],
    accept:
      'application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation',
  },
};

@Component({
  selector: 'app-tutorial-block-inline-editor',
  imports: [
    FileSizePipe,
    FormField,
    FormRoot,
    HlmAlertImports,
    HlmButtonImports,
    HlmFieldImports,
    HlmInput,
    HlmSpinner,
    NgIcon,
    QuillEditorFieldComponent,
  ],
  providers: [provideIcons({ lucideFileUp, lucideRefreshCw })],
  templateUrl: './tutorial-block-inline-editor.html',
  host: { class: 'block rounded-xl border-2 border-primary/30 bg-card' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TutorialBlockInlineEditor {
  private readonly dataSource = inject(TutorialDataSource);

  readonly tutorialId = input.required<string>();
  readonly type = input.required<TutorialBlockType>();
  readonly block = input<TutorialBlockResponse | null>(null);
  readonly saved = output<TutorialBlockResponse>();
  readonly cancelled = output<void>();

  readonly model = signal<BlockEditorModel>({ content: '' });
  readonly selectedFile = signal<File | null>(null);
  readonly pendingFileId = signal<string | null>(null);
  readonly fileError = signal<string | null>(null);
  readonly requestError = signal<string | null>(null);
  readonly uploading = signal(false);

  readonly isFileBlock = computed(() => FILE_RULES[this.type()] !== undefined);
  readonly accept = computed(() => FILE_RULES[this.type()]?.accept ?? '');
  readonly typeLabel = computed(() => {
    const labels: Record<TutorialBlockType, string> = {
      [TutorialBlockType.TEXT]: 'Texto',
      [TutorialBlockType.IMAGE]: 'Imagen',
      [TutorialBlockType.YOUTUBE]: 'YouTube',
      [TutorialBlockType.VIDEO_FILE]: 'Video subido',
      [TutorialBlockType.FILE]: 'Archivo',
    };
    return labels[this.type()];
  });

  readonly editorFormats = [
    'bold',
    'italic',
    'header',
    'list',
    'link',
    'blockquote',
  ];
  readonly editorModules: QuillModules = {
    toolbar: [
      ['bold', 'italic'],
      [{ header: [1, 2, 3, false] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'link', 'clean'],
    ],
    history: { delay: 500, maxStack: 100, userOnly: true },
  };

  readonly blockForm = form(
    this.model,
    (path) => {
      validate(path.content, ({ value }) => {
        if (this.isFileBlock()) return null;
        if (this.type() === TutorialBlockType.TEXT) {
          return this.hasVisibleHtml(value())
            ? null
            : { kind: 'required', message: 'Escribe el contenido del bloque' };
        }
        return this.isValidYoutubeInput(value())
          ? null
          : {
              kind: 'youtube',
              message: 'Ingresa una URL o un ID válido de YouTube',
            };
      });
    },
    {
      submission: {
        action: async (field) => this.submit(field().value()),
      },
    },
  );

  constructor() {
    effect(() => {
      const block = this.block();
      this.model.set({ content: block?.content ?? '' });
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const [file] = input.files ?? [];
    input.value = '';
    if (!file) return;

    this.selectedFile.set(null);
    this.pendingFileId.set(null);
    this.fileError.set(null);
    this.requestError.set(null);

    const rule = FILE_RULES[this.type()];
    if (!rule) return;
    if (file.size > MAX_FILE_SIZE) {
      this.fileError.set('El archivo no puede superar 50 MiB');
      return;
    }

    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!rule.mimeTypes.includes(file.type) || !rule.extensions.includes(extension)) {
      this.fileError.set(`El tipo de archivo no es válido para ${this.typeLabel().toLowerCase()}`);
      return;
    }

    this.selectedFile.set(file);
  }

  cancel(): void {
    if (this.blockForm().submitting()) return;
    this.cancelled.emit();
  }

  private async submit(value: BlockEditorModel): Promise<void> {
    this.requestError.set(null);
    this.fileError.set(null);

    let fileId = this.pendingFileId();
    const selectedFile = this.selectedFile();
    const currentBlock = this.block();

    if (this.isFileBlock() && !currentBlock && !selectedFile && !fileId) {
      this.fileError.set('Selecciona un archivo antes de guardar');
      return;
    }

    try {
      if (this.isFileBlock() && selectedFile && !fileId) {
        this.uploading.set(true);
        const upload = await firstValueFrom(
          this.dataSource.uploadTutorialFile(selectedFile),
        );
        fileId = upload.id;
        this.pendingFileId.set(fileId);
        this.uploading.set(false);
      }

      const content = value.content.trim();
      const updatePayload: TutorialBlockUpdatePayload = {
        ...(this.isFileBlock() ? {} : { content }),
        ...(fileId ? { fileId } : {}),
      };

      const response = currentBlock
        ? await firstValueFrom(
            this.dataSource.updateBlock(currentBlock.id, updatePayload),
          )
        : await firstValueFrom(
            this.dataSource.createBlock(this.tutorialId(), {
              type: this.type(),
              ...updatePayload,
            } satisfies TutorialBlockCreatePayload),
          );

      this.saved.emit(response);
    } catch (error) {
      this.uploading.set(false);
      this.requestError.set(
        tutorialHttpErrorMessage(error, 'No se pudo guardar el bloque'),
      );
    }
  }

  private hasVisibleHtml(html: string): boolean {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&(?:nbsp|#160|#xA0);/gi, ' ')
      .trim().length > 0;
  }

  private isValidYoutubeInput(input: string): boolean {
    const value = input.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return true;
    try {
      const url = new URL(value);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
      const host = url.hostname.toLowerCase();
      if (!['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtu.be'].includes(host)) {
        return false;
      }
      return /[a-zA-Z0-9_-]{11}/.test(value);
    } catch {
      return false;
    }
  }
}
