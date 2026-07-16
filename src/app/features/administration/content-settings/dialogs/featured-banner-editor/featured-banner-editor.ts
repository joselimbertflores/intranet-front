import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';



import { FeaturedBannerResponse, FeaturedBannerToSave } from '../../interfaces';
import { ContentSettingsDataSource } from '../../services';

interface BannerImage {
  file?: File;
  preview?: string;
}

@Component({
  selector: 'app-featured-banner-editor',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DragDropModule,
   
  ],
  templateUrl: './featured-banner-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturedBannerEditor implements OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  // private readonly dialogRef = inject(DynamicDialogRef);
  private readonly contentDataSource = inject(ContentSettingsDataSource);
  // private readonly confirmationService = inject(ConfirmationService);

  readonly images = signal<BannerImage[]>([]);
  readonly saving = signal(false);
  readonly hasErrorMessage = signal(false);
  readonly scrollContainer =
    viewChild.required<ElementRef<HTMLElement>>('scrollContainer');
  readonly form = this.formBuilder.group({ items: this.formBuilder.array([]) });

  ngOnInit(): void {
    this.contentDataSource.getFeaturedBanners().subscribe((banners) => {
      this.images.set(banners.map(({ imageUrl }) => ({ preview: imageUrl })));
      banners.forEach((banner) =>
        this.items.push(this.createBannerGroup(banner)),
      );
    });
  }

  ngOnDestroy(): void {
    this.images().forEach(({ preview }) => this.revokePreview(preview));
  }

  get items(): FormArray {
    return this.form.controls.items;
  }

  addBanner(): void {
    this.items.push(this.createBannerGroup());
    this.images.update((images) => [...images, {}]);
    setTimeout(() => this.scrollToBottom());
  }

  onFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const previousPreview = this.images()[index]?.preview;
    this.revokePreview(previousPreview);
    this.images.update((images) => {
      images[index] = { file, preview: URL.createObjectURL(file) };
      return [...images];
    });
    input.value = '';
  }

  removeBanner(index: number): void {
    const id = this.items.at(index).get('id')?.value as number | null;
    if (!id) {
      this.removeLocalBanner(index);
      return;
    }

    // this.confirmationService.confirm({
    //   header: 'Eliminar banner destacado',
    //   message: '¿Está seguro de eliminar este banner?',
    //   rejectButtonProps: {
    //     label: 'Cancelar',
    //     severity: 'secondary',
    //     outlined: true,
    //   },
    //   acceptButtonProps: { label: 'Eliminar', severity: 'danger' },
    //   accept: () => {
    //     this.contentDataSource
    //       .removeFeaturedBanner(id)
    //       .subscribe(() => this.removeLocalBanner(index));
    //   },
    // });
  }

  drop(event: CdkDragDrop<unknown[]>): void {
    moveItemInArray(
      this.items.controls,
      event.previousIndex,
      event.currentIndex,
    );
    this.images.update((images) => {
      moveItemInArray(images, event.previousIndex, event.currentIndex);
      return [...images];
    });
    this.items.updateValueAndValidity();
  }

  save(): void {
    if (!this.isValid()) {
      this.form.markAllAsTouched();
      this.hasErrorMessage.set(true);
      setTimeout(() => this.hasErrorMessage.set(false), 3000);
      return;
    }

    const items: FeaturedBannerToSave[] = this.items.controls.map(
      (control, index) => {
        const value = control.getRawValue();
        return {
          ...(value.id ? { id: value.id } : {}),
          title: value.title,
          description: value.description?.trim() || null,
          linkLabel: value.url?.trim() ? value.linkLabel?.trim() || null : null,
          url: value.url?.trim() || null,
          imageFileId: value.imageFileId || undefined,
          isActive: value.isActive,
          file: this.images()[index]?.file,
        };
      },
    );

    // this.saving.set(true);
    // this.contentDataSource.saveFeaturedBanners(items).subscribe({
    //   next: () => this.dialogRef.close(),
    //   error: () => this.saving.set(false),
    // });
  }

  close(): void {
    // this.dialogRef.close();
  }

  private createBannerGroup(banner?: FeaturedBannerResponse): FormGroup {
    return this.formBuilder.group({
      id: [banner?.id ?? null],
      title: [
        banner?.title ?? '',
        [Validators.required, Validators.maxLength(120)],
      ],
      description: [banner?.description ?? ''],
      linkLabel: [banner?.linkLabel ?? '', Validators.maxLength(80)],
      url: [
        banner?.url ?? '',
        Validators.pattern(/^(https?:\/\/[^\s]+|\/(?!\/)[^\s]*)$/i),
      ],
      imageFileId: [banner?.imageFileId ?? null],
      isActive: [banner?.isActive ?? true],
    });
  }

  private isValid(): boolean {
    if (this.form.invalid || !this.items.length) return false;
    return this.items.controls.every(
      (control, index) =>
        !!control.get('imageFileId')?.value || !!this.images()[index]?.file,
    );
  }

  private removeLocalBanner(index: number): void {
    this.revokePreview(this.images()[index]?.preview);
    this.items.removeAt(index);
    this.images.update((images) =>
      images.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  private revokePreview(preview?: string): void {
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
  }

  private scrollToBottom(): void {
    const element = this.scrollContainer().nativeElement;
    element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
  }
}
