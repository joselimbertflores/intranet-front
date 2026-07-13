import { Component, inject, signal } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

import { CommunicationAdminDataSource } from '../../services';
import { CommunicationResponse } from '../../interfaces';
import { FormUtils } from '../../../../../helpers';
import { finalize } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-communication-editor',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    FloatLabelModule,
    FileUploadModule,
    InputTextModule,
    TextareaModule,
    CheckboxModule,
    MessageModule,
    SelectModule,
    ButtonModule,
    ConfirmDialogModule,
  ],
  templateUrl: './communication-editor.html',
  providers: [ConfirmationService],
})
export class CommunicationEditor {
  private formBuilder = inject(FormBuilder);
  private dialogRef = inject(DynamicDialogRef);

  readonly data?: CommunicationResponse = inject(DynamicDialogConfig).data;

  private communicationService = inject(CommunicationAdminDataSource);
  private confirmationService = inject(ConfirmationService);

  readonly types = this.communicationService.types;
  readonly formUtils = FormUtils;

  formSubmitted = signal(false);
  isSaving = signal(false);

  form = this.formBuilder.group({
    reference: ['', [Validators.required, Validators.minLength(3)]],
    code: [
      '',
      [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z0-9\/-]+$/),
      ],
    ],
    isActive: [true],
    typeId: [null as number | null, Validators.required],
  });
  file = signal<File | null>(null);

  ngOnInit() {
    this.loadFormData();
  }

  save() {
    if (this.isSaving()) return;

    this.formSubmitted.set(true);

    if (!this.isFormValid) {
      this.form.markAllAsTouched();
      return;
    }

    const isDisablingWithEvent =
      this.data?.isActive === true &&
      this.form.controls.isActive.value === false &&
      !!this.data.eventId;

    if (isDisablingWithEvent) {
      this.confirmationService.confirm({
        header: 'Desactivar comunicado',
        message: 'El comunicado tiene un evento asociado. El evento conservará su estado.',
        acceptButtonProps: { label: 'Desactivar' },
        rejectButtonProps: { label: 'Cancelar', severity: 'secondary' },
        accept: () => this.persistCommunication(),
      });
      return;
    }
    this.persistCommunication();
  }

  close() {
    this.dialogRef.close();
  }

  selectFile(event: FileSelectEvent) {
    const [file] = event.files;
    if (!file) return;
    this.file.set(file);
  }

  get isFormValid() {
    return this.form.valid && (this.data?.file || this.file());
  }

  private loadFormData(): void {
    if (!this.data) return;
    const { type, file, ...props } = this.data;
    this.form.patchValue({ ...props, typeId: type.id });
  }

  private persistCommunication() {
    if (this.isSaving()) return;

    this.isSaving.set(true);

    const request$ = this.data
      ? this.communicationService.update(
          this.data.id,
          this.form.getRawValue(),
          this.file(),
        )
      : this.communicationService.create(this.form.getRawValue(), this.file()!);

    request$
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe((response) => {
        this.dialogRef.close(response);
      });
  }
}
