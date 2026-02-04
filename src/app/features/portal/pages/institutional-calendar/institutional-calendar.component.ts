import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';
import dayGridPlugin from '@fullcalendar/daygrid';
import { PortalService } from '../../services';

@Component({
  selector: 'app--institutional-calendar.component',
  imports: [FullCalendarModule],
  templateUrl: './institutional-calendar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InstitutionalCalendarComponent {
  private portalService = inject(PortalService);
  events: any[] = [];

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    locale: esLocale,

    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,listWeek',
    },

    nowIndicator: true,
    weekNumbers: true,
    height: 'auto',
    aspectRatio: 1.35,

    dayMaxEventRows: 3, // o true (auto). Ej: 2 o 3 suele verse bien
    moreLinkClick: 'popover', // abre popover con el resto

    eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },

  


    // ✅ FullCalendar pedirá eventos con el rango visible (start/end)
    events: (info, success, failure) => {
      this.portalService
        .getCalendarRange(info.startStr, info.endStr)
        .subscribe({
          next: (data) => {
            success(
              data.map((e) => ({
                id: e.id,
                title: e.title,
                start: e.start,
                end: e.end,
                allDay: e.allDay,
                extendedProps: {
                  parentId: e.parentId,
                  communicationId: e.communicationId,
                  description: e.description,
                  type: e.type,
                },
                backgroundColor:
                  e.color ?? (e.communicationId ? '#06b6d4' : '#3b82f6'),
                borderColor: e.color ?? (e.communicationId ? '#0284c7' : '#2563eb'),
                // si tu API manda url, lo puedes pasar aquí:
                // url: e.url,
              })),
            );
          },
          error: (err) => failure(err),
        });
    },

    eventClick: (info) => this.onEventClick(info),
  };

  constructor() {}

  ngOnInit() {}

  onEventClick(info: any) {
   
  }
}
