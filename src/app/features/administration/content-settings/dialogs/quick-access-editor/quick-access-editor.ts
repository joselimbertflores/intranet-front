
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
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
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

import { CustomFormValidators } from '../../../../../../helpers';
import { ContentSettingsDataSource } from '../../services';
import { ImagePreview, QuickAccessResponse } from '../../interfaces';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quick-access-editor',
  imports: [
    CommonModule,
    DragDropModule,
    ReactiveFormsModule,
    FloatLabelModule,
    InputTextModule,
    ButtonModule
],
  templateUrl: './quick-access-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickAccessEditor {
  private formBuilder = inject(FormBuilder);
  private dialogRef = inject(DynamicDialogRef);
  private conentDataSource = inject(ContentSettingsDataSource);

  form: FormGroup = this.formBuilder.nonNullable.group({
    items: this.formBuilder.array([], CustomFormValidators.minLengthArray(1)),
  });
  quickAccessImages = signal<ImagePreview[]>([]);
  scrollContainer = viewChild.required<ElementRef>('scrollContainer');

  ngOnInit() {
    this.loadForm();
  }

  save() {
    const { items = [] } = this.form.value;
    const itemsToUpload = this.quickAccessImages().map((image, index) => ({
      ...image,
      ...items[index],
    }));
    this.conentDataSource.replaceQuickAccess(itemsToUpload).subscribe(() => {
      this.dialogRef.close();
    });
  }

  close() {
    this.dialogRef.close();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = this.extractFileFromEvent(event);
    files.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const preview = reader.result as string;
        this.addItem(file, preview);
      };
      reader.readAsDataURL(file);
    });
    input.value = '';
  }

  drop(event: CdkDragDrop<object[]>) {
    moveItemInArray(
      this.quickAccessImages(),
      event.previousIndex,
      event.currentIndex
    );
    moveItemInArray(
      this.itemsFormArray.controls,
      event.previousIndex,
      event.currentIndex
    );
    this.itemsFormArray.updateValueAndValidity();
  }

  removeSlide(index: number) {
    this.itemsFormArray.removeAt(index);
    this.quickAccessImages.update((values) => {
      values.splice(index, 1);
      return [...values];
    });
  }

  get itemsFormArray(): FormArray {
    return this.form.get('items') as FormArray;
  }

  private extractFileFromEvent(event: Event): File[] {
    const inputElement = event.target as HTMLInputElement | null;
    if (!inputElement?.files || inputElement.files?.length === 0) return [];
    const files = Array.from(inputElement.files).filter((file) => {
      return (
        file?.name === file.name &&
        file.size === file.size &&
        file.lastModified === file.lastModified
      );
    });
    return files;
  }

  private addItem(file: File, preview: string) {
    this.itemsFormArray.push(this.createQuickAccesFormControl());
    this.quickAccessImages.update((values) => [
      ...values,
      { file, url: preview },
    ]);
    setTimeout(() => {
      this.scrollToBottom();
    });
  }

  private createQuickAccesFormControl(item?: QuickAccessResponse) {
    return this.formBuilder.group({
      name: [item?.name, [Validators.required, Validators.maxLength(100)]],
      redirectUrl: [item?.redirectUrl, Validators.required],
    });
  }

  private loadForm(): void {
    this.conentDataSource.getQuickAccess().subscribe((data) => {
      this.quickAccessImages.set(
        data.map((item) => ({ ...item, url: item.iconUrl }))
      );
      data.forEach((item) => {
        this.itemsFormArray.push(this.createQuickAccesFormControl(item));
      });
    });
  }

  private scrollToBottom() {
    const el = this.scrollContainer().nativeElement;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: 'smooth',
    });
  }
}
