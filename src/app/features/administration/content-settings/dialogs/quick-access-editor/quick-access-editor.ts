import {
  ChangeDetectionStrategy,
  viewChild,
  Component,
  ElementRef,
  inject,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
} from '@angular/forms';
import {
  moveItemInArray,
  DragDropModule,
  CdkDragDrop,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';

import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ColorPickerModule } from 'primeng/colorpicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';

import { CustomFormValidators } from '../../../../../../helpers';
import { ContentSettingsDataSource } from '../../services';
import { QuickAccessResponse } from '../../interfaces';
import { FormUtils } from '../../../../../helpers';

@Component({
  selector: 'app-quick-access-editor',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FloatLabelModule,
    InputTextModule,
    DragDropModule,
    MessageModule,
    ButtonModule,
    ColorPickerModule,
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
  readonly scrollContainer = viewChild.required<ElementRef>('scrollContainer');
  readonly formUtils = FormUtils;

  ngOnInit() {
    this.loadForm();
  }

  save() {
    if (this.form.invalid) return this.form.markAllAsTouched();
    const { items = [] } = this.form.value;
    this.conentDataSource.replaceQuickAccessItems(items).subscribe(() => {
      this.dialogRef.close();
    });
  }

  close() {
    this.dialogRef.close();
  }

  addItem() {
    if (this.itemsFormArray.length > 12) return;
    this.itemsFormArray.push(this.createItemGroup());
    setTimeout(() => {
      this.scrollToBottom();
    });
  }

  removeItem(index: number) {
    this.itemsFormArray.removeAt(index);
  }

  drop(event: CdkDragDrop<object[]>) {
    moveItemInArray(
      this.itemsFormArray.controls,
      event.previousIndex,
      event.currentIndex,
    );
    this.itemsFormArray.updateValueAndValidity();
  }

  get itemsFormArray(): FormArray {
    return this.form.get('items') as FormArray;
  }

  private createItemGroup(data?: Partial<QuickAccessResponse>): FormGroup {
    return this.formBuilder.group({
      id: [data?.id ?? null],
      name: [data?.name ?? '', [Validators.required, Validators.maxLength(80)]],
      icon: [
        data?.icon ?? '',
        [Validators.required, Validators.pattern(/^pi\s+pi-[a-z0-9-]+$/)],
      ],
      url: [
        data?.url ?? '',
        [Validators.required, Validators.pattern(/^https?:\/\/.+/i)],
      ],
      color: [
        data?.color ?? '#2563EB',
        [Validators.pattern(/^#[0-9A-Fa-f]{6}$/)],
      ],
    });
  }

  private loadForm(): void {
    this.conentDataSource.getQuickAccess().subscribe((data) => {
      data.forEach((item) => {
        this.itemsFormArray.push(this.createItemGroup(item));
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
