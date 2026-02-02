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
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

import { recurrenceValidator } from '../../../calendar/helpers';
import { CalendarEventForm } from '../../../calendar/components';
import { CommunicationManageDataSource } from '../../services';
import { CommunicationManageResponse } from '../../interfaces';
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
    StepperModule,
    SelectModule,
    ButtonModule,
    CalendarEventForm,
  ],
  templateUrl: './communication-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunicationEditor {
  private formBuilder = inject(FormBuilder);
  private diagloRef = inject(DynamicDialogRef);

  readonly data?: CommunicationManageResponse =
    inject(DynamicDialogConfig).data;

  private communicationService = inject(CommunicationManageDataSource);

  readonly currentDate = new Date();

  readonly types = this.communicationService.types;

  form: FormGroup = this.formBuilder.group({
    reference: ['', [Validators.required, Validators.minLength(3)]],
    code: ['', [Validators.required, Validators.minLength(3)]],
    typeId: ['', Validators.required],
    calendarEvent: this.formBuilder.group({
      title: ['', [Validators.required, Validators.maxLength(150)]],
      description: [''],
      startDate: [this.currentDate, Validators.required],
      endDate: [null],
      allDay: [true],
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

  readonly formUtils = FormUtils;

  constructor() {
    this.onHasEventChange();
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

  selectFile(event: FileSelectEvent) {
    const [file] = event.files;
    if (!file) return;
    this.file.set(file);
  }

  onHasEventChange() {
    effect(() => {
      const eventForm = this.calendarEventForm;
      if (this.hasEvent()) {
        eventForm?.enable();
      } else {
        eventForm?.disable();
      }
    });
  }

  setNameEvent() {
    const description = this.form.get('reference')?.value;
    this.form.get('calendarEvent.title')?.setValue(description);
  }

  get isFormValid() {
    return this.form.valid && (this.data || this.file() !== null);
  }

  get calendarEventForm() {
    return this.form.get('calendarEvent') as FormGroup;
  }

  private loadFormData(): void {
    if (!this.data) return;

    const { type, calendarEvent, originalName, ...props } = this.data;

    const formData = { ...props, typeId: type.id, calendarEvent: {} };

    if (calendarEvent) {
      this.hasEvent.set(true);
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
