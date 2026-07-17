import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
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
import { HlmDialogHeader, HlmDialogFooter } from '@spartan-ng/helm/dialog';
import { HlmButton, HlmButtonImports } from '@spartan-ng/helm/button';
import { form, required, FormField, applyEach } from '@angular/forms/signals';
import {
  HlmFieldGroup,
  HlmField,
  HlmFieldImports,
} from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { HlmCheckbox, HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmLabelImports } from '@spartan-ng/helm/label';

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
    CommonModule,
    DragDropModule,
    DragDropModule,
    HlmDialogHeader,
    HlmDialogFooter,
    HlmButton,
    HlmFieldGroup,
    FormField,
    HlmInputImports,
    HlmButtonImports,
    HlmFieldImports,
    HlmTextareaImports,
    HlmCheckbox,
    HlmLabelImports,
    HlmCheckboxImports,
    HlmFieldImports,
  ],
  templateUrl: './banner-editor.html',
})
export class BannerEditor {
  private formBuilder = inject(FormBuilder);
  // private dialogRef = inject(DynamicDialogRef);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private contentService = inject(ContentSettingsDataSource);
  // private confirmationService = inject(ConfirmationService);

  bannerImages = signal<{ file?: File; preview?: string }[]>([]);

  formModel = signal<HeroSlideFormData[]>([]);

  form: FormGroup = this.formBuilder.group({
    items: this.formBuilder.array([]),
  });

  formSignal = form(this.formModel, (schemaPath) => {
    // applyEach(schemaPath, (item) => {
    //   required(item.file, {
    //     when: (ctx) => {
    //       return ctx.valueOf(item.imageFileId) === null;
    //     },
    //   });
    // });
  });

  hasErrorMessage = signal(false);

  readonly scrollContainer = viewChild.required<ElementRef>('scrollContainer');

  ngOnInit() {
    // this.getBanners();
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

    // this.formModel.update((values) => {
    //   values[i].file = file;
    //   return [...values];
    // });
  }

  addBanner(item?: HeroSlideFormData) {
    // this.items.push(this.createBannerGroup());
    // this.bannerImages.update((values) => [
    //   ...values,
    //   { preview: undefined, file: undefined },
    // ]);
    this.formModel.update((values) => [
      ...values,
      {
        id: item?.id ?? null,
        title: item?.title ?? '',
        description: '',
        linkLabel: '',
        linkUrl: '',
        imageFileId: null,
        isActive: true,
      },
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
      this.changeDetectorRef.markForCheck();
      data.forEach((item) => {
        this.addBanner({
          id: item.id,
          title: item.title,
          imageFileId: item.imageFileId,
          description: '',

          linkLabel: '',
          linkUrl: '',
          isActive: true,
        });
      });
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
