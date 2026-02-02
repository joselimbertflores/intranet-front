import {
  inject,
  Component,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import {
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';

import { CalendarEventResponse } from '../../interfaces';
import { CalendarDataSource } from '../../services';
import { CalendarEventForm } from '../../components';
import { recurrenceValidator } from '../../helpers';

@Component({
  selector: 'app-calendar-editor',
  imports: [ReactiveFormsModule, ButtonModule, CalendarEventForm],
  templateUrl: './calendar-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarEditor implements OnInit {
  private formBuilder = inject(FormBuilder);
  private diagloRef = inject(DynamicDialogRef);

  private calendarDataSource = inject(CalendarDataSource);

  readonly currentDate = new Date();
  readonly data?: CalendarEventResponse = inject(DynamicDialogConfig).data;

  form: FormGroup = this.formBuilder.group({
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
  });

  ngOnInit(): void {
    this.loadForm();
  }

  save() {
    if (this.form.invalid) {
      return this.form.markAllAsTouched();
    }
    this.calendarDataSource.create(this.form.value).subscribe((resp) => {
      this.diagloRef.close(resp);
    });
  }

  close() {
    this.diagloRef.close();
  }

  private loadForm() {
    if (!this.data) return;
    const { recurrenceConfig, startDate, endDate, ...props } = this.data;
    this.form.patchValue({
      ...props,
      startDate: new Date(startDate),
      ...(endDate && { endDate: new Date(endDate) }),
      recurrence: recurrenceConfig,
    });
  }
}
