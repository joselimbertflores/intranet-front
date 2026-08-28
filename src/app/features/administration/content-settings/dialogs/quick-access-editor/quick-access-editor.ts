import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import {
  FormField,
  FormRoot,
  form,
  maxLength,
  pattern,
  required,
  validate,
} from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideImage, lucideUpload, lucideX } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import {
  HlmDialogDescription,
  HlmDialogFooter,
  HlmDialogHeader,
  HlmDialogTitle,
} from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { firstValueFrom, switchMap } from 'rxjs';

import { FileUploadService } from '../../../../../shared';
import { QuickAccessResponse, QuickAccessToSave } from '../../interfaces';
import { ContentSettingsDataSource } from '../../services';

const DEFAULT_BACKGROUND_COLOR = '#477998';
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

interface QuickAccessFormData {
  title: string;
  description: string;
  backgroundColor: string;
  url: string;
  isActive: boolean;
}

interface QuickAccessEditorContext {
  quickAccess?: QuickAccessResponse;
}

@Component({
  selector: 'app-quick-access-editor',
  imports: [
    FormField,
    FormRoot,
    HlmButton,
    HlmCheckbox,
    HlmDialogDescription,
    HlmDialogFooter,
    HlmDialogHeader,
    HlmDialogTitle,
    HlmFieldImports,
    HlmInputImports,
    HlmSpinner,
    HlmTextareaImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideImage, lucideUpload, lucideX })],
  templateUrl: './quick-access-editor.html',
  host: {
    class: 'flex max-h-[calc(100dvh-4rem)] flex-col',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickAccessEditor {
  private readonly dialogRef =
    inject<BrnDialogRef<QuickAccessResponse>>(BrnDialogRef);
  private readonly dataSource = inject(ContentSettingsDataSource);
  private readonly fileUploadService = inject(FileUploadService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly context = injectBrnDialogContext<QuickAccessEditorContext>();

  readonly quickAccess = this.context.quickAccess;
  readonly selectedImage = signal<File | null>(null);
  readonly imagePreview = signal<string | null>(
    this.quickAccess?.imageUrl ?? null,
  );
  readonly imageError = signal<string | null>(null);
  private previewObjectUrl: string | null = null;
  readonly formModel = signal<QuickAccessFormData>({
    title: this.quickAccess?.title ?? '',
    description: this.quickAccess?.description ?? '',
    backgroundColor:
      this.quickAccess?.backgroundColor ?? DEFAULT_BACKGROUND_COLOR,
    url: this.quickAccess?.url ?? '',
    isActive: this.quickAccess?.isActive ?? true,
  });

  readonly quickAccessForm = form(
    this.formModel,
    (path) => {
      validate(path.title, ({ value }) =>
        value().trim()
          ? null
          : { kind: 'required', message: 'El título es obligatorio' },
      );
      maxLength(path.title, 80, {
        message: 'El título admite hasta 80 caracteres',
      });
      maxLength(path.description, 200, {
        message: 'La descripción admite hasta 200 caracteres',
      });
      required(path.backgroundColor, { message: 'Selecciona un color' });
      pattern(path.backgroundColor, /^#[0-9A-Fa-f]{6}$/, {
        message: 'Usa un color hexadecimal válido (#RRGGBB)',
      });
      required(path.url, { message: 'La URL es obligatoria' });
      maxLength(path.url, 2048, {
        message: 'La URL admite hasta 2048 caracteres',
      });
      pattern(path.url, /^https?:\/\/[^\s]+$/i, {
        message: 'Ingresa una URL HTTP o HTTPS válida',
      });
    },
    {
      submission: {
        action: async (field) => {
          this.imageError.set(null);
          const selectedImage = this.selectedImage();
          if (!selectedImage && !this.quickAccess?.imageFileId) {
            this.imageError.set('Selecciona una imagen o logo');
            return;
          }

          const payload = this.buildPayload(field().value());
          const save = (imageFileId?: string) =>
            this.quickAccess
              ? this.dataSource.updateQuickAccess(this.quickAccess.id, {
                  ...payload,
                  ...(imageFileId && { imageFileId }),
                })
              : this.dataSource.createQuickAccess({
                  ...payload,
                  imageFileId: imageFileId!,
                });
          const request = selectedImage
            ? this.fileUploadService
                .uploadQuickAccessImage(selectedImage)
                .pipe(switchMap(({ id }) => save(id)))
            : save();
          this.dialogRef.close(await firstValueFrom(request));
        },
      },
    },
  );

  constructor() {
    this.destroyRef.onDestroy(() => this.revokePreviewObjectUrl());
  }

  onImageSelected(event: Event): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;

    const file = input.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      this.imageError.set('Usa una imagen PNG, JPEG o WebP');
      input.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      this.imageError.set('La imagen no debe superar los 2 MB');
      input.value = '';
      return;
    }

    this.revokePreviewObjectUrl();
    this.previewObjectUrl = URL.createObjectURL(file);
    this.selectedImage.set(file);
    this.imagePreview.set(this.previewObjectUrl);
    this.imageError.set(null);
  }

  clearSelectedImage(input: HTMLInputElement): void {
    this.revokePreviewObjectUrl();
    this.selectedImage.set(null);
    this.imagePreview.set(this.quickAccess?.imageUrl ?? null);
    this.imageError.set(null);
    input.value = '';
  }

  isFieldInvalid(fieldName: keyof QuickAccessFormData): boolean {
    const field = this.quickAccessForm[fieldName]();
    return field.touched() && field.errors().length > 0;
  }

  close(): void {
    this.dialogRef.close();
  }

  private buildPayload(value: QuickAccessFormData): QuickAccessToSave {
    return {
      title: value.title.trim(),
      description: value.description.trim() || null,
      backgroundColor: value.backgroundColor.toUpperCase(),
      url: value.url.trim(),
      isActive: value.isActive,
    };
  }

  private revokePreviewObjectUrl(): void {
    if (!this.previewObjectUrl) return;
    URL.revokeObjectURL(this.previewObjectUrl);
    this.previewObjectUrl = null;
  }
}
