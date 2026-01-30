import {
  inject,
  signal,
  Component,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  FormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
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

const recurrenceValidator: ValidatorFn = (group: AbstractControl) => {
  // Si el grupo está deshabilitado, no validar
  if (group.disabled) return null;

  const freq: string | null = group.get('frequency')?.value;
  const days: string[] = group.get('byWeekDays')?.value;

  if (!freq) return null;

  if (freq === 'WEEKLY' && (!days || days.length === 0)) {
    return { weeklyRequiresDays: true };
  }

  return null;
};

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
export class CalendarEditor implements OnInit {
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

  readonly data: any = inject(DynamicDialogConfig).data;

  form: FormGroup = this.formBuilder.group({
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
  });

  isRecurring = signal(false);

  ngOnInit(): void {
    this.loadForm();
  }

  save() {
    if (this.form.invalid) {
      return this.form.markAllAsTouched();
    }
    this.calendarDataSource.create(this.form.value).subscribe(() => {});
  }

  close() {
    this.diagloRef.close();
  }

  onAllDayToggle() {
    if (this.isAllDay) {
      this.form.patchValue({ endDate: null });
    }
  }

  // onRecurringToggle(checked: boolean) {
  //   this.isRecurring.set(checked);
  //   const recurrenceGroup = this.form.get('recurrence');

  //   if (!checked) {
  //     recurrenceGroup?.disable();
  //   } else {
  //     recurrenceGroup?.enable();
  //   }
  // }

  onRecurringToggle(checked: boolean) {
    this.isRecurring.set(checked);
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

  get isAllDay() {
    return this.form.get('allDay')?.value;
  }

  private loadForm() {
    if (!this.data) return;
    const { recurrenceConfig, startDate, endDate, ...props } = this.data;
    if (recurrenceConfig) {
      this.isRecurring.set(true);
    }
    this.form.patchValue({
      ...props,
      startDate: new Date(startDate),
      ...(endDate && { endDate: new Date(endDate) }),
      recurrence: recurrenceConfig,
    });
  }
}
