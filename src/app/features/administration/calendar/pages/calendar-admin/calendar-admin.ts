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

import { FullCalendarModule } from '@fullcalendar/angular';

import { CalendarEditor } from '../../dialogs';
import { CalendarDataSource } from '../../services';

@Component({
  selector: 'app-calendar-admin',
  imports: [CommonModule, ButtonModule, TableModule, FullCalendarModule],
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

  openCreateDialog() {
    const dialogRef = this.dialogService.open(CalendarEditor, {
      header: 'Crear evento',
      closable: true,
      width: '40vw',
      breakpoints: {
        '640px': '90vw',
      },
    });
    dialogRef?.onClose.subscribe((result) => {
      if (!result) return;
      // this.dataSize.update((values) => (values += 1));
      // this.dataSource.update((values) => [result, ...values]);
    });
  }

  openDialog(item?: any) {
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
    dialogRef?.onClose.subscribe((result?: any) => {
      if (!result) return;
      this.updateItemDataSource(result);
    });
  }

  private updateItemDataSource(item: any): void {
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
