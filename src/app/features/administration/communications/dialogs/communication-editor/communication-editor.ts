import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  effect,
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
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

import { CommunicationManageDataSource } from '../../services';
import { CommunicationManageResponse } from '../../interfaces';
import { FormUtils } from '../../../../../helpers';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-communication-editor',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    ConfirmDialogModule,
    FloatLabelModule,
    FileUploadModule,
    InputTextModule,
    TextareaModule,
    CheckboxModule,
    MessageModule,
    StepperModule,
    SelectModule,
    ButtonModule,
  ],
  templateUrl: './communication-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
})
export class CommunicationEditor {
  private formBuilder = inject(FormBuilder);
  private diagloRef = inject(DynamicDialogRef);
  private confirmationService = inject(ConfirmationService);

  readonly data?: CommunicationManageResponse =
    inject(DynamicDialogConfig).data;

  private communicationService = inject(CommunicationManageDataSource);

  readonly currentDate = new Date();

  readonly types = this.communicationService.types;
  readonly formUtils = FormUtils;

  form: FormGroup = this.formBuilder.group({
    reference: ['', [Validators.required, Validators.minLength(3)]],
    code: ['', [Validators.required, Validators.minLength(3)]],
    typeId: ['', Validators.required],
    isActive: [true],
  });
  file = signal<File | null>(null);

  constructor() {}

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

  get calendarEventForm() {
    return this.form.get('calendarEvent') as FormGroup;
  }

  private showDeleteEventMessage(): void {
    this.confirmationService.confirm({
      header: 'Aviso: "Eliminación evento"',
      message:
        'Guardar cambios sin "Adjuntar evento" eliminara el evento vinculado al comunicado.',
      rejectVisible: false,
      acceptButtonProps: {
        label: 'Aceptar',
        severity: 'secondary',
        size: 'small',
      },
    });
  }

  private loadFormData(): void {
    if (!this.data) return;

    const { type, calendarEvent, originalName, ...props } = this.data;

    const formData = { ...props, typeId: type.id, calendarEvent: {} };

    if (calendarEvent) {
      const { recurrenceConfig, startDate, endDate, ...eventProps } =
        calendarEvent;
      formData.calendarEvent = {
        ...eventProps,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        recurrence: recurrenceConfig,
      };
    }
    this.form.patchValue(formData);
  }
}
