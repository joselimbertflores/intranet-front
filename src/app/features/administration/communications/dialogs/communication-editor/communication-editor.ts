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
  FormsModule,
} from '@angular/forms';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

import { CommunicationManageDataSource } from '../../services';
import { recurrenceValidator } from '../../../calendar/helpers';
import { FormUtils } from '../../../../../helpers';
import { CalendarEventForm } from '../../../calendar/components';
import { CommonModule } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-communication-editor',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FloatLabelModule,
    MessageModule,
    ButtonModule,
    SelectModule,
    TextareaModule,
    FileUploadModule,
    InputTextModule,
    StepperModule,
    CalendarEventForm,
    CheckboxModule,
  ],
  templateUrl: './communication-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunicationEditor {
  private formBuilder = inject(FormBuilder);
  private diagloRef = inject(DynamicDialogRef);

  readonly data?: any = inject(DynamicDialogConfig).data;

  private communicationService = inject(CommunicationManageDataSource);

  readonly currentDate = new Date();
  types = this.communicationService.types;

  form: FormGroup = this.formBuilder.group({
    reference: ['', [Validators.required, Validators.minLength(3)]],
    code: ['', [Validators.required, Validators.minLength(3)]],
    typeId: ['', Validators.required],
    calendarEvent: this.formBuilder.group({
      title: ['', [Validators.required, Validators.maxLength(150)]],
      description: [''],
      startDate: [this.currentDate, Validators.required],
      endDate: [null],
      allDay: [false],
      recurrence: this.formBuilder.group(
        {
          frequency: [null],
          interval: [1],
          byWeekDays: [[]],
          until: [null],
        },
        { validators: recurrenceValidator },
      ),
    }),
  });
  hasEvent = signal(false);

  file = signal<File | null>(null);
  selectedFileName = linkedSignal(() => this.file()?.name);

  formUtils = FormUtils;

  constructor() {
    this.form.get('calendarEvent')?.disable();
  }

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

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const [file] = input.files ?? [];
    if (!file || file.type !== 'application/pdf') return;
    this.file.set(file);
  }

  selectFile(event: FileSelectEvent) {
    const [file] = event.files;
    if (!file) return;
    this.file.set(file);
  }

  onHasEventChange(checked: boolean) {
    const eventForm = this.calendarEventForm;
    if (checked) {
      eventForm?.enable();
    } else {
      eventForm?.disable();
    }
  }

  get isFormValid() {
    return this.form.valid && (this.data || this.file() !== null);
  }

  get calendarEventForm() {
    return this.form.get('calendarEvent') as FormGroup;
  }

  private loadFormData() {
    if (!this.data) return;
    this.selectedFileName.set(this.data.originalName);
    const { type, ...proos } = this.data;
    this.form.patchValue({ ...proos, typeId: type.id });
  }
}
