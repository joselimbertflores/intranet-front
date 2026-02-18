import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';

import { FormUtils } from '../../../../../helpers';
import { TutorialCategoryDataSource } from '../../services';
import { TutorialCategoryResponse } from '../../interfaces';

@Component({
  selector: 'app-tutorial-category-editor',
  imports: [
    ReactiveFormsModule,
    FloatLabelModule,
    InputTextModule,
    MessageModule,
    ButtonModule,
  ],
  templateUrl: './tutorial-category-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TutorialCategoryEditor {
  private dialogRef = inject(DynamicDialogRef);
  private formBuilder = inject(FormBuilder);
  private tutorialCategoryDataSource = inject(TutorialCategoryDataSource);

  readonly data?: TutorialCategoryResponse = inject(DynamicDialogConfig).data;
  readonly formUtils = FormUtils;

  form: FormGroup = this.formBuilder.nonNullable.group({
    name: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(120)],
    ],
  });

  ngOnInit() {
    this.loadForm();
  }

  save() {
    if (this.form.invalid) {
      return this.form.markAllAsTouched();
    }

    const subscription = this.data
      ? this.tutorialCategoryDataSource.update(
          this.data.id,
          this.form.getRawValue(),
        )
      : this.tutorialCategoryDataSource.create(this.form.getRawValue());

    subscription.subscribe((result) => {
      this.dialogRef.close(result);
    });
  }

  close() {
    this.dialogRef.close();
  }

  private loadForm() {
    if (!this.data) return;
    this.form.patchValue({ name: this.data.name });
  }
}
