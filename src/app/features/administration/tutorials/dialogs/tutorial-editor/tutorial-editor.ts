import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import {
  form,
  FormField,
  FormRoot,
  maxLength,
  validate,
} from '@angular/forms/signals';
import { rxResource } from '@angular/core/rxjs-interop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideImage, lucideUpload, lucideX } from '@ng-icons/lucide';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import {
  HlmDialogDescription,
  HlmDialogFooter,
  HlmDialogHeader,
  HlmDialogTitle,
} from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmTextarea } from '@spartan-ng/helm/textarea';
import { firstValueFrom, switchMap } from 'rxjs';

import {
  TutorialCreatePayload,
  TutorialDetailResponse,
  TutorialResponse,
} from '../../interfaces';
import { TutorialCategoryDataSource, TutorialDataSource } from '../../services';

export interface TutorialEditorContext {
  tutorial?: TutorialResponse;
}

interface TutorialFormData {
  title: string;
  summary: string;
  categoryId: number | null;
}

const MAX_COVER_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_COVER_IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
]);

@Component({
  selector: 'app-tutorial-editor',
  imports: [
    FormField,
    FormRoot,
    HlmButtonImports,
    HlmDialogDescription,
    HlmDialogFooter,
    HlmDialogHeader,
    HlmDialogTitle,
    HlmFieldImports,
    HlmInput,
    HlmSelectImports,
    HlmSpinner,
    HlmTextarea,
    NgIcon,
  ],
  providers: [provideIcons({ lucideImage, lucideUpload, lucideX })],
  templateUrl: './tutorial-editor.html',
  host: {
    class: 'flex max-h-[calc(100dvh-4rem)] flex-col',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TutorialEditor {
  private readonly dialogRef =
    inject<BrnDialogRef<TutorialDetailResponse>>(BrnDialogRef);
  private readonly tutorialDataSource = inject(TutorialDataSource);
  private readonly categoryDataSource = inject(TutorialCategoryDataSource);
  private readonly destroyRef = inject(DestroyRef);
  private readonly context = injectBrnDialogContext<TutorialEditorContext>();

  readonly tutorial = this.context.tutorial;
  readonly categoriesResource = rxResource({
    stream: () => this.categoryDataSource.findAll(),
  });
  readonly categoryNames = computed(
    () =>
      new Map(
        (this.categoriesResource.value() ?? []).map(({ id, name }) => [
          id,
          name,
        ]),
      ),
  );
  readonly categoryToString = (categoryId: number | null): string =>
    categoryId === null
      ? 'Sin categoría'
      : (this.categoryNames().get(categoryId) ?? '');
  readonly selectedCoverImage = signal<File | null>(null);
  readonly coverImagePreview = signal<string | null>(
    this.tutorial?.coverImageUrl ?? null,
  );
  readonly coverImageRemoved = signal(false);
  readonly coverImageError = signal<string | null>(null);
  private previewObjectUrl: string | null = null;
  readonly formModel = signal<TutorialFormData>({
    title: this.tutorial?.title ?? '',
    summary: this.tutorial?.summary ?? '',
    categoryId: this.tutorial?.category?.id ?? null,
  });

  readonly tutorialForm = form(
    this.formModel,
    (path) => {
      validate(path.title, ({ value }) =>
        value().trim()
          ? null
          : { kind: 'required', message: 'El título es obligatorio' },
      );
      maxLength(path.title, 200, {
        message: 'El título admite hasta 200 caracteres',
      });
    },
    {
      submission: {
        action: async (field) => {
          const value = field().value();
          const payload: TutorialCreatePayload = {
            title: value.title.trim(),
            summary: value.summary?.trim() || null,
            categoryId: value.categoryId,
          };
          const selectedCoverImage = this.selectedCoverImage();
          const save = (coverImageFileId?: string | null) => {
            const coverImagePayload =
              coverImageFileId !== undefined
                ? { coverImageFileId }
                : this.coverImageRemoved()
                  ? { coverImageFileId: null }
                  : {};

            return this.tutorial
              ? this.tutorialDataSource.update(this.tutorial.id, {
                  ...payload,
                  ...coverImagePayload,
                })
              : this.tutorialDataSource.create({
                  ...payload,
                  ...coverImagePayload,
                });
          };
          const response = await firstValueFrom(
            selectedCoverImage
              ? this.tutorialDataSource
                  .uploadCover(selectedCoverImage)
                  .pipe(switchMap(({ id }) => save(id)))
              : save(),
          );
          this.dialogRef.close(response);
        },
      },
    },
  );

  constructor() {
    this.destroyRef.onDestroy(() => this.revokePreviewObjectUrl());
  }

  onCoverImageSelected(event: Event): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;

    const file = input.files?.[0];
    if (!file) return;

    if (!ALLOWED_COVER_IMAGE_TYPES.has(file.type)) {
      this.coverImageError.set('Usa una imagen PNG, JPEG o WebP');
      input.value = '';
      return;
    }

    if (file.size > MAX_COVER_IMAGE_SIZE_BYTES) {
      this.coverImageError.set('La imagen no debe superar los 5 MB');
      input.value = '';
      return;
    }

    this.revokePreviewObjectUrl();
    this.previewObjectUrl = URL.createObjectURL(file);
    this.selectedCoverImage.set(file);
    this.coverImagePreview.set(this.previewObjectUrl);
    this.coverImageRemoved.set(false);
    this.coverImageError.set(null);
  }

  clearSelectedCoverImage(input: HTMLInputElement): void {
    this.revokePreviewObjectUrl();
    this.selectedCoverImage.set(null);
    this.coverImagePreview.set(this.tutorial?.coverImageUrl ?? null);
    this.coverImageRemoved.set(false);
    this.coverImageError.set(null);
    input.value = '';
  }

  removeCoverImage(input: HTMLInputElement): void {
    this.revokePreviewObjectUrl();
    this.selectedCoverImage.set(null);
    this.coverImagePreview.set(null);
    this.coverImageRemoved.set(true);
    this.coverImageError.set(null);
    input.value = '';
  }

  close(): void {
    this.dialogRef.close();
  }

  private revokePreviewObjectUrl(): void {
    if (!this.previewObjectUrl) return;
    URL.revokeObjectURL(this.previewObjectUrl);
    this.previewObjectUrl = null;
  }
}
