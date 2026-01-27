import {
  ChangeDetectionStrategy,
  linkedSignal,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

import { CommunicationManageDataSource } from '../../services';
import { FormUtils } from '../../../../../helpers';

@Component({
  selector: 'app-communication-editor',
  imports: [
    ReactiveFormsModule,
    FloatLabelModule,
    MessageModule,
    ButtonModule,
    SelectModule,
    TextareaModule,
    FileUploadModule,
    InputTextModule,
  ],
  templateUrl: './communication-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunicationEditor {
  private formBuilder = inject(FormBuilder);
  private diagloRef = inject(DynamicDialogRef);

  readonly data?: any = inject(DynamicDialogConfig).data;

  private communicationService = inject(CommunicationManageDataSource);

  types = this.communicationService.types;

  form: FormGroup = this.formBuilder.nonNullable.group({
    reference: ['', [Validators.required, Validators.minLength(3)]],
    code: ['', [Validators.required, Validators.minLength(3)]],
    typeId: ['', Validators.required],
  });

  file = signal<File | null>(null);
  selectedFileName = linkedSignal(() => this.file()?.name);

  formUtils = FormUtils;

  ngOnInit() {
    this.loadFormData();
  }

  save() {
    if (!this.isFormValid) return;
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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const [file] = input.files ?? [];
    if (!file || file.type !== 'application/pdf') return;
    this.file.set(file);
  }

  get isFormValid() {
    return this.form.valid && (this.data || this.file() !== null);
  }

  private loadFormData() {
    if (!this.data) return;
    this.selectedFileName.set(this.data.originalName);
    const { type, ...proos } = this.data;
    this.form.patchValue({ ...proos, typeId: type.id });
  }
}
