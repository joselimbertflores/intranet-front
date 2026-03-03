import {
  ChangeDetectionStrategy,
  Component,
  inject,
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

import { PortalCommunicationResponse } from '../../interfaces';
import { PortalCalendarDataSource } from '../../services';
@Component({
  selector: 'app--calendar-page',
  imports: [FullCalendarModule, PopoverModule],
  templateUrl: './calendar-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CalendarPage {
  private calendarDataSource = inject(PortalCalendarDataSource);
  calendarOptions: CalendarOptions;
  selectedEvent?: EventApi;
  dialogVisible = false;

  popoverRef = viewChild.required<Popover>('op');

  constructor() {
    this.calendarOptions = this.buildCalendarOptions();
  }

  openEventDialog(event: EventClickArg) {
    // this.selectedEvent = event;
    this.dialogVisible = true;
    this.popoverRef()?.toggle(event.jsEvent);
  }

  private fetchEventsForCalendar(
    range: EventSourceFuncArg,
    onSuccess: (events: PortalCommunicationResponse[]) => void,
    onError: (err: any) => void,
  ) {
    this.calendarDataSource.getEvents(range.startStr, range.endStr).subscribe({
      next: onSuccess,
      error: onError,
    });
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
        return this.fetchEventsForCalendar(info, success, failure);
      },
      eventClick: (info) => this.onEventClick(info),
    };
  }

  private onEventClick(info: EventClickArg): void {
    info.jsEvent.preventDefault();
    console.log(info.event);
    console.log(info.view);
    this.popoverRef().toggle(info.jsEvent, info.el);
  }
}
