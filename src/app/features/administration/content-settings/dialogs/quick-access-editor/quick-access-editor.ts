import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
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
import { CommonModule } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

import { CustomFormValidators } from '../../../../../../helpers';
import { FormUtils } from '../../../../../helpers';
import { QuickAccessBatchItem, QuickAccessResponse } from '../../interfaces';
import { ContentSettingsDataSource } from '../../services';

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
    CheckboxModule,
    SelectModule,
    TextareaModule,
  ],
  templateUrl: './quick-access-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickAccessEditor {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly contentDataSource = inject(ContentSettingsDataSource);

  readonly iconOptions = [
    { label: 'Correo', value: 'mail', icon: 'pi pi-envelope' },
    { label: 'Sistemas', value: 'systems', icon: 'pi pi-desktop' },
    { label: 'Documentos', value: 'documents', icon: 'pi pi-file' },
    { label: 'Gaceta', value: 'gaceta', icon: 'pi pi-book' },
    { label: 'Formularios', value: 'forms', icon: 'pi pi-list-check' },
    { label: 'Soporte', value: 'support', icon: 'pi pi-question-circle' },
  ];
  readonly form: FormGroup = this.formBuilder.nonNullable.group({
    items: this.formBuilder.array([], CustomFormValidators.minLengthArray(1)),
  });
  readonly scrollContainer = viewChild.required<ElementRef>('scrollContainer');
  readonly formUtils = FormUtils;

  ngOnInit(): void {
    this.loadForm();
  }

  save(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();

    const items: QuickAccessBatchItem[] = this.itemsFormArray
      .getRawValue()
      .map((item) => ({
        ...(item.id ? { id: item.id } : {}),
        title: item.title,
        description: item.description?.trim() || undefined,
        iconKey: item.iconKey,
        url: item.url,
        isActive: item.isActive,
      }));

    this.contentDataSource.replaceQuickAccessItems(items).subscribe(() => {
      this.dialogRef.close();
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  addItem(): void {
    if (this.itemsFormArray.length >= 12) return;
    this.itemsFormArray.push(this.createItemGroup());
    setTimeout(() => this.scrollToBottom());
  }

  removeItem(index: number): void {
    const id = this.itemsFormArray.at(index).get('id')?.value as number | null;
    if (!id) {
      this.itemsFormArray.removeAt(index);
      return;
    }

    this.contentDataSource.removeQuickAccess(id).subscribe(() => {
      this.itemsFormArray.removeAt(index);
    });
  }

  drop(event: CdkDragDrop<object[]>): void {
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

  iconClass(iconKey: string): string {
    return (
      this.iconOptions.find((option) => option.value === iconKey)?.icon ??
      'pi pi-link'
    );
  }

  private createItemGroup(data?: Partial<QuickAccessResponse>): FormGroup {
    return this.formBuilder.group({
      id: [data?.id ?? null],
      title: [
        data?.title ?? '',
        [Validators.required, Validators.maxLength(120)],
      ],
      description: [data?.description ?? ''],
      iconKey: [data?.iconKey ?? 'systems', Validators.required],
      url: [
        data?.url ?? '',
        [Validators.required, Validators.pattern(/^https?:\/\/.+/i)],
      ],
      isActive: [data?.isActive ?? true],
    });
  }

  private loadForm(): void {
    this.contentDataSource.getQuickAccess().subscribe((data) => {
      data.forEach((item) => {
        this.itemsFormArray.push(this.createItemGroup(item));
      });
    });
  }

  private scrollToBottom(): void {
    const el = this.scrollContainer().nativeElement;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }
}
