import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import {
  EventApi,
  CalendarOptions,
  EventSourceFuncArg,
  EventClickArg,
} from '@fullcalendar/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';
import { Popover, PopoverModule } from 'primeng/popover';

import {
  PortalCalendarResponse,
  PortalCommunicationResponse,
} from '../../interfaces';
import { PortalCalendarDataSource } from '../../services';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app--calendar-page',
  imports: [CommonModule, RouterModule, FullCalendarModule, PopoverModule],
  templateUrl: './calendar-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CalendarPage {
  private calendarDataSource = inject(PortalCalendarDataSource);
  calendarOptions: CalendarOptions;

  selectedEvent = signal<EventApi | null>(null);
  popoverRef = viewChild.required<Popover>('op');

  constructor() {
    this.calendarOptions = this.buildCalendarOptions();
  }

  private buildCalendarOptions(): CalendarOptions {
    return {
      plugins: [dayGridPlugin, interactionPlugin, listPlugin],
      initialView: 'dayGridMonth',
      height: 'auto',
      locale: esLocale,
      firstDay: 1,
      fixedWeekCount: false,
      showNonCurrentDates: false,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,listMonth',
      },
      eventTimeFormat: { hour: '2-digit', minute: '2-digit' },
      dayMaxEvents: 3,
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
    this.popoverRef().toggle(info.jsEvent, info.el);
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
