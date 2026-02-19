import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormArray,
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';

import { TutorialDataSource } from '../../services';
import { TutorialResponse } from '../../interfaces';
import { FormUtils } from '../../../../../helpers';

@Component({
  selector: 'tutorial-editor',
  imports: [
    ReactiveFormsModule,
    FloatLabelModule,
    InputTextModule,
    TextareaModule,
    CheckboxModule,
    MessageModule,
    ButtonModule,
    SelectModule,
  ],
  templateUrl: './tutorial-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TutorialEditor {
  private dialogRef = inject(DynamicDialogRef);
  private formBuilder = inject(FormBuilder);
  private tutorialData = inject(TutorialDataSource);

  readonly data?: TutorialResponse = inject(DynamicDialogConfig).data;

  tutorialForm: FormGroup = this.formBuilder.nonNullable.group({
    title: [
      '',
      [
        Validators.required,
        Validators.maxLength(80),
        Validators.pattern(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s]+$/),
      ],
    ],
    summary: [''],
    categoryId: [''],
    isPublished: [true],
  });

  categories = toSignal(this.tutorialData.getCategories(), {
    initialValue: [],
  });
  formUtils = FormUtils;

  constructor() {}

  ngOnInit() {
    this.loadForm();
  }

  save() {
    if (this.tutorialForm.invalid) return;

    const subscription = this.data
      ? this.tutorialData.update(this.data.id, this.tutorialForm.value)
      : this.tutorialData.create(this.tutorialForm.value);

    subscription.subscribe((resp) => {
      this.dialogRef.close(resp);
    });
  }

  close() {
    this.dialogRef.close();
  }

  get videosFormArray(): FormArray {
    return this.tutorialForm.get('videos') as FormArray;
  }

  private loadForm(): void {
    if (!this.data) return;
    const { category, ...rest } = this.data;
    this.tutorialForm.patchValue({ ...rest, categoryId: category.id });
  }
}
