import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormArray,
  FormGroup,
} from '@angular/forms';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';

import {
  DocumentTypeWithSubTypesResponse,
  DocumentSubtypeResponse,
} from '../../interfaces';

import { DocumentTypeDatasource } from '../../services';
import { FormUtils } from '../../../../../helpers';

interface SubTypeOption {
  id: number | null;
  name: string;
  isActive: boolean;
}
@Component({
  selector: 'app-document-type-editor',
  imports: [
    ReactiveFormsModule,
    ConfirmDialogModule,
    FloatLabelModule,
    CheckboxModule,
    InputTextModule,
    MessageModule,
    ButtonModule,
  ],
  templateUrl: './document-type-editor.html',
  providers: [ConfirmationService],
})
export class DocumentTypeEditor {
  private formBuilder = inject(FormBuilder);
  private confirmationService = inject(ConfirmationService);
  private docTypeDatasource = inject(DocumentTypeDatasource);

  diagloRef = inject(DynamicDialogRef);
  readonly data: DocumentTypeWithSubTypesResponse | undefined =
    inject(DynamicDialogConfig).data;

  form: FormGroup = this.formBuilder.nonNullable.group({
    name: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
    ],
    subtypes: this.formBuilder.array([]),
    isActive: [true],
  });

  readonly formUtils = FormUtils;

  ngOnInit() {
    this.loadForm();
  }

  save() {
    if (this.form.invalid) return this.form.markAllAsTouched();
    const subscription = this.data
      ? this.docTypeDatasource.update(this.data!.id, this.form.value)
      : this.docTypeDatasource.create(this.form.value);

    subscription.subscribe((data) => {
      this.diagloRef.close(data);
    });
  }

  addSubtype(subtype?: DocumentSubtypeResponse) {
    this.subtypes.push(
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

  deleteSubtype(index: number) {
    const subtype: SubTypeOption = this.subtypes.at(index).getRawValue();

    const subtypeId = subtype.id;

    if (!subtypeId) {
      this.subtypes.removeAt(index);
      return;
    }

    const typeId = this.data?.id;
    if (!typeId) return;

    this.confirmationService.confirm({
      header: 'Confirmar eliminación',
      message: `¿Eliminar el subtipo "${subtype.name}"?`,
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
        this.docTypeDatasource.removeSubtype(subtypeId).subscribe(() => {
          this.subtypes.removeAt(index);
          this.docTypeDatasource.emitSubtypeRemoved(typeId, subtypeId);
        });
      },
    });
  }

  get subtypes() {
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
