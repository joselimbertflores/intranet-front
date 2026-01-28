import {
  inject,
  signal,
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CalendarDataSource } from '../../services';

type Frecuency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

interface RecurrenceConfig {
  frequency: Frecuency;
  interval: number;
  byWeekDays: string[];
  until?: Date | null;
}

@Component({
  selector: 'app-calendar-editor',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    ButtonModule,
    MultiSelectModule,
    InputNumberModule,
    DatePickerModule,
    FloatLabelModule,
    DatePickerModule,
    InputTextModule,
    CheckboxModule,
    TextareaModule,
    SelectModule,
  ],
  templateUrl: './calendar-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarEditor {
  private formBuilder = inject(FormBuilder);
  private diagloRef = inject(DynamicDialogRef);

  private calendarDataSource = inject(CalendarDataSource);

  readonly currentDate = new Date();
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

  form: FormGroup = this.formBuilder.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
    startDate: [this.currentDate, Validators.required],
    endDate: [null],
    allDay: [false],
  });

  isRecurring = signal(false);
  recurrence = signal<RecurrenceConfig>({
    frequency: 'YEARLY',
    interval: 1,
    byWeekDays: [],
    until: null,
  });

  save() {
    if (this.form.invalid || !this.isRecurrenceValid) {
      this.form.markAllAsTouched();
      return;
    }
    this.calendarDataSource
      .create(this.form.value, this.recurrence())
      .subscribe(() => {});
  }

  close() {
    this.diagloRef.close();
  }

  onAllDayToggle() {
    if (this.isAllDay) {
      this.form.patchValue({ endDate: null });
    }
  }

  onFrequencyChange(freq: Frecuency) {
    this.recurrence.update((values) => ({
      ...values,
      frequency: freq,
      ...(freq === 'WEEKLY' && { byWeekDays: [] }),
    }));
  }

  onRecurringToggle(value: boolean) {
    if (!value) {
      this.recurrence.set({
        frequency: 'YEARLY',
        interval: 1,
        byWeekDays: [],
        until: null,
      });
    }
  }

  get isAllDay() {
    return this.form.value.allDay;
  }

  get isRecurrenceValid() {
    if (!this.isRecurring()) return true;
    return this.recurrence().frequency === 'WEEKLY'
      ? this.recurrence().byWeekDays.length > 0
      : true;
  }
}
