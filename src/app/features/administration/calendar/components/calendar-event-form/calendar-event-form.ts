import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { InputNumber } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'calendar-event-form',
  imports: [
    ReactiveFormsModule,
    MultiSelectModule,
    FloatLabelModule,
    DatePickerModule,
    InputTextModule,
    CheckboxModule,
    TextareaModule,
    SelectModule,
    InputNumber,
  ],
  template: `
    <div [formGroup]="eventForm()">
      <div class="space-y-6 pt-2">
        <p-floatlabel variant="on">
          <input
            pInputText
            id="titleTxt"
            formControlName="title"
            class="w-full"
          />
          <label for="titleTxt">Titulo</label>
        </p-floatlabel>
        <p-floatlabel variant="on">
          <label for="referencTxt">Descripción</label>
          <textarea
            pTextarea
            id="referencTxt"
            formControlName="description"
            rows="2"
            class="w-full"
          ></textarea>
        </p-floatlabel>
        <div class="flex flex-col sm:flex-row gap-x-2">
          <p-floatlabel variant="on" class="w-full">
            <p-datepicker
              formControlName="startDate"
              [showTime]="!isAllDay"
              hourFormat="24"
              class="w-full"
              appendTo="body"
              inputId="startDatePicker"
            >
            </p-datepicker>
            <label for="startDatePicker">Inicio</label>
          </p-floatlabel>
          @if (!isAllDay) {
            <p-floatlabel variant="on" class="w-full">
              <p-datepicker
                formControlName="endDate"
                [showTime]="true"
                hourFormat="24"
                class="w-full"
                appendTo="body"
                inputId="endDatePicker"
              >
              </p-datepicker>
              <label for="endDatePicker">Fin</label>
            </p-floatlabel>
          }
        </div>
        <div class="flex gap-6 px-2">
          <div class="flex items-center">
            <p-checkbox
              inputId="allDayCheck"
              formControlName="allDay"
              [binary]="true"
              (onChange)="onAllDayToggle()"
            >
            </p-checkbox>
            <label for="allDayCheck" class="ml-1 font-medium"
              >Todo el día</label
            >
          </div>

          <div class="flex items-center">
            <p-checkbox
              inputId="recurrenceCheck"
              [binary]="true"
              [value]="isRecurring()"
              (onChange)="onRecurringToggle($event.checked)"
            >
            </p-checkbox>

            <label for="recurrenceCheck" class="ml-1 font-medium">
              Repetir
            </label>
          </div>
        </div>

        @if (isRecurring()) {
          <div formGroupName="recurrence">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <p-floatlabel variant="on">
                <p-select
                  inputId="frequencySelect"
                  [options]="frequencies"
                  formControlName="frequency"
                  [fluid]="true"
                  [required]="true"
                  appendTo="body"
                >
                </p-select>
                <label for="frequencySelect">Frecuencia</label>
              </p-floatlabel>
              <p-floatlabel variant="on">
                <p-inputNumber
                  [min]="1"
                  suffix=" vez / veces"
                  class="w-full"
                  inputId="intervalTxt"
                  formControlName="interval"
                />
                <label for="intervalTxt">Cada</label>
              </p-floatlabel>

              <p-floatlabel variant="on">
                <p-datepicker
                  formControlName="until"
                  dateFormat="yy-mm-dd"
                  class="w-full"
                  appendTo="body"
                  [showClear]="true"
                />
                <label for="untilDatePicker">Hasta</label>
              </p-floatlabel>

              @if (
                eventForm().get('recurrence.frequency')!.value === 'WEEKLY'
              ) {
                <p-floatlabel variant="on">
                  <p-multiselect
                    [options]="weekDays"
                    formControlName="byWeekDays"
                    class="w-full"
                    appendTo="body"
                    inputId="byWeekDaysSelect"
                  />
                  <label for="byWeekDaysSelect">Días de la semana</label>
                </p-floatlabel>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarEventForm {
  eventForm = input.required<FormGroup>();
  isRecurring = signal(false);

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

  onAllDayToggle() {
    if (this.isAllDay) {
      this.eventForm().patchValue({ endDate: null });
    }
  }

  onRecurringToggle(checked: boolean) {
    this.isRecurring.set(checked);
    const recurrenceGroup = this.eventForm().get('recurrence');

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
    return this.eventForm().get('allDay')?.value;
  }
}
