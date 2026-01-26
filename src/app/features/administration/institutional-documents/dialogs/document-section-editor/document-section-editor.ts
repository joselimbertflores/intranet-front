import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { ListboxModule } from 'primeng/listbox';
import { ButtonModule } from 'primeng/button';

import { DocumentSectionDataSource } from '../../services';
import { DocumentSectionWithTypesResponse } from '../../interfaces';
import { FormUtils } from '../../../../../helpers';

@Component({
  selector: 'app-document-section-editor',
  imports: [
    CommonModule,
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

  readonly data?: DocumentSectionWithTypesResponse = inject(DynamicDialogConfig).data;

  documentTypes = toSignal(this.sectionService.getDocumentTypes(), {
    initialValue: [],
  });

  sectionForm: FormGroup = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    documentTypesIds: [[], [Validators.required, Validators.minLength(1)]],
    isActive: [true],
  });
  formUtils = FormUtils;

  ngOnInit() {
    this.loadForm();
  }

  close() {
    this.diagloRef.close();
  }

  save() {
    const subscription = this.data
      ? this.sectionService.update(this.data.id, this.sectionForm.value)
      : this.sectionService.create(this.sectionForm.value);
    subscription.subscribe((resp) => {
      this.diagloRef.close(resp);
    });
  }

  private loadForm(): void {
    if (!this.data) return;
    console.log(this.data);
    const { documentTypes, ...props } = this.data;
    const documentTypesIds = documentTypes.map((type) => type.id);
    this.sectionForm.patchValue({ ...props, documentTypesIds });
  }
}
