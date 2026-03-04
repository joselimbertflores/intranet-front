import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { EventApi, CalendarOptions, EventClickArg } from '@fullcalendar/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';

import { PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

import { PortalCalendarResponse } from '../../interfaces';
import { PortalCalendarDataSource } from '../../services';

@Component({
  selector: 'app--calendar-page',
  imports: [
    CommonModule,
    RouterModule,
    PopoverModule,
    ButtonModule,
    DialogModule,
    FullCalendarModule,
  ],
  templateUrl: './calendar-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CalendarPage {
  private calendarDataSource = inject(PortalCalendarDataSource);
  calendarOptions: CalendarOptions;

  selectedEvent = signal<EventApi | null>(null);
  displayDialog = signal(false);

  constructor() {
    this.calendarOptions = this.buildCalendarOptions();
  }

  private buildCalendarOptions(): CalendarOptions {
    return {
      plugins: [dayGridPlugin, interactionPlugin, listPlugin],
      initialView: 'dayGridMonth',
      locale: esLocale,
      firstDay: 1,
      fixedWeekCount: false,
      height: 'auto',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,listMonth',
      },
      eventTimeFormat: { hour: '2-digit', minute: '2-digit', meridiem: false },
      eventClassNames: 'cursor-pointer',
      // dayMaxEvents: 3,
      events: (info, success, failure) => {
        this.calendarDataSource
          .getEvents(info.startStr, info.endStr)
          .subscribe({
            next: (data) => {
              success(data.map((item) => this.mapToCalendarEvent(item)));
            },
            error: failure,
          });
      },
      eventClick: (info) => this.onEventClick(info),
    };
  }

  private onEventClick(info: EventClickArg): void {
    info.jsEvent.preventDefault();
    this.selectedEvent.set(info.event);
    this.displayDialog.set(true);
  }

  private mapToCalendarEvent(dto: PortalCalendarResponse) {
    return {
      id: dto.id,
      title: dto.title,
      start: dto.start,
      end: dto.end,
      allDay: dto.allDay,
      extendedProps: {
        description: dto.description,
        isRecurring: dto.isRecurring,
        communication: dto.communication,
      },
    };
  }
}
