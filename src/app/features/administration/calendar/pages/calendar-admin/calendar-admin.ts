import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

import { DialogService } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';


import { CalendarEditor } from '../../dialogs';
import { CalendarDataSource } from '../../services';
import { CalendarEventResponse } from '../../interfaces';

@Component({
  selector: 'app-calendar-admin',
  imports: [CommonModule, ButtonModule, TableModule],
  templateUrl: './calendar-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CalendarAdmin {
  private dialogService = inject(DialogService);
  private calendarDataSource = inject(CalendarDataSource);

  limit = signal(10);
  index = signal(0);
  term = signal('');
  offset = computed(() => this.index() * this.limit());
  resource = rxResource({
    params: () => ({
      offset: this.offset(),
      limit: this.limit(),
      term: this.term(),
    }),
    stream: ({ params }) => this.calendarDataSource.findAll(),
  });

  dataSource = linkedSignal(() => {
    if (!this.resource.hasValue()) return [];
    return this.resource.value().events;
  });

  dataSize = linkedSignal(() => {
    if (!this.resource.hasValue()) return 0;
    return this.resource.value().total;
  });


  openEventDialog(item?: CalendarEventResponse) {
    const dialogRef = this.dialogService.open(CalendarEditor, {
      header: item ? 'Editar evento' : 'Crear evento',
      modal: true,
      draggable: false,
      closeOnEscape: true,
      closable: true,
      width: '40vw',
      data: item,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });
    dialogRef?.onClose.subscribe((result?: CalendarEventResponse) => {
      if (!result) return;
      this.updateItemDataSource(result);
    });
  }

  private updateItemDataSource(item: CalendarEventResponse): void {
    const index = this.dataSource().findIndex(({ id }) => item.id === id);
    if (index === -1) {
      this.dataSource.update((values) => [item, ...values]);
      this.dataSize.update((value) => (value += 1));
    } else {
      this.dataSource.update((values) => {
        values[index] = item;
        return [...values];
      });
    }
  }
}
