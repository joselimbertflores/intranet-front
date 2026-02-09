import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';

import { SectionTreeNodeResponse } from '../../interfaces';
import { SectionDataSource } from '../../services';
import { FormUtils } from '../../../../../helpers';

interface DialogData {
  section?: SectionTreeNodeResponse;
  parent?: SectionTreeNodeResponse;
}
@Component({
  selector: 'app-document-section-editor',
  imports: [
    ReactiveFormsModule,
    FloatLabelModule,
    InputTextModule,
    CheckboxModule,
    MessageModule,
    SelectModule,
    ButtonModule,
    FormsModule,
  ],
  templateUrl: './document-section-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentSectionEditor {
  private diagloRef = inject(DynamicDialogRef);
  private formBuilder = inject(FormBuilder);
  private sectionService = inject(SectionDataSource);

  readonly data: DialogData = inject(DynamicDialogConfig).data;
  readonly formUtils = FormUtils;

  form: FormGroup = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    parentId: [null],
    isActive: [true],
  });

  ngOnInit() {
    this.loadForm();
  }

  close() {
    this.diagloRef.close();
  }

  save() {
    if (this.form.invalid) return this.form.markAllAsTouched();
    const subscription = this.data.section
      ? this.sectionService.update(this.data.section.id, this.form.value)
      : this.sectionService.create(this.form.value);
    subscription.subscribe((resp) => {
      this.diagloRef.close(resp);
    });
  }

  private loadForm(): void {
    const { parent, section } = this.data;
    this.form.patchValue({ ...section, parentId: parent?.id });
  }
}
