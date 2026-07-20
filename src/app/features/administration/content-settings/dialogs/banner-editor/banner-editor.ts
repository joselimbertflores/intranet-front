import {
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  form,
  required,
  FormField,
  applyEach,
  maxLength,
  pattern,
  minLength,
  FormRoot,
  validate,
} from '@angular/forms/signals';
import {
  moveItemInArray,
  DragDropModule,
  CdkDragDrop,
} from '@angular/cdk/drag-drop';

import { finalize, firstValueFrom, tap } from 'rxjs';

import {
  HlmDialogHeader,
  HlmDialogFooter,
  HlmDialogTitle,
} from '@spartan-ng/helm/dialog';
import {
  lucideGripVertical,
  lucideImage,
  lucideTrash2,
} from '@ng-icons/lucide';
import { HlmFieldGroup, HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmButton, HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmSpinner } from '@spartan-ng/helm/spinner';

import { ContentSettingsDataSource } from '../../services';
import { HeroSlideResponse } from '../../interfaces';

interface HeroSlideFormData {
  id: number | null;
  title: string;
  description: string;
  isActive: boolean;
  linkLabel: string;
  linkUrl: string;
  imageFileId: string | null;
}

@Component({
  selector: 'banner-editor',
  imports: [
    DragDropModule,
    HlmDialogHeader,
    HlmDialogFooter,
    HlmDialogTitle,
    HlmFieldGroup,
    HlmButton,
    FormField,
    HlmInputImports,
    HlmButtonImports,
    HlmFieldImports,
    HlmTextareaImports,
    HlmLabelImports,
    HlmCheckbox,
    FormRoot,
    NgIcon,
    HlmSpinner,
  ],
  templateUrl: './banner-editor.html',
  providers: [
    provideIcons({
      lucideGripVertical,
      lucideImage,
      lucideTrash2,
    }),
  ],
  host: {
    class: 'flex flex-col gap-2',
  },
  styles: `
    .hero-slide-card.cdk-drag-preview {
      box-sizing: border-box;
      opacity: 1;
      box-shadow: 0 12px 24px rgb(0 0 0 / 0.18);
    }

    .hero-slide-card.cdk-drag-placeholder {
      opacity: 0.35;
    }

    .hero-slide-card.cdk-drag-animating,
    .hero-slide-list.cdk-drop-list-dragging
      .hero-slide-card:not(.cdk-drag-placeholder) {
      transition: transform 220ms cubic-bezier(0, 0, 0.2, 1);
    }
  `,
})
export class BannerEditor {
  private _dialogRef = inject<BrnDialogRef<HeroSlideResponse[]>>(BrnDialogRef);
  private contenDataSource = inject(ContentSettingsDataSource);

  readonly isLoading = signal(false);
  readonly deletedSlideIds = signal<number[]>([]);
  readonly bannerImages = signal<
    { file: File | null; preview: string | null }[]
  >([]);

  formModel = signal<HeroSlideFormData[]>([]);

  heroSlidesForm = form(
    this.formModel,
    (schemaPath) => {
      minLength(schemaPath, 1, {
        message: 'Debe existir al menos un banner',
      });
      maxLength(schemaPath, 5, {
        message: 'No puede registrar más de 5 banners',
      });
      validate(schemaPath, ({ value }) => {
        const images = this.bannerImages();

        const missingImage = value().some(
          (item, index) => !item.imageFileId && !images[index]?.file,
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
            this.contenDataSource.saveHeroSlides(
              this.buildItemsToSave(field().value()),
              this.deletedSlideIds(),
            ),
          );
          this._dialogRef.close(response);
        },
      },
    },
  );

  readonly scrollContainer = viewChild.required<ElementRef>('scrollContainer');

  ngOnInit() {
    this.loadHeroSlides();
  }

  close() {
    this._dialogRef.close();
  }

  onFileSelected(event: Event, i: number): void {
    const input = event.target as HTMLInputElement;
    const [file] = input.files ?? [];
    if (!file) return;

    this.revokePreviewUrl(this.bannerImages()[i].preview);

    this.bannerImages.update((images) => {
      images[i] = { file, preview: URL.createObjectURL(file) };
      return [...images];
    });
  }

  addBanner() {
    if (this.heroSlidesForm().value().length === 5) return;

    this.formModel.update((values) => [
      ...values,
      {
        id: null,
        title: '',
        description: '',
        linkUrl: '',
        linkLabel: '',
        imageFileId: null,
        isActive: true,
      },
    ]);

    this.bannerImages.update((values) => [
      ...values,
      { preview: null, file: null },
    ]);

    setTimeout(() => {
      this.scrollToBottom();
    });
  }

  removeBanner(index: number) {
    const banner = this.formModel()[index];

    if (!banner) return;

    const id = banner.id;

    if (id !== null) {
      this.deletedSlideIds.update((ids) => [...ids, id]);
    }

    this.revokePreviewUrl(this.bannerImages()[index].preview);

    this.formModel.update((models) => {
      models.splice(index, 1);
      return [...models];
    });
    this.bannerImages.update((items) => {
      items.splice(index, 1);
      return [...items];
    });
  }

  drop(event: CdkDragDrop<unknown>) {
    if (event.previousIndex === event.currentIndex) return;

    this.formModel.update((items) => {
      const next = [...items];
      moveItemInArray(next, event.previousIndex, event.currentIndex);
      return next;
    });

    this.bannerImages.update((images) => {
      const next = [...images];
      moveItemInArray(next, event.previousIndex, event.currentIndex);
      return next;
    });
  }

  isFieldInvalid(fieldName: keyof HeroSlideFormData, index: number): boolean {
    const fieldSignal = this.heroSlidesForm[index][fieldName];
    if (!fieldSignal) return false;
    const field = fieldSignal();
    return field && field.touched() && field.errors().length > 0;
  }

  private scrollToBottom() {
    const element = this.scrollContainer().nativeElement as HTMLElement;
    element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
  }

  private buildItemsToSave(formValue: HeroSlideFormData[]) {
    const images = this.bannerImages();

    return formValue.map((item, index) => ({
      ...item,
      file: images[index]?.file ?? null,
    }));
  }

  private revokePreviewUrl(preview: string | null) {
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
  }

  private loadHeroSlides(): void {
    this.isLoading.set(true);
    this.contenDataSource
      .getHeroSlides()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe((slides) => {
        this.formModel.set(
          slides.map((slide) => ({
            id: slide.id,
            title: slide.title,
            description: slide.description ?? '',
            linkLabel: slide.linkLabel ?? '',
            linkUrl: slide.linkUrl ?? '',
            imageFileId: slide.imageFileId,
            isActive: slide.isActive,
          })),
        );
        this.bannerImages.set(
          slides.map((slide) => ({ preview: slide.imageUrl, file: null })),
        );
      });
  }
}
