
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { SelectModule } from 'primeng/select';
import { FieldsetModule } from 'primeng/fieldset';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-calendar-dialog',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    DatePickerModule,
    CheckboxModule,
    SelectModule,
    FieldsetModule,
    MultiSelectModule,
    InputTextModule
],
  templateUrl: './calendar-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarDialogComponent {
  private formBuilder = inject(FormBuilder);
  private diagloRef = inject(DynamicDialogRef);

  eventForm: FormGroup = this.formBuilder.group({
    title: ['', Validators.required],
    description: [''],
    startDate: [null, Validators.required],
    endDate: [null],
    allDay: [false],
    recurrence: this.formBuilder.group({
      freq: [null], // DAILY, WEEKLY, MONTHLY, YEARLY
      interval: [1],
      byDay: [[]], // e.g. ["MO", "WE"]
      byMonth: [[]], // e.g. [3, 9]
      byMonthDay: [null], // e.g. 6
      until: [null],
      count: [null],
    }),
  });

  freqOptions = [
    { label: 'Sin recurrencia', value: null },
    { label: 'Diario', value: 'DAILY' },
    { label: 'Semanal', value: 'WEEKLY' },
    { label: 'Mensual', value: 'MONTHLY' },
    { label: 'Anual', value: 'YEARLY' },
  ];

  weekdays = [
    { label: 'Lunes', value: 'MO' },
    { label: 'Martes', value: 'TU' },
    { label: 'Miércoles', value: 'WE' },
    { label: 'Jueves', value: 'TH' },
    { label: 'Viernes', value: 'FR' },
    { label: 'Sábado', value: 'SA' },
    { label: 'Domingo', value: 'SU' },
  ];

  months = [
    { label: 'Enero', value: 1 },
    { label: 'Febrero', value: 2 },
    { label: 'Marzo', value: 3 },
    { label: 'Abril', value: 4 },
    { label: 'Mayo', value: 5 },
    { label: 'Junio', value: 6 },
    { label: 'Julio', value: 7 },
    { label: 'Agosto', value: 8 },
    { label: 'Septiembre', value: 9 },
    { label: 'Octubre', value: 10 },
    { label: 'Noviembre', value: 11 },
    { label: 'Diciembre', value: 12 },
  ];

  save() {}

  close() {
    this.diagloRef.close();
  }
}
