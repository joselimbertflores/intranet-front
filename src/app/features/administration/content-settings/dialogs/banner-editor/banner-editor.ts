import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormArray,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  moveItemInArray,
  DragDropModule,
  CdkDragDrop,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';

import { ContentSettingsDataSource } from '../../services';
import { HeroSlideResponse } from '../../interfaces';

@Component({
  selector: 'banner-editor',
  imports: [CommonModule, ReactiveFormsModule, DragDropModule, DragDropModule],
  templateUrl: './banner-editor.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class BannerEditor {
  private formBuilder = inject(FormBuilder);
  // private dialogRef = inject(DynamicDialogRef);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private contentService = inject(ContentSettingsDataSource);
  // private confirmationService = inject(ConfirmationService);

  bannerImages = signal<{ file?: File; preview?: string }[]>([]);

  form: FormGroup = this.formBuilder.group({
    items: this.formBuilder.array([]),
  });
  hasErrorMessage = signal(false);

  readonly scrollContainer = viewChild.required<ElementRef>('scrollContainer');
  ngOnInit() {
    this.getBanners();
  }

  save() {
    if (!this.isFormValid) {
      if (this.items.length > 0) this.showErrorMessage();
      return;
    }
    this.contentService
      .saveHeroSections(
        this.items.controls.map((item, i: number) => ({
          ...item.value,
          file: this.bannerImages()[i]?.file,
        })),
      )
      .subscribe(() => {
        // this.dialogRef.close();
      });
  }

  close() {
    // this.dialogRef.close();
  }

  onFileSelected(event: Event, i: number): void {
    const input = event.target as HTMLInputElement;
    const [file] = input.files ?? [];
    if (!file) return;

    const preview = this.bannerImages()[i]?.preview;
    if (preview?.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    this.bannerImages.update((images) => {
      images[i] = { file, preview: URL.createObjectURL(file) };
      return [...images];
    });
  }

  addBanner() {
    this.items.push(this.createBannerGroup());
    this.bannerImages.update((values) => [
      ...values,
      { preview: undefined, file: undefined },
    ]);
    setTimeout(() => {
      this.scrollToBottom();
    });
  }

  removeBanner(i: number) {
    const control = this.items.controls[i];
    // if (control.value['id']) {
    //   this.confirmationService.confirm({
    //     message: '¿Esta seguro que desea eliminar el elemento?',
    //     header: 'Eliminar banner',
    //     rejectButtonProps: {
    //       label: 'Cancelar',
    //       severity: 'secondary',
    //       outlined: true,
    //     },
    //     acceptButtonProps: {
    //       label: 'Aceptar',
    //     },
    //     accept: () => {
    //       this.contentService
    //         .removeBanner(control.value['id'])
    //         .subscribe(() => {
    //           this.items.removeAt(i);
    //           this.bannerImages.update((values) => {
    //             values.splice(i, 1);
    //             return [...values];
    //           });
    //         });
    //     },
    //   });
    // } else {
    //   this.items.removeAt(i);
    //   this.bannerImages.update((values) => {
    //     values.splice(i, 1);
    //     return [...values];
    //   });
    // }
  }

  drop(event: CdkDragDrop<unknown>) {
    moveItemInArray(
      this.items.controls,
      event.previousIndex,
      event.currentIndex,
    );
    moveItemInArray(
      this.bannerImages(),
      event.previousIndex,
      event.currentIndex,
    );
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  get isFormValid(): boolean {
    if (this.form.invalid) return false;
    if (this.items.length === 0) return false;

    const images = this.bannerImages();
    return this.items.controls.every((control, i) => {
      const banner = control.value;
      const image = images[i];
      if (!banner.id) return !!image?.file;
      return true;
    });
  }
  private getBanners(): void {
    this.contentService.getBanners().subscribe((data) => {
      this.bannerImages.set(data.map((item) => ({ preview: item.imageUrl })));
      data.forEach((item) => this.items.push(this.createBannerGroup(item)));
      this.changeDetectorRef.markForCheck();
    });
  }

  private createBannerGroup(banner?: HeroSlideResponse): FormGroup {
    return this.formBuilder.group({
      id: [banner?.id],
      title: [
        banner?.title ?? '',
        [Validators.required, Validators.maxLength(120)],
      ],
      description: [banner?.description],
      linkLabel: [banner?.linkLabel, Validators.maxLength(80)],
      linkUrl: [
        banner?.linkUrl,
        Validators.pattern(/^(https?:\/\/[^\s]+|\/(?!\/)[^\s]*)$/i),
      ],
      imageFileId: [banner?.imageFileId],
      isActive: [banner?.isActive ?? true],
    });
  }

  private scrollToBottom() {
    const el = this.scrollContainer().nativeElement;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: 'smooth',
    });
  }

  private showErrorMessage() {
    this.hasErrorMessage.set(true);

    setTimeout(() => {
      this.hasErrorMessage.set(false);
    }, 3000);
  }
}
