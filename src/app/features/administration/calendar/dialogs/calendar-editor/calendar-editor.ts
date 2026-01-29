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
    recurrence: this.formBuilder.group({
      frequency: [null],
      interval: [1, Validators.min(1)],
      byWeekDays: [[]],
      until: [null],
    }),
  });

  isRecurring = signal(false);

  save() {
    if (this.form.invalid) {
      return this.form.markAllAsTouched();
    }
    // this.calendarDataSource
    //   .create(this.form.value, this.recurrence())
    //   .subscribe(() => {});
  }

  close() {
    this.diagloRef.close();
  }

  onAllDayToggle() {
    if (this.isAllDay) {
      this.form.patchValue({ endDate: null });
    }
  }

  onRecurringToggle(isRecurring: boolean) {
    const recurrenceGroup = this.form.get('recurrence') as FormGroup;
    if (isRecurring) {
      recurrenceGroup.get('frequency')?.setValidators([Validators.required]);
    } else {
      recurrenceGroup.get('frequency')?.clearValidators();
      recurrenceGroup.get('byWeekDays')?.clearValidators();
      recurrenceGroup.reset({
        frequency: 'YEARLY',
        interval: 1,
        byWeekDays: [],
        until: null,
      });
    }
    recurrenceGroup.get('frequency')?.updateValueAndValidity();
    recurrenceGroup.get('byWeekDays')?.updateValueAndValidity();
  }

  onFrequencyChange(freq: Frecuency) {
    const recurrenceGroup = this.form.get('recurrence') as FormGroup;
    if (freq === 'WEEKLY') {
      recurrenceGroup
        .get('byWeekDays')
        ?.setValidators([Validators.required, Validators.minLength(1)]);
    } else {
      recurrenceGroup.get('byWeekDays')?.clearValidators();
    }
    recurrenceGroup.get('byWeekDays')?.updateValueAndValidity();
  }

  // onFrequencyChange(freq: Frecuency) {
  //   const control = this.form.get('recurrence.byWeekDays');
  //   if (!control) return;
  //   if (freq === 'WEEKLY') {
  //     control.setValidators([Validators.required, Validators.minLength(1)]);
  //   } else {
  //     control.clearValidators();
  //   }
  //   control.updateValueAndValidity();
  // }

  // onRecurringToggle(value: boolean) {
  //   const control = this.form.get('recurrence.frequency');
  //   if (!control) return;
  //   if (value) {
  //     control.setValidators(Validators.required);
  //   } else {
  //     control.clearValidators();
  //   }
  //   control.updateValueAndValidity();
  // }

  get isAllDay() {
    return this.form.get('allDay')?.value;
  }
}
