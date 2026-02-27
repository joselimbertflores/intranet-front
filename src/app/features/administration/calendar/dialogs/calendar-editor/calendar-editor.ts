import {
  inject,
  Component,
  ChangeDetectionStrategy,
  OnInit,
  signal,
  effect,
} from '@angular/core';
import {
  FormGroup,
  Validators,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';

import { CalendarEventResponse } from '../../interfaces';
import { CalendarDataSource } from '../../services';
import { recurrenceValidator } from '../../helpers';
import { FormUtils } from '../../../../../helpers';

interface DialogData extends Partial<CalendarEventResponse> {
  communicationId?: string;
  loadEntity?: boolean;
}
@Component({
  selector: 'app-calendar-editor',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    MultiSelectModule,
    FloatLabelModule,
    DatePickerModule,
    InputTextModule,
    CheckboxModule,
    MessageModule,
    TextareaModule,
    SelectModule,
    InputNumber,
  ],
  templateUrl: './calendar-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarEditor implements OnInit {
  private formBuilder = inject(FormBuilder);
  private diagloRef = inject(DynamicDialogRef);
  private calendarDataSource = inject(CalendarDataSource);

  readonly currentDate = new Date();
  readonly data?: DialogData = inject(DynamicDialogConfig).data;

  formSubmitted = signal(false);
  form: FormGroup = this.formBuilder.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
    startDate: [this.currentDate, Validators.required],
    endDate: [null],
    allDay: [true],
    isActive: [true],
    recurrence: this.formBuilder.group(
      {
        frequency: [null],
        interval: [1],
        byWeekDays: [[]],
        until: [null],
      },
      { validators: recurrenceValidator },
    ),
  });
  isRecurring = signal(false);
  formUtils = FormUtils;

  constructor() {
    effect(() => {
      this.onRecurringToggle(this.isRecurring());
    });
  }

  ngOnInit(): void {
    this.loadForm();
  }

  readonly frequencies = [
    { label: 'Diario', value: 'DAILY' },
    { label: 'Semanal', value: 'WEEKLY' },
    { label: 'Mensual', value: 'MONTHLY' },
    { label: 'Anual', value: 'YEARLY' },
  ];

  readonly weekDays = [
    { label: 'Lunes', value: 'MO' },
    { label: 'Martes', value: 'TU' },
    { label: 'Miércoles', value: 'WE' },
    { label: 'Jueves', value: 'TH' },
    { label: 'Viernes', value: 'FR' },
    { label: 'Sábado', value: 'SA' },
    { label: 'Domingo', value: 'SU' },
  ];

  save() {
    this.formSubmitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const saveObservable = this.data?.id
      ? this.calendarDataSource.update(this.data.id, this.form.value)
      : this.calendarDataSource.create({
          ...this.form.value,
          communicationId: this.data?.communicationId,
        });

    saveObservable.subscribe((resp) => {
      this.diagloRef.close(resp);
    });
  }

  onAllDayToggle() {
    if (this.isAllDay) {
      this.form.patchValue({ endDate: null });
    }
  }

  close() {
    this.diagloRef.close();
  }

  get isAllDay() {
    return this.form.get('allDay')?.value;
  }

  private onRecurringToggle(checked: boolean) {
    const recurrenceGroup = this.form.get('recurrence');
    if (!checked) {
      recurrenceGroup?.disable();
    } else {
      recurrenceGroup?.reset({
        frequency: null,
        interval: 1,
        byWeekDays: [],
        until: null,
      });
      recurrenceGroup?.enable();
    }
  }

  private loadForm(): void {
    if (!this.data) return;
    if (this.data.id && this.data.loadEntity) {
      return this.loadEventPropsFromId(this.data.id);
    }
    this.setFormValues(this.data);
  }

  private loadEventPropsFromId(id: string) {
    this.calendarDataSource.getOne(id).subscribe((resp) => {
      this.setFormValues(resp);
    });
  }

  private setFormValues(event: Partial<CalendarEventResponse>) {
    const { recurrenceConfig, startDate, endDate, ...props } = event;
    if (recurrenceConfig) this.isRecurring.set(true);
    setTimeout(() => {
      this.form.patchValue({
        ...props,
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        recurrence: recurrenceConfig,
      });
    }, 0);
  }
}
