import { ChangeDetectionStrategy, Component } from '@angular/core';

import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import dayGridPlugin from '@fullcalendar/daygrid';

@Component({
  selector: 'app--institutional-calendar.component',
  imports: [FullCalendarModule],
  templateUrl: './institutional-calendar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InstitutionalCalendarComponent {
  events: any[] = [
    {
      title: 'Capacitacion',
      start: new Date(),
      end: new Date(),
      color: 'e.color',
      url: undefined,
    },
  ];

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    locale: esLocale,
    events: this.events,
    eventClick: (info) => this.onEventClick(info),
  };

  constructor() {}

  ngOnInit() {}

  onEventClick(info: any) {
    // Podrías navegar al comunicado vinculado, si existe
    if (info.event.url) window.open(info.event.url, '_blank');
  }
}
