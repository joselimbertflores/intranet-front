import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormArray,
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';

import { DocumentTypeWithSubTypesResponse, DocumentSubtypeResponse } from '../../interfaces';
import { DocumentTypeDataSource } from '../../services';
import { FormUtils } from '../../../../../helpers';

@Component({
  selector: 'app-document-type-editor',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ConfirmDialogModule,
    FloatLabelModule,
    CheckboxModule,
    InputTextModule,
    MessageModule,
    ButtonModule,
  ],
  templateUrl: './document-type-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
})
export class DocumentTypeEditor {
  private formBuilder = inject(FormBuilder);
  private diagloRef = inject(DynamicDialogRef);
  private documentTypeDataSource = inject(DocumentTypeDataSource);
  private confirmationService = inject(ConfirmationService);

  readonly data?: DocumentTypeWithSubTypesResponse = inject(DynamicDialogConfig).data;

  form: FormGroup = this.formBuilder.nonNullable.group({
    name: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
    ],
    subtypes: this.formBuilder.array([]),
    isActive: [true, Validators.required],
  });

  formUtils = FormUtils;

  ngOnInit() {
    this.loadForm();
  }

  save() {
    if (this.form.invalid) return;
    const subscription = this.data
      ? this.documentTypeDataSource.update(this.data!.id, this.form.value)
      : this.documentTypeDataSource.create(this.form.value);

    subscription.subscribe(() => {
      this.diagloRef.close();
    });
  }

  close() {
    this.diagloRef.close();
  }

  addSubtype(subtype?: DocumentSubtypeResponse) {
    this.subTypes.push(
      this.formBuilder.group({
        id: [subtype?.id ?? null],
        name: [
          subtype?.name ?? '',
          [Validators.required, Validators.minLength(3)],
        ],
        isActive: [subtype?.isActive ?? true, Validators.required],
      }),
    );
  }

  removeSubtype(index: number): void {
    const subtype = this.subTypes.at(index).value;
    if (!subtype['id']) {
      return this.subTypes.removeAt(index);
    }
    if (!this.data) return;
    this.confirmationService.confirm({
      message: `¿Eliminar el subtipo "${subtype.name}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-info-circle',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Eliminar',
        severity: 'danger',
      },
      accept: () => {
        this.documentTypeDataSource
          .removeSubtype(this.data!.id, subtype.id)
          .subscribe(() => {
            this.subTypes.removeAt(index);
          });
      },
    });
  }

  get subTypes() {
    return this.form.get('subtypes') as FormArray;
  }

  private loadForm() {
    if (!this.data) return;
    const { subtypes, ...props } = this.data;
    subtypes.forEach((item) => {
      this.addSubtype(item);
    });
    this.form.patchValue(props);
  }
}
