import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import {
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';

import {
  applyEach,
  FormField,
  FormRoot,
  maxLength,
  minLength,
  pattern,
  required,
  validate,
  form,
} from '@angular/forms/signals';
import {
  HlmDialogHeader,
  HlmDialogFooter,
  HlmDialogTitle,
} from '@spartan-ng/helm/dialog';
import { HlmFieldGroup, HlmField, HlmFieldError } from '@spartan-ng/helm/field';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmButton } from '@spartan-ng/helm/button';
import {
  lucideGripVertical,
  lucideImage,
  lucideTrash2,
} from '@ng-icons/lucide';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { finalize, firstValueFrom } from 'rxjs';

import { FeaturedBannerResponse } from '../../interfaces';
import { ContentSettingsDataSource } from '../../services';
interface FeaturedBannerFormData {
  id: number | null;
  title: string;
  description: string;
  linkLabel: string;
  linkUrl: string;
  imageId: string | null;
  isActive: boolean;
}

@Component({
  selector: 'app-featured-banner-editor',
  imports: [
    FormRoot,
    FormField,
    DragDropModule,
    HlmDialogHeader,
    HlmDialogFooter,
    HlmInputImports,
    HlmDialogTitle,
    HlmTextareaImports,
    HlmFieldGroup,
    HlmFieldError,
    HlmSpinner,
    HlmField,
    HlmButton,
    NgIcon,
    HlmCheckbox,
  ],
  templateUrl: './featured-banner-editor.html',
  host: {
    class: 'flex flex-col gap-2',
  },
  styles: `
    .featured-banner-card.cdk-drag-preview {
      box-sizing: border-box;
      opacity: 1;
      box-shadow: 0 12px 24px rgb(0 0 0 / 0.18);
    }

    .featured-banner-card.cdk-drag-placeholder {
      opacity: 0.35;
    }

    .featured-banner-card.cdk-drag-animating,
    .featured-banner-list.cdk-drop-list-dragging
      .featured-banner-card:not(.cdk-drag-placeholder) {
      transition: transform 220ms cubic-bezier(0, 0, 0.2, 1);
    }
  `,
  providers: [
    provideIcons({
      lucideGripVertical,
      lucideImage,
      lucideTrash2,
    }),
  ],
})
export class FeaturedBannerEditor implements OnInit, OnDestroy {
  private _dialogRef =
    inject<BrnDialogRef<FeaturedBannerResponse[]>>(BrnDialogRef);
  private readonly contentDataSource = inject(ContentSettingsDataSource);

  readonly featuredBannerImages = signal<
    { file: File | null; preview: string | null }[]
  >([]);
  readonly saving = signal(false);
  readonly hasErrorMessage = signal(false);
  readonly scrollContainer =
    viewChild.required<ElementRef<HTMLElement>>('scrollContainer');

  readonly deletedBannersIds = signal<number[]>([]);

  formModel = signal<FeaturedBannerFormData[]>([]);

  isLoading = signal(false);

  featuredBannersForm = form(
    this.formModel,
    (schemaPath) => {
      minLength(schemaPath, 1, {
        message: 'Debe existir al menos un banner',
      });
      maxLength(schemaPath, 10, {
        message: 'No puede registrar más de 10 banners',
      });
      validate(schemaPath, ({ value }) => {
        const images = this.featuredBannerImages();

        const missingImage = value().some(
          (item, index) => !item.imageId && !images[index]?.file,
        );

        return missingImage
          ? {
              kind: 'imageRequired',
              message: 'Todos los banners deben tener una imagen',
            }
          : null;
      });

      applyEach(schemaPath, (item) => {
        required(item.title, { message: 'El titulo es requerido' });
        maxLength(item.title, 80, { message: 'Maximo 80 caracteres' });

        maxLength(item.description, 200, { message: 'Maximo 200 caracteres' });

        required(item.linkLabel, {
          message: 'Ingrese el texto del botón',
          when: ({ valueOf }) => Boolean(valueOf(item.linkUrl)?.trim()),
        });
        maxLength(item.linkLabel, 40, { message: 'Maximo 40 caracteres' });

        required(item.linkUrl, {
          message: 'Ingrese la URL del botón',
          when: ({ valueOf }) => Boolean(valueOf(item.linkLabel)?.trim()),
        });
        pattern(item.linkUrl, /^(https?:\/\/[^\s]+|\/(?!\/)[^\s]*)$/i, {
          message: 'Ingrese una URL válida',
        });
      });
    },
    {
      submission: {
        action: async (field) => {
          const response = await firstValueFrom(
            this.contentDataSource.saveFeaturedBanners(
              this.buildItemsToSave(field().value()),
              this.deletedBannersIds(),
            ),
          );
          this._dialogRef.close(response);
        },
      },
    },
  );

  ngOnInit(): void {
    this.loadFeaturedBanners();
  }

  ngOnDestroy(): void {
    this.featuredBannerImages().forEach(({ preview }) =>
      this.revokePreviewUrl(preview),
    );
  }

  addBanner(): void {
    if (this.featuredBannersForm().value().length === 5) return;

    this.formModel.update((values) => [
      ...values,
      {
        id: null,
        title: '',
        description: '',
        linkUrl: '',
        linkLabel: '',
        imageId: null,
        isActive: true,
      },
    ]);

    this.featuredBannerImages.update((values) => [
      ...values,
      { preview: null, file: null },
    ]);

    setTimeout(() => {
      this.scrollToBottom();
    });
  }

  close() {
    this._dialogRef.close();
  }

  onFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const [file] = input.files ?? [];
    if (!file) return;

    this.revokePreviewUrl(this.featuredBannerImages()[index].preview);

    this.featuredBannerImages.update((images) => {
      images[index] = { file, preview: URL.createObjectURL(file) };
      return [...images];
    });
  }

  removeBanner(index: number): void {
    const banner = this.formModel()[index];

    if (!banner) return;

    const id = banner.id;

    if (id !== null) {
      this.deletedBannersIds.update((ids) => [...ids, id]);
    }

    this.revokePreviewUrl(this.featuredBannerImages()[index].preview);

    this.formModel.update((models) => {
      models.splice(index, 1);
      return [...models];
    });
    this.featuredBannerImages.update((items) => {
      items.splice(index, 1);
      return [...items];
    });
  }

  drop(event: CdkDragDrop<unknown[]>): void {
    if (event.previousIndex === event.currentIndex) return;

    this.formModel.update((items) => {
      const next = [...items];
      moveItemInArray(next, event.previousIndex, event.currentIndex);
      return next;
    });

    this.featuredBannerImages.update((images) => {
      const next = [...images];
      moveItemInArray(next, event.previousIndex, event.currentIndex);
      return next;
    });
  }

  private scrollToBottom(): void {
    const element = this.scrollContainer().nativeElement;
    element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
  }

  private revokePreviewUrl(preview: string | null) {
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
  }

  private buildItemsToSave(formValue: FeaturedBannerFormData[]) {
    const images = this.featuredBannerImages();

    return formValue.map((item, index) => ({
      ...item,
      file: images[index]?.file ?? null,
    }));
  }

  private loadFeaturedBanners(): void {
    this.isLoading.set(true);
    this.contentDataSource
      .getFeaturedBanners()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe((banners) => {
        this.formModel.set(
          banners.map((banner) => ({
            id: banner.id,
            title: banner.title,
            description: banner.description ?? '',
            linkLabel: banner.linkLabel ?? '',
            linkUrl: banner.linkUrl ?? '',
            imageId: banner.imageId,
            isActive: banner.isActive,
          })),
        );
        this.featuredBannerImages.set(
          banners.map((slide) => ({ preview: slide.imageUrl, file: null })),
        );
      });
  }
}
