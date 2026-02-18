import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
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
import { CommunicationAdminResponse } from '../../interfaces';
import { FormUtils } from '../../../../../helpers';

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
  ],
  templateUrl: './communication-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunicationEditor {
  private formBuilder = inject(FormBuilder);
  private diagloRef = inject(DynamicDialogRef);

  readonly data?: CommunicationAdminResponse = inject(DynamicDialogConfig).data;

  private communicationService = inject(CommunicationAdminDataSource);

  readonly types = this.communicationService.types;
  readonly formUtils = FormUtils;

  form: FormGroup = this.formBuilder.group({
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
    typeId: ['', Validators.required],
  });
  file = signal<File | null>(null);

  ngOnInit() {
    this.loadFormData();
  }

  save() {
    if (!this.isFormValid) return this.form.markAllAsTouched();

    const subscription = this.data
      ? this.communicationService.update(
          this.data.id,
          this.form.value,
          this.file(),
        )
      : this.communicationService.create(this.form.value, this.file()!);

    subscription.subscribe((resp) => {
      this.diagloRef.close(resp);
    });
  }

  close() {
    this.diagloRef.close();
  }

  selectFile(event: FileSelectEvent) {
    const [file] = event.files;
    if (!file) return;
    this.file.set(file);
  }

  get isFormValid() {
    return this.form.valid && (this.data || this.file() !== null);
  }

  private loadFormData(): void {
    if (!this.data) return;
    const { type, file, ...props } = this.data;
    this.form.patchValue({ ...props, typeId: type.id });
  }
}
