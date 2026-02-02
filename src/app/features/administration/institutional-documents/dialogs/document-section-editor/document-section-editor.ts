import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';

import { toSignal } from '@angular/core/rxjs-interop';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { ListboxModule } from 'primeng/listbox';
import { ButtonModule } from 'primeng/button';

import { DocSectionManageResponse } from '../../interfaces';
import { DocumentSectionDataSource } from '../../services';
import { FormUtils } from '../../../../../helpers';

@Component({
  selector: 'app-document-section-editor',
  imports: [
    ReactiveFormsModule,
    FloatLabelModule,
    InputTextModule,
    CheckboxModule,
    MessageModule,
    ListboxModule,
    ButtonModule,
  ],
  templateUrl: './document-section-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentSectionEditor {
  private diagloRef = inject(DynamicDialogRef);
  private formBuilder = inject(FormBuilder);
  private sectionService = inject(DocumentSectionDataSource);

  readonly data?: DocSectionManageResponse = inject(DynamicDialogConfig).data;

  readonly documentTypes = toSignal(this.sectionService.getDocumentTypes(), {
    initialValue: [],
  });
  readonly formUtils = FormUtils;

  form: FormGroup = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    documentTypesIds: [[], [Validators.required, Validators.minLength(1)]],
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
    const subscription = this.data
      ? this.sectionService.update(this.data.id, this.form.value)
      : this.sectionService.create(this.form.value);
    subscription.subscribe((resp) => {
      this.diagloRef.close(resp);
    });
  }

  private loadForm(): void {
    if (!this.data) return;
    const { documentTypes, ...props } = this.data;
    const documentTypesIds = documentTypes.map((type) => type.id);
    this.form.patchValue({ ...props, documentTypesIds });
  }
}
