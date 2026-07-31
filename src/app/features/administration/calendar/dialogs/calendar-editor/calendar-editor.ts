import { Component, computed, inject, signal } from '@angular/core';
import {
  form,
  FormField,
  FormRoot,
  maxLength,
  min,
  required,
  validate,
} from '@angular/forms/signals';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import {
  HlmDialogFooter,
  HlmDialogHeader,
  HlmDialogTitle,
} from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmTextarea } from '@spartan-ng/helm/textarea';
import { HlmToggleGroupImports } from '@spartan-ng/helm/toggle-group';
import { firstValueFrom } from 'rxjs';

import {
  CalendarEventResponse,
  RecurrenceFrequency,
  WeekDay,
} from '../../interfaces';
import { CalendarDataSource, SaveCalendarEventDto } from '../../services';

export interface CalendarEventEditorInitialValues {
  title?: string;
  description?: string;
  startDate?: Date | string;
}

export interface CalendarEventEditorContext {
  event?: CalendarEventResponse;
  communicationId?: string;
  initialValues?: CalendarEventEditorInitialValues;
}

interface RecurrenceConfigFormModel {
  frequency: RecurrenceFrequency | null;
  interval: number;
  byWeekDays: WeekDay[];
  until: Date | null;
}

interface CalendarEventFormModel {
  title: string;
  description: string;
  startDate: Date | null;
  endDate: Date | null;
  allDay: boolean;
  isActive: boolean;
  recurrenceConfig: RecurrenceConfigFormModel;
}

@Component({
  selector: 'app-calendar-event-editor',
  imports: [
    FormField,
    FormRoot,
    HlmButtonImports,
    HlmCheckbox,
    HlmDialogFooter,
    HlmDialogHeader,
    HlmDialogTitle,
    HlmFieldImports,
    HlmInputImports,
    HlmSelectImports,
    HlmSpinner,
    HlmTextarea,
    HlmToggleGroupImports,
  ],
  templateUrl: './calendar-editor.html',
  host: {
    class: 'flex max-h-[calc(100dvh-4rem)] min-h-0 flex-col',
  },
})
export class CalendarEventEditor {
  private readonly dialogRef =
    inject<BrnDialogRef<CalendarEventResponse>>(BrnDialogRef);
  private readonly calendarDataSource = inject(CalendarDataSource);
  private readonly context =
    injectBrnDialogContext<CalendarEventEditorContext>();

  readonly event = this.context.event;

  readonly communicationId =
    this.context.communicationId ?? this.event?.communicationId ?? null;

  readonly frequencies: ReadonlyArray<{
    label: string;
    value: RecurrenceFrequency;
  }> = [
    { label: 'Diaria', value: 'DAILY' },
    { label: 'Semanal', value: 'WEEKLY' },
    { label: 'Mensual', value: 'MONTHLY' },
    { label: 'Anual', value: 'YEARLY' },
  ];

  readonly frequencyNames = new Map(
    this.frequencies.map(({ label, value }) => [value, label]),
  );

  readonly weekDays: ReadonlyArray<{ label: string; value: WeekDay }> = [
    { label: 'Lun', value: 'MO' },
    { label: 'Mar', value: 'TU' },
    { label: 'Mié', value: 'WE' },
    { label: 'Jue', value: 'TH' },
    { label: 'Vie', value: 'FR' },
    { label: 'Sáb', value: 'SA' },
    { label: 'Dom', value: 'SU' },
  ];

  readonly formModel = signal<CalendarEventFormModel>(
    this.createInitialFormModel(),
  );

  readonly calendarForm = form(
    this.formModel,
    (schemaPath) => {
      validate(schemaPath.title, ({ value }) =>
        value().trim()
          ? null
          : {
              kind: 'required',
              message: 'El título es obligatorio.',
            },
      );
      maxLength(schemaPath.title, 150, {
        message: 'El título admite hasta 150 caracteres.',
      });

      required(schemaPath.startDate, {
        message: 'La fecha inicial es obligatoria.',
      });
      required(schemaPath.endDate, {
        message: 'La fecha final es obligatoria.',
      });
      validate(schemaPath.endDate, ({ value, valueOf }) => {
        const startDate = valueOf(schemaPath.startDate);
        const endDate = value();
        if (!startDate || !endDate) return null;

        const isValid = valueOf(schemaPath.allDay)
          ? endDate >= startDate
          : endDate > startDate;

        return isValid
          ? null
          : {
              kind: 'invalidDateRange',
              message: valueOf(schemaPath.allDay)
                ? 'La fecha final debe ser igual o posterior a la inicial.'
                : 'La fecha final debe ser posterior a la inicial.',
            };
      });

      min(schemaPath.recurrenceConfig.interval, 1, {
        message: 'El intervalo debe ser al menos 1.',
      });
      validate(schemaPath.recurrenceConfig.byWeekDays, ({ value, valueOf }) =>
        valueOf(schemaPath.recurrenceConfig.frequency) === 'WEEKLY' &&
        value().length === 0
          ? {
              kind: 'weeklyRequiresDays',
              message: 'Selecciona al menos un día de la semana.',
            }
          : null,
      );
      validate(schemaPath.recurrenceConfig.until, ({ value, valueOf }) => {
        const startDate = valueOf(schemaPath.startDate);
        const until = value();
        return startDate && until && until <= startDate
          ? {
              kind: 'invalidRecurrenceEnd',
              message: 'La fecha límite debe ser posterior a la inicial.',
            }
          : null;
      });
    },
    {
      submission: {
        action: async (formField) => {
          const payload = this.buildPayload(formField().value());
          const request = this.event
            ? this.calendarDataSource.update(this.event.id, payload)
            : this.calendarDataSource.create(payload);

          const response = await firstValueFrom(request);
          this.dialogRef.close(response);
        },
      },
    },
  );

  readonly isRecurring = computed(
    () => this.calendarForm.recurrenceConfig.frequency().value() !== null,
  );
  readonly isWeekly = computed(
    () => this.calendarForm.recurrenceConfig.frequency().value() === 'WEEKLY',
  );

  close(): void {
    if (!this.calendarForm().submitting()) {
      this.dialogRef.close();
    }
  }

  toggleRecurrence(enabled: boolean): void {
    this.formModel.update((value) => ({
      ...value,
      recurrenceConfig: enabled
        ? {
            ...value.recurrenceConfig,
            frequency: value.recurrenceConfig.frequency ?? 'DAILY',
          }
        : {
            frequency: null,
            interval: 1,
            byWeekDays: [],
            until: null,
          },
    }));
  }

  onAllDayChange(allDay: boolean): void {
    this.formModel.update((value) => ({
      ...value,
      allDay,
      startDate:
        allDay && value.startDate
          ? this.toLocalStartOfDay(value.startDate)
          : null,
      endDate:
        allDay && value.endDate
          ? this.toLocalStartOfDay(value.endDate)
          : null,
    }));
  }

  dateInputValue(value: Date | null): string {
    if (!value) return '';
    return [
      value.getFullYear(),
      String(value.getMonth() + 1).padStart(2, '0'),
      String(value.getDate()).padStart(2, '0'),
    ].join('-');
  }

  dateTimeInputValue(value: Date | null): string {
    if (!value) return '';
    const localDate = new Date(
      value.getTime() - value.getTimezoneOffset() * 60_000,
    );
    return localDate.toISOString().slice(0, 16);
  }

  updateEventDate(fieldName: 'startDate' | 'endDate', event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;
    const value = inputValue
      ? this.formModel().allDay
        ? this.parseDateInput(inputValue)
        : new Date(inputValue)
      : null;

    this.calendarForm[fieldName]().value.set(value);
  }

  updateRecurrenceUntil(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;
    const value = inputValue
      ? this.toLocalEndOfDay(this.parseDateInput(inputValue))
      : null;
    this.calendarForm.recurrenceConfig.until().value.set(value);
  }

  touchDate(fieldName: 'startDate' | 'endDate' | 'until'): void {
    if (fieldName === 'until') {
      this.calendarForm.recurrenceConfig.until().markAsTouched();
      return;
    }
    this.calendarForm[fieldName]().markAsTouched();
  }

  isFieldInvalid(fieldName: 'title' | 'startDate' | 'endDate'): boolean {
    const field = this.calendarForm[fieldName]();
    return field.touched() && field.errors().length > 0;
  }

  private createInitialFormModel(): CalendarEventFormModel {
    const startDate = this.initialStartDate();
    const allDay = this.event?.allDay ?? true;

    return {
      title: this.event?.title ?? this.context.initialValues?.title ?? '',
      description:
        this.event?.description ??
        this.context.initialValues?.description ??
        '',
      startDate: allDay ? this.toLocalStartOfDay(startDate) : startDate,
      endDate: this.initialEndDate(startDate),
      allDay,
      isActive: this.event?.isActive ?? true,
      recurrenceConfig: {
        frequency: this.event?.recurrenceConfig?.frequency ?? null,
        interval: this.event?.recurrenceConfig?.interval ?? 1,
        byWeekDays: this.event?.recurrenceConfig?.byWeekDays ?? [],
        until: this.event?.recurrenceConfig?.until
          ? new Date(this.event.recurrenceConfig.until)
          : null,
      },
    };
  }

  private initialStartDate(): Date {
    const value =
      this.event?.startDate ??
      this.context.initialValues?.startDate ??
      new Date();
    return typeof value === 'string' ? new Date(value) : value;
  }

  private initialEndDate(startDate: Date): Date {
    if (!this.event) return this.toLocalStartOfDay(startDate);

    const endDate = new Date(this.event.endDate);
    return this.event.allDay
      ? this.addCalendarDays(this.toLocalStartOfDay(endDate), -1)
      : endDate;
  }

  private buildPayload(value: CalendarEventFormModel): SaveCalendarEventDto {
    const { frequency, interval, byWeekDays, until } = value.recurrenceConfig;

    return {
      title: value.title.trim(),
      description: value.description.trim() || null,
      startDate: value.startDate!,
      endDate: value.allDay
        ? this.addCalendarDays(value.endDate!, 1)
        : value.endDate!,
      allDay: value.allDay,
      isActive: value.isActive,
      recurrence: frequency
        ? {
            frequency,
            interval,
            ...(frequency === 'WEEKLY' && { byWeekDays }),
            ...(until && { until }),
          }
        : null,
      ...(this.communicationId !== null && {
        communicationId: this.communicationId,
      }),
    };
  }

  private parseDateInput(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private toLocalStartOfDay(value: Date): Date {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  private toLocalEndOfDay(value: Date): Date {
    return new Date(
      value.getFullYear(),
      value.getMonth(),
      value.getDate(),
      23,
      59,
      59,
      999,
    );
  }

  private addCalendarDays(value: Date, days: number): Date {
    const result = new Date(value);
    result.setDate(result.getDate() + days);
    return result;
  }
}
