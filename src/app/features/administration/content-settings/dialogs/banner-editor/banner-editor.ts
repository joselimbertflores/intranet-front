import {
  ChangeDetectionStrategy,
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
} from '@angular/forms';
import {
  moveItemInArray,
  DragDropModule,
  CdkDragDrop,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';

import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

import { ContentSettingsDataSource } from '../../services';
import { BannerResponse } from '../../interfaces';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'banner-editor',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    DragDropModule,
    ButtonModule,
    TagModule,
    SelectModule,
    DragDropModule,
    CheckboxModule,
    ToggleSwitchModule,
    FloatLabelModule,
    MessageModule,
    ConfirmDialogModule,
  ],
  templateUrl: './banner-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
})
export class BannerEditor {
  private formBuilder = inject(FormBuilder);
  private dialogRef = inject(DynamicDialogRef);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private contentService = inject(ContentSettingsDataSource);
  private confirmationService = inject(ConfirmationService);

  bannerImages = signal<{ file?: File; preview?: string }[]>([]);

  form: FormGroup = this.formBuilder.group({
    items: this.formBuilder.array([]),
  });
  hasErrorMessage = signal(false);

  readonly scrollContainer = viewChild.required<ElementRef>('scrollContainer');
  readonly linkTypeOptions = [
    { label: 'Interno', value: 'INTERNAL' },
    { label: 'Externo', value: 'EXTERNAL' },
  ];

  ngOnInit() {
    this.getBanners();
  }

  save() {
    if (!this.isFormValid) {
      if (this.items.length > 0) this.showErrorMessage();
      return;
    }
    this.contentService
      .replaceBanners(
        this.items.controls.map((item, i: number) => ({
          ...item.value,
          file: this.bannerImages()[i]?.file,
        })),
      )
      .subscribe(() => {
        this.dialogRef.close();
      });
  }

  close() {
    this.dialogRef.close();
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
    if (control.value['id']) {
      this.confirmationService.confirm({
        message: '¿Esta seguro que desea eliminar el elemento?',
        header: 'Eliminar banner',
        rejectButtonProps: {
          label: 'Cancelar',
          severity: 'secondary',
          outlined: true,
        },
        acceptButtonProps: {
          label: 'Aceptar',
        },
        accept: () => {
          this.contentService
            .removeBanner(control.value['id'])
            .subscribe(() => {
              this.items.removeAt(i);
              this.bannerImages.update((values) => {
                values.splice(i, 1);
                return [...values];
              });
            });
        },
      });
    } else {
      this.items.removeAt(i);
      this.bannerImages.update((values) => {
        values.splice(i, 1);
        return [...values];
      });
    }
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

  private createBannerGroup(banner?: BannerResponse): FormGroup {
    return this.formBuilder.group({
      id: [banner?.id],
      title: [banner?.title],
      subtitle: [banner?.subtitle],
      linkType: [banner?.linkType ?? 'INTERNAL'],
      url: [banner?.url],
      openInNewTab: [banner?.openInNewTab ?? false],
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
