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

import { CalendarEventResponse } from '../../interfaces';
import { CalendarDataSource } from '../../services';
import { recurrenceValidator } from '../../helpers';
import { FormUtils } from '../../../../../helpers';

@Component({
  selector: 'app-calendar-editor',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './calendar-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarEditor implements OnInit {
  private formBuilder = inject(FormBuilder);
  // private diagloRef = inject(DynamicDialogRef);
  private calendarDataSource = inject(CalendarDataSource);

  readonly currentDate = new Date();
  // readonly data?: CalendarEventResponse = inject(DynamicDialogConfig).data;

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
    // const saveObservable = this.data?.id
    //   ? this.calendarDataSource.update(this.data.id, this.form.value)
    //   : this.calendarDataSource.create({
    //       ...this.form.value,
    //       communicationId: this.data?.communicationId,
    //     });

    // saveObservable.subscribe((resp) => {
    //   this.diagloRef.close(resp);
    // });
  }

  onAllDayToggle() {
    if (this.isAllDay) {
      this.form.patchValue({ endDate: null });
    }
  }

  close() {
    // this.diagloRef.close();
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
  //   if (!this.data) return;
  //   const { recurrenceConfig, startDate, endDate, ...props } = this.data;
  //   if (recurrenceConfig) this.isRecurring.set(true);
  //   setTimeout(() => {
  //     this.form.patchValue({
  //       ...props,
  //       ...(startDate && { startDate: new Date(startDate) }),
  //       ...(endDate && { endDate: new Date(endDate) }),
  //       recurrence: recurrenceConfig,
  //     });
  //   }, 0);
  }
}
